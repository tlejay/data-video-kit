#!/usr/bin/env python3
"""Procedural background music for data videos (no API, no cost, no licence questions).

Generated music APIs need a paid plan, so this synthesises a calm marimba + pad bed:
four-chord loop, soft shaker, fade in/out, normalised with headroom for narration.

    python3 scripts/mv-music.py --dur 62 --out music.wav
    python3 scripts/mv-music.py --dur 70 --bpm 92 --mood minor --seed 3 --out music.wav

Moods: bright (Cmaj7 Am7 Fmaj7 G6, default), minor (Am7 Fmaj7 Cmaj7 Em7), warm (Fmaj7 G6 Em7 Am7).
mv-mix.py ducks it under the narration, so render it at full level here.
"""
from __future__ import annotations

import argparse
import wave

import numpy as np

SR = 44100
MOODS = {
    "bright": [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 64]],
    "minor": [[57, 60, 64, 67], [53, 57, 60, 64], [60, 64, 67, 71], [52, 55, 59, 62]],
    "warm": [[53, 57, 60, 64], [55, 59, 62, 64], [52, 55, 59, 62], [57, 60, 64, 67]],
}


def hz(m: int) -> float:
    return 440 * 2 ** ((m - 69) / 12)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--dur", type=float, required=True, help="seconds")
    ap.add_argument("--bpm", type=float, default=100)
    ap.add_argument("--mood", choices=sorted(MOODS), default="bright")
    ap.add_argument("--seed", type=int, default=7)
    ap.add_argument("--out", default="music.wav")
    a = ap.parse_args()
    rng = np.random.default_rng(a.seed)
    beat = 60 / a.bpm
    n = int(SR * a.dur)
    L = np.zeros(n)
    R = np.zeros(n)

    def add(buf, start, sig):
        i = int(start * SR)
        if i >= n:
            return
        j = min(n, i + len(sig))
        buf[i:j] += sig[: j - i]

    def marimba(f, d=0.6, amp=0.18):
        t = np.arange(int(SR * d)) / SR
        s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 30)
        return amp * s * np.exp(-t * 6) * np.minimum(1, t * 400)

    def pad(f, d, amp=0.05):
        t = np.arange(int(SR * d)) / SR
        s = sum(np.sin(2 * np.pi * f * k * (1 + 0.002 * dt) * t) / k for k in (1, 2, 3) for dt in (-1, 1))
        return amp * s * np.minimum(1, t / 1.2) * np.minimum(1, (d - t) / 1.2)

    chords = MOODS[a.mood]
    patt = [0, 2, 1, 3, 2, 1, 3, 2]
    bars = int(a.dur / (beat * 4)) + 1
    for b in range(0, bars, 2):
        ch = chords[(b // 2) % 4]
        t0 = b * 4 * beat
        for m in ch:
            p = pad(hz(m - 12), 8 * beat + 1.0)
            add(L, t0, p * 0.9)
            add(R, t0, p)
        for off, amp in ((0, 0.16), (4 * beat, 0.14)):
            bass = marimba(hz(ch[0] - 24), 1.5, amp)
            add(L, t0 + off, bass)
            add(R, t0 + off, bass)
        for k in range(16):
            if k % 8 in (3, 7) and k > 8:
                continue
            m = marimba(hz(ch[patt[k % 8]] + 12), 0.5, 0.07 if k % 2 else 0.1)
            tt = t0 + k * beat / 2
            add(L, tt, m * (0.7 if k % 2 else 1))
            add(R, tt, m * (1 if k % 2 else 0.7))
        for k in range(32):
            t = np.arange(int(SR * 0.06)) / SR
            nz = rng.standard_normal(len(t)) * np.exp(-t * 80) * (0.012 if k % 2 else 0.02)
            add(L, t0 + k * beat / 4, nz)
            add(R, t0 + k * beat / 4, nz)

    env = np.ones(n)
    fi, fo = int(SR * 1.5), int(SR * 4)
    env[:fi] = np.linspace(0, 1, fi)
    env[-fo:] = np.linspace(1, 0, fo)
    L *= env
    R *= env
    peak = max(abs(L).max(), abs(R).max()) * 1.12
    x = (np.stack([L / peak, R / peak], 1) * 32767).astype(np.int16)
    with wave.open(a.out, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(x.tobytes())
    print(f"wrote {a.out} ({a.dur:.1f} s, {a.bpm:g} BPM, {a.mood})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
