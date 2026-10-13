#!/usr/bin/env python3
"""Measure narration audio for the video pipeline: per-frame loudness envelope + pause points.

Claude cannot hear audio, so captions and visuals are timed from numbers instead.
The pauses (gaps) are where one spoken phrase ends and the next begins; map your
caption chunks onto them.

Usage:
  python3 scripts/mv-audio-analyze.py clip1.mp3 clip2.mp3 [--fps 30] [--out env.json]
Prints, per file: duration and gap times (seconds). Writes {name: {dur, env, gaps}}.
"""
import argparse, json, math, os, struct, subprocess

def analyze(path, fps, thresh=0.06, min_frames=4, sr=16000):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(sr),
                          "-f", "s16le", "-"], capture_output=True, check=True).stdout
    n = len(raw) // 2
    s = struct.unpack(f"<{n}h", raw)
    hop = sr // fps
    env = []
    for i in range(0, n, hop):
        seg = s[i:i + hop]
        env.append(math.sqrt(sum(x * x for x in seg) / max(1, len(seg))) / 32768)
    peak = max(env) or 1
    env = [round(min(1, e / peak), 3) for e in env]
    gaps, run = [], 0
    for i, e in enumerate(env):
        if e < thresh:
            run += 1
        else:
            if run >= min_frames and i - run > 0:
                gaps.append(round((i - run / 2) / fps, 2))
            run = 0
    return {"dur": round(n / sr, 2), "env": env, "gaps": gaps}

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("files", nargs="+")
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--out", default="env.json")
    a = ap.parse_args()
    out = {}
    for f in a.files:
        key = os.path.splitext(os.path.basename(f))[0]
        out[key] = analyze(f, a.fps)
        print(f"{key}: {out[key]['dur']}s  gaps={out[key]['gaps']}")
    json.dump(out, open(a.out, "w"))
    print(f"-> {a.out}")

if __name__ == "__main__":
    main()
