#!/usr/bin/env python3
"""Inline helpers.js, timeline.json, map.json and vid.js into index.html.

    python3 build.py              # writes index.html next to this file
    python3 build.py --out work/  # writes work/index.html

Run it after every edit; index.html is the file the renderer opens (Chromium blocks
fetch() on file:// pages, so everything is inlined).
"""
import argparse, json, os

H = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument("--out", default=H, help="folder for index.html")
ap.add_argument("--title", default="Data video")
a = ap.parse_args()
rd = lambda n: open(os.path.join(H, n), encoding="utf-8").read()
tl = json.loads(rd("timeline.json")); mp = rd("map.json").strip()
html = f'''<!DOCTYPE html>
<html lang="th"><head><meta charset="utf-8"><title>{a.title}</title>
<link href="https://fonts.googleapis.com/css2?family=Mitr:wght@400;500;600;700&display=block" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<style>*{{margin:0;padding:0;box-sizing:border-box}}html,body{{width:1080px;height:1920px;overflow:hidden;background:#fff}}
#stage{{position:absolute;left:0;top:0;width:1080px;height:1920px;overflow:hidden}}svg{{position:absolute;left:0;top:0}}text{{font-family:'Mitr',sans-serif}}
#cap{{position:absolute;left:150px;top:1290px;width:710px;height:180px;display:flex;align-items:center;justify-content:center;pointer-events:none}}
#pill{{font-family:'Mitr',sans-serif;background:rgba(26,26,26,.9);color:#fff;font-weight:600;font-size:46px;line-height:1.3;padding:10px 30px 14px;border-radius:30px;text-align:center;white-space:pre;border:4px solid #1A1A1A;box-shadow:6px 8px 0 rgba(0,0,0,.25);opacity:0}}
</style></head><body><div id="stage">
<svg id="sv" width="1080" height="1920" viewBox="0 0 1080 1920"><g id="world"></g><g id="hud"></g></svg>
<div id="cap"><div id="pill"></div></div></div>
<script>{rd("helpers.js")}</script>
<script>const TLD={json.dumps(tl, ensure_ascii=False)};const MAP={mp};</script>
<script>{rd("vid.js")}</script>
</body></html>'''
out = os.path.join(a.out, "index.html")
open(out, "w", encoding="utf-8").write(html)
print(out, len(html))
