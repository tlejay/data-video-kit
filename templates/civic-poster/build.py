#!/usr/bin/env python3
"""Inline timeline.json, map.json, helpers.js, bgs.js and vid.js into index.html.

    python3 build.py              # writes index.html next to this file
    python3 build.py --out work/  # writes work/index.html (copy the template folder first)

Run it after every edit to timeline.json or the .js files; index.html is the file the
renderer opens (Chromium blocks fetch() on file:// pages, so everything is inlined).
"""
import argparse, json, os

H = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument("--out", default=H, help="folder for index.html")
a = ap.parse_args()
rd = lambda n: open(os.path.join(H, n), encoding="utf-8").read()
tl = json.loads(rd("timeline.json"))
html = (rd("shell.html") + "<script>\n"
        + "const TLD=" + json.dumps(tl, ensure_ascii=False) + ";\n"
        + "const MAP=" + rd("map.json").strip() + ";\n"
        + rd("helpers.js") + "\n" + rd("bgs.js") + "\n" + rd("vid.js")
        + "\n</script></body></html>\n")
out = os.path.join(a.out, "index.html")
open(out, "w", encoding="utf-8").write(html)
print(out, len(html))
