#!/usr/bin/env python3
"""Free stand-in narration: tN.txt -> tN.mp3 without any paid API.

Use it to time a draft, test the mixer and render, or try the example, before spending
TTS credits. Replace the files with real takes (tts-clip.py) once the script is approved,
then re-run mv-timeline.py: real clips have different lengths.

    python3 scripts/placeholder-voice.py --dir examples/quickstart/work
    python3 scripts/placeholder-voice.py --dir work --engine silence

Engines:
  say      macOS text-to-speech (Thai voice "Kanya" if installed, see `say -v '?'`)
  espeak   espeak-ng on Linux (`espeak-ng -v th`)
  silence  a silent clip as long as the text would take (~12 Thai chars per second)
  auto     say, else espeak, else silence (default)
"""
from __future__ import annotations

import argparse
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

CHARS_PER_SEC = 12


def to_mp3(src: str, out: Path) -> None:
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-ac", "1", "-ar", "44100",
                    "-b:a", "128k", str(out)], check=True)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--dir", required=True)
    ap.add_argument("--engine", choices=["auto", "say", "espeak", "silence"], default="auto")
    ap.add_argument("--voice", default="Kanya", help="macOS voice for --engine say")
    ap.add_argument("--rate", type=int, default=170, help="words per minute for say")
    a = ap.parse_args()
    eng = a.engine
    if eng == "auto":
        eng = "say" if shutil.which("say") else "espeak" if shutil.which("espeak-ng") else "silence"
    d = Path(a.dir)
    files = sorted((p for p in d.iterdir() if re.match(r"^t\d+\.txt$", p.name)),
                   key=lambda p: int(p.stem[1:]))
    if not files:
        raise SystemExit(f"no t1.txt .. tN.txt in {d}")
    for txt in files:
        text = txt.read_text(encoding="utf-8").strip()
        out = txt.with_suffix(".mp3")
        with tempfile.TemporaryDirectory() as tmp:
            if eng == "say":
                aiff = f"{tmp}/v.aiff"
                subprocess.run(["say", "-v", a.voice, "-r", str(a.rate), "-o", aiff, text], check=True)
                to_mp3(aiff, out)
            elif eng == "espeak":
                wav = f"{tmp}/v.wav"
                subprocess.run(["espeak-ng", "-v", "th", "-w", wav, text], check=True)
                to_mp3(wav, out)
            else:
                secs = max(1.0, len(text) / CHARS_PER_SEC)
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i",
                                "anullsrc=r=44100:cl=mono", "-t", f"{secs:.2f}", "-b:a", "128k",
                                str(out)], check=True)
        print(f"{out}  ({eng})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
