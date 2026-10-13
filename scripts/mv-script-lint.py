#!/usr/bin/env python3
"""mv-script-lint.py — lint a Thai narration script for the data-video skill.

Usage:
    python3 scripts/mv-script-lint.py <folder_or_script.json> [--audio-seconds N]

Input:
    folder   — contains t1.txt .. tN.txt (sorted by number)
    .json    — {"t1": "...", "t2": "..."} or {"lines": ["...", ...]} or list of strings

Checks (each PASS / WARN / FAIL):
  1 hero-numbers  : digit groups + Thai number word combos per minute; WARN > 3/min ([trial] rule)
  2 but-count     : standalone แต่ (not แต่ง / แต่ละ) total; FAIL > 1
  3 first-line    : must not start with ถ้า or a greeting; FAIL if it does
  4 mispronounce  : words from the 'Words the voice mispronounces' table in docs/VOICE.md; FAIL if found
  5 hook-question : '?' in line 1 must be answered in the same line; WARN if not
  6 punct         : em dash (—) or middle dot (·); FAIL if found

Exit 1 on any FAIL.  Exit 0 when all checks are PASS or WARN only.
"""

import argparse
import json
import os
import re
import subprocess
import sys
from typing import List, Optional, Tuple

_CHARS_PER_SEC = 12  # measured on a real Thai narration: 619 chars ≈ 52 s

# Maximal run of consecutive Thai number words → counted as ONE hero number.
# Digit sequences (\d+) are also one hero number each.
_NUM_WORDS_ALT = (
    r"หนึ่ง|สอง|สาม|สี่|ห้า|หก|เจ็ด|แปด|เก้า|สิบ"
    r"|ร้อย|พัน|หมื่น|แสน|ล้าน|เปอร์เซ็นต์"
)
_HERO_PAT = r"(?:\d+|(?:" + _NUM_WORDS_ALT + r")+)"
_HERO_RE = re.compile(_HERO_PAT)

# Ratio: two hero numbers linked by ใน / ในทุก / จาก (within a short span)
# → counts as ONE idea, not two.  Example: "แปดในสิบ", "เก้าหัวในไทย หนึ่งหัว"
_RATIO_RE = re.compile(
    _HERO_PAT + r"[^\n]{0,10}(?:ในทุก|จาก|ใน)[^\n]{0,10}" + _HERO_PAT
)

# Standalone แต่: not followed by ง (แต่ง) or ละ (แต่ละ)
_BUT_RE = re.compile(r"แต่(?!ง|ละ)")

# Em dash U+2014 or middle dot U+00B7
_PUNCT_BAD_RE = re.compile(r"[—·]")

_BAD_OPENERS = ("ถ้า", "สวัสดี", "วันนี้จะพา", "วันนี้เราจะ")

# Thai combining vowel/tone marks (written after the initial consonant of a syllable).
# If one immediately follows a mispronounce-word match, the last char of the match is
# an initial consonant of the NEXT syllable, so the match is cross-syllable (false positive).
# Example: "ประกอบกับ" → "บก" matched at positions 5-6, but line[7]="ั" (sara a) → reject.
_THAI_COMBINING = re.compile(r"[ัิ-ฺ็-๎]")


# ---------------------------------------------------------------------------
# Input loading
# ---------------------------------------------------------------------------

def _load_lines(path: str) -> Tuple[List[str], str]:
    """Return (lines, display_label).

    Accepts a folder of t1.txt..tN.txt or a script.json file.
    """
    if os.path.isdir(path):
        entries = []
        for fn in os.listdir(path):
            m = re.match(r"^t(\d+)\.txt$", fn)
            if m:
                entries.append((int(m.group(1)), fn))
        entries.sort()
        lines = []
        for _, fn in entries:
            with open(os.path.join(path, fn), encoding="utf-8") as f:
                lines.append(f.read().strip())
        return lines, path

    # JSON file
    with open(path, encoding="utf-8") as f:
        data = json.load(f)

    if isinstance(data, list):
        lines = []
        for item in data:
            if isinstance(item, str):
                lines.append(item)
            elif isinstance(item, dict):
                lines.append(str(item.get("text") or item.get("line") or ""))
        return lines, path

    if isinstance(data, dict):
        if "lines" in data:
            return [str(x) for x in data["lines"]], path
        # {t1: "...", t2: "..."}
        def _key_order(k):  # type: ignore
            m = re.match(r"^t(\d+)$", k)
            return int(m.group(1)) if m else 9999
        keys = sorted(data.keys(), key=_key_order)
        return [str(data[k]) for k in keys], path

    raise ValueError("Unrecognised script.json shape: %s" % type(data))


# ---------------------------------------------------------------------------
# Mispronunciation word list
# ---------------------------------------------------------------------------

