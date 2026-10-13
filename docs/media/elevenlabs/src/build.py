#!/usr/bin/env python3
"""Render the ElevenLabs setup illustrations: src/step-N.html -> ../step-N.png (1280 px wide).

    python3 docs/media/elevenlabs/src/build.py           # all steps
    python3 docs/media/elevenlabs/src/build.py 3 5       # only some

These are mock UI drawings, not screenshots: no real account data, fake key and voice ID.
Needs playwright + chromium (same as the rest of the kit) and internet for Google Fonts.
"""
import asyncio, sys
from pathlib import Path
from playwright.async_api import async_playwright

SRC = Path(__file__).resolve().parent
OUT = SRC.parent


async def main(only):
    pages = sorted(SRC.glob("step-*.html"), key=lambda p: int(p.stem.split("-")[1]))
    if only:
        pages = [p for p in pages if p.stem.split("-")[1] in only]
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        pg = await b.new_page(viewport={"width": 1280, "height": 300}, device_scale_factor=1)
        for p in pages:
            await pg.goto(p.as_uri())
            await pg.wait_for_function("window.READY===1", timeout=60000)
            out = OUT / f"{p.stem}.png"
            await pg.screenshot(path=str(out), full_page=True)
            print(out.relative_to(OUT.parents[2]))
        await b.close()

if __name__ == "__main__":
    if any(a in ("-h", "--help") for a in sys.argv[1:]):
        print(__doc__); sys.exit(0)
    asyncio.run(main(set(sys.argv[1:])))
