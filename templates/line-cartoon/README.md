# line-cartoon

Flat cartoon line-art: thick black outlines, flat fills, smiling characters, a large
sticker library, one distinct background per scene (sky and paddy field, graph paper,
blueprint, candy stripe, calendar tiles, sunburst). Built for a 62 s public-data video on
solar power in Nakhon Ratchasima (Korat).

| File | What |
|---|---|
| `timeline.json` | `T`, `START`, `NAR`, `DUR`; every beat in `vid.js` is START-relative, so a new timeline re-times the clip |
| `helpers.js` | the sticker kit (sun, panels, houses, factory, meter, piggy bank, calendar, people, sparkles, ...) |
| `vid.js` | world canvas + keyframed camera, scenes, `SFX_CUES` |
| `map.json` | Thailand provinces from `mkmap.py` (geoBoundaries, CC BY 3.0 IGO) |
| `build.py` | inlines helpers + timeline + map + vid into `index.html` |
| `shoot.py` | builds, checks `.key` text against the safe area, writes scene stills, safe-zone overlays and a contact sheet |
| `mkmap.py` | regenerates `map.json` from the geoBoundaries GeoJSON |

Reuse: copy into a work folder, replace `timeline.json`, rewrite the scene functions in
`vid.js`; keep the helpers and the sticker set, and add to them. Run `build.py` after edits.
