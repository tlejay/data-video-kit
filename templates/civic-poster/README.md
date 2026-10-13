# civic-poster

Deep coloured backgrounds that change per scene and flow with the camera, 3D objects on a
perspective floor, amber hero numbers, teal accents, pill labels, Kanit 700. Built for a
60 s public-data video on a Thai social-security board election (turnout rose about four
times after pre-registration was dropped); approved after a background redo, when every
scene got its own background idea.

| File | What |
|---|---|
| `shell.html` | page head, styles, SVG defs, caption pill, source card (edit the sources text here) |
| `timeline.json` | `T` scene windows, `START`, `NAR` [{a,b,t}], `DUR` (from mv-timeline.py) |
| `map.json` | Thailand provinces, geoBoundaries THA ADM1 (CC BY 3.0 IGO) |
| `helpers.js` | sticker library: people (farmer, vendor, labourer, office worker), ballot, ballot box, booth, ID card, clock, coin jar |
| `bgs.js` | one background treatment per scene |
| `vid.js` | scenes, camera keyframes, animations, `SFX_CUES` |
| `build.py` | inlines everything into `index.html` (run after every edit) |

Contract: `window.render(t)`, `window.DURATION`, `window.SFX_CUES`. Re-skin with new data
on a faster model; keep "each scene its own background" (data-video SKILL.md step 7).
