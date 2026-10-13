#!/usr/bin/env python3
"""Write timeline.json + captions.srt from the narration clips (no guessing at times).

Input folder (one line of the script per scene):
    t1.txt .. tN.txt          narration as spoken (numbers as words)
    t1.mp3 .. tN.mp3          the voiced clips (tts-clip.py, or placeholder-voice.py)
    t1.cap.txt .. (optional)  caption chunks for that clip, one per line, digits allowed;
                              use "\\n" inside a line for a two-line caption.
                              Without it the whole tN.txt becomes one caption.

Caption chunk boundaries are snapped to the measured pauses in each clip (the same
analysis as mv-audio-analyze.py), so captions change where the voice actually breathes.

    python3 scripts/mv-timeline.py --dir work
    python3 scripts/mv-timeline.py --dir work --gap 0.5 --lead 0.5 --tail 3.5

Output timeline.json:
    T      {"t1": [0, 6.07], ...}   scene windows (a beat before each clip starts)
    START  {"t1": 0.5, ...}         clip start seconds (mv-mix.py places tN.mp3 here)
    NAR    [{"a": 0.5, "b": 2.6, "t": "caption"}, ...]
    SFX    [{"t": 6.07, "kind": "whoosh"}, ...]   draft cues; replace with the visual's real cues
    DUR    last clip end + tail (room for the end card)
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
_spec = importlib.util.spec_from_file_location("mv_audio_analyze", HERE / "mv-audio-analyze.py")
_aa = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_aa)


def srt_time(s: float) -> str:
    ms = int(round(s * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    sec, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{sec:02d},{ms:03d}"


def split_times(chunks, dur, gaps):
    """Boundaries for len(chunks)-1 cuts: the pause nearest each proportional position."""
    total = sum(len(c) for c in chunks) or 1
    cuts, acc, used = [], 0, set()
    for c in chunks[:-1]:
        acc += len(c)
        want = dur * acc / total
        cands = [g for g in gaps if g not in used and (not cuts or g > cuts[-1] + 0.4)]
        best = min(cands, key=lambda g: abs(g - want)) if cands else None
        if best is not None and abs(best - want) < max(1.2, dur * 0.25):
            used.add(best)
            cuts.append(best)
        else:
            cuts.append(round(want, 2))
    return cuts


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--dir", required=True)
    ap.add_argument("--lead", type=float, default=0.5, help="silence before the first clip")
    ap.add_argument("--gap", type=float, default=0.5, help="silence between clips")
    ap.add_argument("--pre", type=float, default=0.35, help="scene change this long before its clip")
    ap.add_argument("--tail", type=float, default=3.5, help="end card after the last clip")
    ap.add_argument("--srt", default="captions.srt")
    a = ap.parse_args()
    d = Path(a.dir)
    ids = sorted(int(m.group(1)) for p in d.iterdir() if (m := re.match(r"^t(\d+)\.mp3$", p.name)))
    if not ids:
        raise SystemExit(f"no t1.mp3 .. tN.mp3 in {d}")

    T, START, NAR, SFX = {}, {}, [], []
    t = a.lead
    for i in ids:
        k = f"t{i}"
        info = _aa.analyze(str(d / f"{k}.mp3"), 30)
        dur = info["dur"]
        cap = d / f"{k}.cap.txt"
        if cap.exists():
            chunks = [ln.strip().replace("\\n", "\n") for ln in cap.read_text(encoding="utf-8").splitlines() if ln.strip()]
        else:
            txt = d / f"{k}.txt"
            chunks = [txt.read_text(encoding="utf-8").strip()] if txt.exists() else [""]
        cuts = split_times(chunks, dur, info["gaps"])
        edges = [0.0] + cuts + [dur]
        for j, c in enumerate(chunks):
            NAR.append({"a": round(t + edges[j], 2), "b": round(t + edges[j + 1], 2), "t": c})
        START[k] = round(t, 2)
        t = t + dur + a.gap
    last_end = NAR[-1]["b"]
    DUR = round(last_end + a.tail, 2)
    keys = list(START)
    for n, k in enumerate(keys):
        a0 = 0 if n == 0 else round(START[k] - a.pre, 2)
        a1 = DUR if n == len(keys) - 1 else round(START[keys[n + 1]] - a.pre, 2)
        T[k] = [a0, a1]
        if n:
            SFX.append({"t": a0, "kind": "whoosh"})
    SFX.append({"t": round(last_end + 0.3, 2), "kind": "end"})
    tl = {"T": T, "START": START, "NAR": NAR, "SFX": SFX, "DUR": DUR}
    (d / "timeline.json").write_text(json.dumps(tl, ensure_ascii=False, indent=1), encoding="utf-8")
    with (d / a.srt).open("w", encoding="utf-8") as f:
        for n, c in enumerate(NAR, 1):
            f.write(f"{n}\n{srt_time(c['a'])} --> {srt_time(c['b'])}\n{c['t']}\n\n")
    print(f"wrote {d / 'timeline.json'} ({len(keys)} clips, {len(NAR)} captions, DUR {DUR}s) and {d / a.srt}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
