#!/usr/bin/env python3
"""Render a code-driven motion video (HTML frames -> MP4) for the motion-video skill.

The HTML page must define  window.render(t)  that draws the frame for time t
(seconds) deterministically. This script screenshots every frame in headless
Chromium (Playwright), then muxes the frames with audio clips placed at offsets.

Usage:
  # stills first, read them before rendering everything
  python3 scripts/mv-render.py --html work/index.html --duration 64.5 --preview 1,6,16,30
  # full render
  python3 scripts/mv-render.py --html work/index.html --duration 64.5 \
      --audio work/n1.mp3@0.4 --audio work/sample.mp3@25.6 --out work/final.mp4
Writes final.mp4 (crf 20) and final-small.mp4 (crf 27, for chat apps' upload limits).
With one premixed track (mv-mix.py), pass --audio mix.m4a@0.
Needs: ffmpeg, and Playwright with Chromium (pip install playwright && python3 -m playwright install chromium).
"""
import argparse, asyncio, os, shutil, subprocess

async def shoot(html, times, outdir, w, h, quality=90):
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        raise SystemExit("playwright is missing: pip install playwright && python3 -m playwright install chromium")
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": w, "height": h})
        await pg.goto("file://" + os.path.abspath(html))
        await pg.wait_for_load_state("networkidle")
        await pg.evaluate("document.fonts.ready")
        paths = []
        for i, t in enumerate(times):
            await pg.evaluate(f"render({t})")
            path = os.path.join(outdir, f"f{i:05d}.jpg")
            await pg.screenshot(path=path, type="jpeg", quality=quality)
            paths.append(path)
        await b.close()
        return paths

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--html", required=True)
    ap.add_argument("--duration", type=float, required=True)
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--size", default="1080x1920", help="WxH, default vertical 9:16")
    ap.add_argument("--audio", action="append", default=[], help="file.mp3@offset_seconds")
    ap.add_argument("--preview", help="comma-separated times: render stills + contact sheet only")
    ap.add_argument("--out", default="final.mp4")
    a = ap.parse_args()
    w, h = map(int, a.size.split("x"))
    work = os.path.dirname(os.path.abspath(a.html))

    if a.preview:
        times = [float(x) for x in a.preview.split(",")]
        d = os.path.join(work, "preview"); shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
        paths = asyncio.run(shoot(a.html, times, d, w, h))
        sheet = os.path.join(work, "contact.jpg")
        ins = sum([["-i", p] for p in paths], [])
        subprocess.run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex",
                        f"hstack={len(paths)},scale={min(2400, 300 * len(paths))}:-1", sheet], check=True)
        print(f"contact sheet -> {sheet}  (Read it before the full render)")
        return

    frames = os.path.join(work, "frames"); shutil.rmtree(frames, ignore_errors=True); os.makedirs(frames)
    n = int(a.duration * a.fps)
    asyncio.run(shoot(a.html, [i / a.fps for i in range(n)], frames, w, h))
    print(f"{n} frames rendered")

    cmd = ["ffmpeg", "-v", "error", "-y", "-framerate", str(a.fps), "-i", os.path.join(frames, "f%05d.jpg")]
    filt, labels = [], []
    for k, spec in enumerate(a.audio, start=1):
        f, off = spec.rsplit("@", 1)
        ms = int(float(off) * 1000)
        cmd += ["-i", f]
        filt.append(f"[{k}]adelay={ms}|{ms}[a{k}]"); labels.append(f"[a{k}]")
    if labels:
        filt.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0,apad[m]")
        cmd += ["-filter_complex", ";".join(filt), "-map", "0:v", "-map", "[m]"]
    cmd += ["-t", str(a.duration), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20",
            "-preset", "medium", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", a.out]
    subprocess.run(cmd, check=True)
    small = a.out.replace(".mp4", "-small.mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.out, "-c:v", "libx264", "-crf", "27",
                    "-preset", "slow", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k",
                    "-movflags", "+faststart", small], check=True)
    for f in (a.out, small):
        print(f"{f}  {os.path.getsize(f) / 1e6:.1f} MB")

if __name__ == "__main__":
    main()
