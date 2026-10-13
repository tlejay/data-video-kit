#!/usr/bin/env python3
"""Build sample.html (cover 1080x1920 + sticker strip below it) from lib.js + t4.js,
and optionally screenshot it.

    python3 build.py            # writes sample.html
    python3 build.py --shot     # also writes preview.jpg (needs playwright)
"""
import argparse, asyncio, os
H = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument("--shot", action="store_true")
a = ap.parse_args()
rd = lambda n: open(os.path.join(H, n), encoding="utf-8").read()
html = '''<!DOCTYPE html>
<html lang="th"><head><meta charset="utf-8"><title>Risograph template sample</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wdth,wght@62.5..100,100..900&family=Anton&display=block" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:1080px;height:2496px;overflow:hidden;background:#111}
svg{position:absolute;left:0}#cv{top:0}#st{top:1920px}text{font-family:'Noto Sans Thai',sans-serif}text{font-stretch:62.5%}.wide{font-stretch:100%}.lat{font-family:'Anton','Noto Sans Thai',sans-serif}</style></head>
<body><svg id="cv" width="1080" height="1920" viewBox="0 0 1080 1920"></svg><svg id="st" width="1080" height="576" viewBox="0 0 1080 576"></svg>
<script>''' + rd("lib.js") + '''</script><script>document.fonts.ready.then(()=>{''' + rd("t4.js") + ''';window.READY=1;});</script></body></html>'''
out = os.path.join(H, "sample.html"); open(out, "w", encoding="utf-8").write(html); print(out)
if a.shot:
    from playwright.async_api import async_playwright
    async def shot():
        async with async_playwright() as p:
            b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1080, "height": 2496})
            await pg.goto("file://" + out); await pg.wait_for_function("window.READY===1", timeout=60000)
            await pg.screenshot(path=os.path.join(H, "preview.jpg"), type="jpeg", quality=80); await b.close()
    asyncio.run(shot()); print(os.path.join(H, "preview.jpg"))