def _load_mispr_words(voice_md_path: str) -> List[str]:
    """Parse column 1 of the 'Words the voice mispronounces' table."""
    words = []
    if not os.path.exists(voice_md_path):
        return words
    with open(voice_md_path, encoding="utf-8") as f:
        content = f.read()
    sec = re.search(r"Words the voice mispronounces", content)
    if not sec:
        return words
    section = content[sec.start():]
    for line in section.splitlines():
        stripped = line.strip()
        if not stripped.startswith("|"):
            continue
        cols = [c.strip() for c in stripped.split("|")]
        cols = [c for c in cols if c]
        if not cols:
            continue
        col1 = cols[0]
        if re.match(r"^[-:\s]+$", col1):  # separator row
            continue
        if col1.lower() in ("word", "คำ"):  # header
            continue
        for part in re.split(r"[,()\[\]]", col1):
            w = part.strip()
            if w:
                words.append(w)
    return words


# ---------------------------------------------------------------------------
# Mispronunciation word-boundary check
# ---------------------------------------------------------------------------

def _mispr_in_line(word: str, line: str) -> bool:
    """True if word appears in line NOT immediately followed by a Thai combining mark.

    Combining marks (sara a, sara i-uu, mai tai khu, tone marks) written after a consonant
    mean that consonant is the INITIAL of a new syllable, so the match spans two morphemes.
    E.g. "บก" in "ประกอบกับ": line[end]="ั" (sara a) → reject (cross-syllable false positive).
    """
    idx = 0
    while True:
        pos = line.find(word, idx)
        if pos == -1:
            return False
        end = pos + len(word)
        if end >= len(line) or not _THAI_COMBINING.match(line[end]):
            return True
        idx = pos + 1


# ---------------------------------------------------------------------------
# Hero-number counting with ratio merging
# ---------------------------------------------------------------------------

def _count_hero_numbers(text: str) -> Tuple[int, List[str]]:
    """Count hero numbers; X ใน/ในทุก/จาก Y spans count as ONE each."""
    ratio_spans = []
    ratio_labels = []
    for m in _RATIO_RE.finditer(text):
        ratio_spans.append((m.start(), m.end()))
        ratio_labels.append(m.group())

    standalone = []
    for m in _HERO_RE.finditer(text):
        if not any(rs <= m.start() and m.end() <= re_ for rs, re_ in ratio_spans):
            standalone.append(m.group())

    return len(ratio_spans) + len(standalone), ratio_labels + standalone


# ---------------------------------------------------------------------------
# Audio duration from mp3 files
# ---------------------------------------------------------------------------

def _audio_seconds_from_mp3s(folder: str) -> Optional[float]:
    """Sum tN.mp3 durations via ffprobe. Returns None if any file missing or ffprobe fails."""
    entries = []
    for fn in os.listdir(folder):
        m = re.match(r"^t(\d+)\.txt$", fn)
        if m:
            entries.append(int(m.group(1)))
    if not entries:
        return None
    entries.sort()
    total = 0.0
    for n in entries:
        mp3 = os.path.join(folder, "t%d.mp3" % n)
        if not os.path.exists(mp3):
            return None
        try:
            r = subprocess.run(
                ["ffprobe", "-v", "error", "-show_entries", "format=duration",
                 "-of", "csv=p=0", mp3],
                capture_output=True, text=True, timeout=5,
            )
            total += float(r.stdout.strip())
        except Exception:
            return None
    return total if total > 0 else None


# ---------------------------------------------------------------------------
# Main lint function
# ---------------------------------------------------------------------------

