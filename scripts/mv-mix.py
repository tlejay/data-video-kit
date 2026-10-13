#!/usr/bin/env python3
"""Mix narration + ducked music + sound effects from one timeline.json.

timeline.json (written per video by mv-timeline.py or by hand, see docs/PIPELINE.md):
    {"DUR": 70.0,
     "START": {"b1": 0.5, "b2": 8.55, ...},      # clip name -> start second; <dir>/<name>.mp3
     "SFX": [{"t": 10.0, "kind": "burst"}, ...]} # kind -> <sfx-dir>/sfx-<kind>.mp3

    python3 scripts/mv-mix.py --dir work --music work/music.wav --out work/mix.m4a
    python3 scripts/mv-mix.py --dir $S/vid --music music.wav --cues cues.json   # visual's real SFX_CUES

Music sits at --music-vol and is sidechain-ducked under the voice; the result is
loudness-normalised to -16 LUFS (social video). Feed the m4a to mv-render.py --audio mix.m4a@0.
"""
from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path

SFX_DIR = Path(__file__).resolve().parent.parent / "sfx"
VOL = {"pop": 0.45, "burst": 0.5, "highlight": 0.5, "whoosh": 0.35, "end": 0.55}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--dir", required=True, help="folder with timeline.json and the narration mp3s")
    ap.add_argument("--music", help="music file (mv-music.py output); omit for voice + SFX only")
    ap.add_argument("--music-vol", type=float, default=0.32)
    ap.add_argument("--cues", help="JSON list of {t, kind} overriding timeline SFX")
    ap.add_argument("--sfx-dir", default=str(SFX_DIR))
    ap.add_argument("--out", default="mix.m4a")
    a = ap.parse_args()
    d = Path(a.dir)
    tl = json.loads((d / "timeline.json").read_text())
    dur = float(tl["DUR"])
    cues = json.loads(Path(a.cues).read_text()) if a.cues else tl.get("SFX", [])

    inp, f = [], []
    names = list(tl["START"])
    for i, k in enumerate(names):
        ms = int(tl["START"][k] * 1000)
        inp += ["-i", str(d / f"{k}.mp3")]
        f.append(f"[{i}:a]adelay={ms}|{ms},aformat=channel_layouts=stereo[v{i}]")
    f.append("".join(f"[v{i}]" for i in range(len(names)))
             + f"amix=inputs={len(names)}:normalize=0,apad,atrim=0:{dur}[voice]")
    bus = []
    nxt = len(names)
    if a.music:
        f.append("[voice]asplit=2[vo][sc]")
        inp += ["-i", a.music]
        f.append(f"[{nxt}:a]atrim=0:{dur},afade=t=out:st={max(0, dur - 3.5)}:d=3.5,volume={a.music_vol}[mus]")
        f.append("[mus][sc]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=500[duck]")
        bus += ["[vo]", "[duck]"]
        nxt += 1
    else:
        bus.append("[voice]")
    for j, c in enumerate(cues):
        src = Path(a.sfx_dir) / f"sfx-{c['kind']}.mp3"
        if not src.exists():
            raise SystemExit(f"no sound for kind {c['kind']!r}: {src}")
        ms = int(float(c["t"]) * 1000)
        inp += ["-i", str(src)]
        f.append(f"[{nxt + j}:a]volume={VOL.get(c['kind'], 0.45)},adelay={ms}|{ms},aformat=channel_layouts=stereo[s{j}]")
        bus.append(f"[s{j}]")
    f.append("".join(bus) + f"amix=inputs={len(bus)}:normalize=0,atrim=0:{dur},"
             "loudnorm=I=-16:TP=-1.5:LRA=11[out]")
    subprocess.run(["ffmpeg", "-y", "-v", "error", *inp, "-filter_complex", ";".join(f),
                    "-map", "[out]", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", a.out], check=True)
    print(f"wrote {a.out} ({dur:.1f} s, {len(names)} clips, {len(cues)} sfx, music={'on' if a.music else 'off'})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
