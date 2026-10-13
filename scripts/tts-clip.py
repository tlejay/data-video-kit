#!/usr/bin/env python3
"""Render narration clips with ElevenLabs (paid: every character costs credits).

    python3 scripts/tts-clip.py work/t1.txt work/t1.mp3     # one clip
    python3 scripts/tts-clip.py --dir work                 # every tN.txt -> tN.mp3
    python3 scripts/tts-clip.py --dir work --dry-run       # what it would cost, no API call

Config comes from the environment or the repo's .env (see .env.example):
ELEVENLABS_API_KEY or ELEVENLABS_API_KEYS (comma list, rotated by balance),
ELEVENLABS_VOICE_ID (any voice works), ELEVENLABS_MODEL_ID (default eleven_v4),
TTS_STABILITY / TTS_SIMILARITY / TTS_STYLE (default 0.25 / 0.75 / 0.75).

Identical text + identical settings is served from the local cache (.tts/cache), so
re-running after a caption edit costs nothing. --no-cache forces a fresh take.
Only run this after the script is approved: voicing is the expensive step.
Prints one JSON line per clip.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import tts_core  # noqa: E402
import tts_ledger  # noqa: E402


def clips_in(folder: Path):
    found = []
    for p in folder.iterdir():
        m = re.match(r"^t(\d+)\.txt$", p.name)
        if m:
            found.append((int(m.group(1)), p))
    return [p for _, p in sorted(found)]


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("text_file", nargs="?", help="UTF-8 text file with the narration for one clip")
    ap.add_argument("out", nargs="?", help="output mp3 (default: next to the text file)")
    ap.add_argument("--dir", help="render every tN.txt in this folder to tN.mp3")
    ap.add_argument("--force", action="store_true", help="with --dir: redo clips whose mp3 exists")
    ap.add_argument("--dry-run", action="store_true", help="print chars and cost, call nothing")
    ap.add_argument("--no-cache", action="store_true", help="always call the API")
    ap.add_argument("--style", type=float)
    ap.add_argument("--stability", type=float)
    a = ap.parse_args()

    if a.dir:
        jobs = [(p, p.with_suffix(".mp3")) for p in clips_in(Path(a.dir))]
        if not a.force:
            jobs = [(t, o) for t, o in jobs if not o.exists()]
    elif a.text_file:
        t = Path(a.text_file)
        jobs = [(t, Path(a.out) if a.out else t.with_suffix(".mp3"))]
    else:
        ap.print_help()
        return 1
    if not jobs:
        print("[tts] nothing to do (all clips exist; --force to redo)", file=sys.stderr)
        return 0

    c = tts_core.config(style=a.style, stability=a.stability)
    total = 0
    for txt, out in jobs:
        if not txt.exists():
            print(f"[tts] not found: {txt}", file=sys.stderr)
            return 1
        text = txt.read_text(encoding="utf-8").strip()
        if not text:
            print(f"[tts] empty: {txt}", file=sys.stderr)
            return 1
        est = tts_core.estimate(text)
        total += est["chars"]
        if a.dry_run:
            print(json.dumps({"text_file": str(txt), "mp3_path": str(out), **est,
                              "voice_id_set": bool(c["voice_id"]),
                              "keys_configured": len(tts_ledger.keys()),
                              "model": c["model_id"]}, ensure_ascii=False))
            continue
        data, voice, hit = tts_core.cached_render(text, use_cache=not a.no_cache,
                                                  style=a.style, stability=a.stability)
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes(data)
        print(json.dumps({"mp3_path": str(out), **est, "voice": voice, "cache_hit": hit,
                          "cost_estimate_usd": 0 if hit or not voice.startswith("elevenlabs")
                          else est["est_cost_usd"]}, ensure_ascii=False))
    if a.dry_run:
        print(f"[tts] dry run: {len(jobs)} clip(s), {total} chars, about "
              f"{total / tts_core.CHARS_PER_SEC:.0f} s, ~{total * tts_core.COST_PER_CHAR_USD:.2f} USD "
              f"(check one key has room: scripts/tts-quota.py --need {max(1, total)})", file=sys.stderr)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RuntimeError as e:
        print(f"[tts] {e}", file=sys.stderr)
        raise SystemExit(1)
