#!/usr/bin/env python3
"""Overlay the TikTok / FB-IG Reels UI zones on a 1080x1920 frame, so you can see what gets covered.

Measured from real posts (iPhone 1179x2556 screenshots, TikTok + Facebook Reels):
phones are taller than 9:16, so the app scales the video to fill the height and CROPS the
sides (~50 px each), then lays its own UI on top: header, the right-hand action column,
the account/caption/location block and promo button at the bottom.

    python3 scripts/mv-safezone.py frame.png                 # writes frame-safe.png
    python3 scripts/mv-safezone.py preview/f00000.jpg --out check.png

Red = covered by app UI or cropped off. Green box = SAFE for text and key visuals.
Blue band = where subtitles belong.
"""
from __future__ import annotations

import argparse
import subprocess
from pathlib import Path

# Union of TikTok and FB/IG Reels at 1080x1920 (video pixels).
SAFE = {"top": 250, "bottom": 1480, "left": 90, "right": 990}   # whole-frame safe box
RIGHT_RAIL = {"x": 880, "y": 950}        # action icons: x > 880 from y 950 down
SUB_BAND = {"y0": 1290, "y1": 1470, "x0": 150, "x1": 860}         # subtitles live here


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("frame")
    ap.add_argument("--out")
    a = ap.parse_args()
    out = a.out or str(Path(a.frame).with_name(Path(a.frame).stem + "-safe.png"))
    s, r, b = SAFE, RIGHT_RAIL, SUB_BAND
    red = "color=red@0.35:t=fill"
    boxes = [
        f"drawbox=x=0:y=0:w=1080:h={s['top']}:{red}",
        f"drawbox=x=0:y={s['bottom']}:w=1080:h={1920 - s['bottom']}:{red}",
        f"drawbox=x=0:y={s['top']}:w={s['left']}:h={s['bottom'] - s['top']}:{red}",
        f"drawbox=x={s['right']}:y={s['top']}:w={1080 - s['right']}:h={r['y'] - s['top']}:{red}",
        f"drawbox=x={r['x']}:y={r['y']}:w={1080 - r['x']}:h={s['bottom'] - r['y']}:{red}",
        f"drawbox=x={b['x0']}:y={b['y0']}:w={b['x1'] - b['x0']}:h={b['y1'] - b['y0']}:color=blue@0.6:t=4",
        f"drawbox=x={s['left']}:y={s['top']}:w={s['right'] - s['left']}:h={s['bottom'] - s['top']}:color=green@0.9:t=4",
    ]
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.frame, "-vf",
                    "scale=1080:1920," + ",".join(boxes), "-frames:v", "1", out], check=True)
    print(out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