def lint(
    path: str,
    audio_seconds: Optional[float] = None,
    voice_md: Optional[str] = None,
) -> int:
    """Run all checks and print results.  Returns exit code (0 or 1)."""
    lines, label = _load_lines(path)
    if not lines:
        print("SKIP  no lines found")
        return 0

    if voice_md is None:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        repo_root = os.path.dirname(script_dir)
        voice_md = os.path.join(repo_root, "docs", "VOICE.md")

    mispr_words = _load_mispr_words(voice_md)

    total_chars = sum(len(ln) for ln in lines)
    if audio_seconds is not None:
        total_secs = audio_seconds
        dur_note = "(manual)"
    elif os.path.isdir(path):
        measured = _audio_seconds_from_mp3s(path)
        if measured is not None:
            total_secs = measured
            dur_note = "(ffprobe)"
        else:
            total_secs = total_chars / _CHARS_PER_SEC
            dur_note = "(est. %d chars/s)" % _CHARS_PER_SEC
    else:
        total_secs = total_chars / _CHARS_PER_SEC
        dur_note = "(est. %d chars/s)" % _CHARS_PER_SEC
    total_mins = total_secs / 60.0

    full_text = "\n".join(lines)
    fails = 0
    warns = 0
    results = []

    # ------------------------------------------------------------------
    # Check 1: hero numbers per minute  [trial rule → WARN not FAIL]
    # ------------------------------------------------------------------
    num_count, all_num_labels = _count_hero_numbers(full_text)
    rate = num_count / total_mins if total_mins > 0 else 0.0
    if rate > 3:
        results.append(
            "WARN  [1] hero-numbers: %d numbers in %.1fs = %.1f/min (limit 3/min)"
            " — %s" % (num_count, total_secs, rate, all_num_labels)
        )
        warns += 1
    else:
        results.append(
            "PASS  [1] hero-numbers: %d in %.1fs = %.1f/min — %s"
            % (num_count, total_secs, rate, all_num_labels)
        )

    # ------------------------------------------------------------------
    # Check 2: standalone แต่ count
    # ------------------------------------------------------------------
    but_matches = _BUT_RE.findall(full_text)
    but_count = len(but_matches)
    but_lines = ["t%d" % (i + 1) for i, ln in enumerate(lines) if _BUT_RE.search(ln)]
    if but_count > 1:
        results.append(
            "FAIL  [2] but-count: แต่ appears %d times (limit 1) at %s"
            % (but_count, ", ".join(but_lines))
        )
        fails += 1
    else:
        results.append("PASS  [2] but-count: แต่ appears %d time(s)" % but_count)

    # ------------------------------------------------------------------
    # Check 3: first line must not start with banned opener
    # ------------------------------------------------------------------
    first = lines[0]
    bad_opener = next((s for s in _BAD_OPENERS if first.startswith(s)), None)
    if bad_opener:
        results.append(
            "FAIL  [3] first-line: starts with banned opener '%s'" % bad_opener
        )
        fails += 1
    else:
        results.append("PASS  [3] first-line: opener ok")

    # ------------------------------------------------------------------
    # Check 4: mispronunciation words
    # ------------------------------------------------------------------
    mispr_hits = []
    for word in mispr_words:
        for i, ln in enumerate(lines):
            if _mispr_in_line(word, ln):
                mispr_hits.append("'%s' in t%d" % (word, i + 1))
    if mispr_hits:
        results.append("FAIL  [4] mispronounce: %s" % "; ".join(mispr_hits))
        fails += 1
    else:
        checked = ("checked %d word(s)" % len(mispr_words)) if mispr_words else "table empty"
        results.append("PASS  [4] mispronounce: none found (%s)" % checked)

    # ------------------------------------------------------------------
    # Check 5: question in first line answered in same line
    # ------------------------------------------------------------------
    if "?" in first:
        last_q = first.rfind("?")
        after = first[last_q + 1:].strip()
        if after:
            results.append("PASS  [5] hook-question: '?' in line 1 is answered in same line")
        else:
            results.append(
                "WARN  [5] hook-question: line 1 ends with '?' but no answer follows"
            )
    else:
        results.append("PASS  [5] hook-question: no '?' in line 1")

    # ------------------------------------------------------------------
    # Check 6: em dash or middle dot
    # ------------------------------------------------------------------
    punct_hits = []
    for i, ln in enumerate(lines):
        found = _PUNCT_BAD_RE.findall(ln)
        if found:
            punct_hits.append("t%d: %s" % (i + 1, found))
    if punct_hits:
        results.append("FAIL  [6] punct: %s" % "; ".join(punct_hits))
        fails += 1
    else:
        results.append("PASS  [6] punct: no em dash or middle dot")

    # ------------------------------------------------------------------
    # Output
    # ------------------------------------------------------------------
    print("mv-script-lint  %s" % label)
    print("  %d lines  %d chars  ~%.1fs %s" % (len(lines), total_chars, total_secs, dur_note))
    print()
    for r in results:
        print("  " + r)
    print()
    if fails:
        warn_part = ("  %d warn(s)" % warns) if warns else ""
        print("  %d FAIL(s)%s — exit 1" % (fails, warn_part))
        return 1
    elif warns:
        print("  %d warn(s), no FAILs — exit 0" % warns)
        return 0
    else:
        print("  all PASS — exit 0")
        return 0


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        "path",
        help="Folder with t1.txt..tN.txt or a script.json file",
    )
    parser.add_argument(
        "--audio-seconds",
        type=float,
        default=None,
        help="Actual audio duration in seconds (else tN.mp3 durations, else estimated at 12 Thai chars/s)",
    )
    parser.add_argument(
        "--voice-doc",
        default=None,
        help="Markdown file holding the mispronunciation table (default docs/VOICE.md)",
    )
    args = parser.parse_args()
    sys.exit(lint(args.path, audio_seconds=args.audio_seconds, voice_md=args.voice_doc))


if __name__ == "__main__":
    main()
