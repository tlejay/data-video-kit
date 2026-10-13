#!/usr/bin/env python3
"""Render scene stills + safe-zone overlays + a contact sheet, and report any visible
`.key` text that leaves the safe area (OUT), sits on the right action rail (RAIL) or
overlaps the subtitle band (CAPBAND).

    python3 shoot.py            # build, check, stills, contact sheet
    python3 shoot.py stills     # build, check, stills only
    python3 shoot.py contact    # build, check, contact sheet only

The sample times below are tuned to this template's 7 scenes; adjust `scenes`/`checks`
when your video has a different number of scenes. Set DATA_VIDEO_KIT to the kit folder
when this template was copied somewhere else.
"""
import asyncio, json, os, subprocess, sys
from playwright.async_api import async_playwright
H = os.path.dirname(os.path.abspath(__file__)); V = H
KIT = os.environ.get("DATA_VIDEO_KIT") or os.path.abspath(os.path.join(H, "..", ".."))
SAFEZONE = os.path.join(KIT, "scripts", "mv-safezone.py")
RENDER = os.path.join(KIT, "scripts", "mv-render.py")
JS = '''()=>{const out=[];for(const e of document.querySelectorAll('.key')){let op=1,n=e,hid=false;
 while(n&&n.tagName&&n.tagName.toLowerCase()!=='svg'){const cs=getComputedStyle(n);if(cs.display==='none'){hid=true;break;}const a=n.getAttribute&&n.getAttribute('opacity');if(a!=null)op*=parseFloat(a);op*=parseFloat(cs.opacity);n=n.parentNode;}
 if(hid||op<.85)continue;const r=e.getBoundingClientRect();if(r.right<0||r.left>1080||r.bottom<0||r.top>1920||r.width<2)continue;
 out.push([e.textContent.slice(0,22),Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)]);}return out;}'''
def args():
    a = sys.argv[1:]
    if a and a[0] in ('-h', '--help'):
        print(__doc__); sys.exit(0)
    return a[0] if a else 'all'
async def main(mode):
    subprocess.run([sys.executable, f"{H}/build.py"], check=True)
    tl = json.load(open(f"{H}/timeline.json"))
    S = tl['START']
    LE = {k: max([n['b'] for n in tl['NAR'] if n['a'] >= w[0] - .05 and n['a'] < w[1]] or [S[k] + 1]) for k, w in tl['T'].items()}
    at = lambda k, u: S[f't{k}'] + u * (LE[f't{k}'] - S[f't{k}'])
    scenes = {1: 0.0, 2: at(2, .5), 3: at(3, .97), 4: at(4, .7), 5: at(5, .62), 6: at(6, .97), 7: at(7, .72), 8: tl['DUR'] - .3}
    checks = sorted(set([round(x, 2) for x in [0, 2.5, at(2, .3), at(2, .5), at(2, .62), at(2, .9), at(3, .2), at(3, .6), at(3, .97), at(4, .1), at(4, .3), at(4, .55), at(4, .7), at(4, .9),
              at(5, .15), at(5, .3), at(5, .55), at(5, .9), at(6, .2), at(6, .5), at(6, .7), at(6, .97), at(7, .25), at(7, .55), at(7, .72), tl['DUR'] - .3]]))
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1080, "height": 1920})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://' + f"{V}/index.html"); await pg.wait_for_load_state('networkidle'); await pg.evaluate('document.fonts.ready')
        for t in checks:
            await pg.evaluate(f'render({t})')
            for n, x0, y0, x1, y1 in await pg.evaluate(JS):
                bad = []
                if x0 < 90 or x1 > 990 or y0 < 250 or y1 > 1480: bad.append('OUT')
                if y1 > 950 and x1 > 880: bad.append('RAIL')
                if y1 > 1290 and y0 < 1470 and x1 > 150 and x0 < 860: bad.append('CAPBAND')
                if bad: print(f"t={t:5.2f}", n, (x0, y0, x1, y1), ' '.join(bad))
        if mode in ('all', 'stills'):
            for k, t in scenes.items():
                await pg.evaluate(f'render({t})'); name = f"scene{k}.png" if k < 8 else "end.png"
                await pg.screenshot(path=f"{V}/{name}")
                subprocess.run([sys.executable, SAFEZONE, f"{V}/{name}"], check=True, capture_output=True)
        print('ERR', errs) if errs else None
        await b.close()
    if mode in ('all', 'contact'):
        ts = [0, 2.8, 4.2] + [round(at(k, u), 2) for k in range(2, 8) for u in (.15, .5, .85)] + [tl['DUR'] - .3]
        subprocess.run([sys.executable, RENDER, "--html", f"{V}/index.html", "--duration", str(tl['DUR']), "--preview", ",".join(map(str, ts))], check=True, capture_output=True)
        subprocess.run(['ffmpeg','-v','error','-y','-pattern_type','glob','-i',f"{V}/preview/f*.jpg",'-filter_complex','scale=270:480,tile=8x3:padding=6:color=white','-frames:v','1',f"{V}/contact.jpg"],check=True)
        print('contact', ts)
asyncio.run(main(args()))
