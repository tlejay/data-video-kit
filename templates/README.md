# Templates

A template = a look plus a kit: palette, type, background behaviour, illustration language
and a reusable library of drawn parts ("stickers"). Everything is drawn in code (SVG/CSS),
no stock images, no logos. Catalog and how to choose: `skills/data-video/references/visual-templates.md`.

| Template | What is inside | Built from |
|---|---|---|
| `civic-poster/` | full 60 s video: 7 scenes, camera, one background per scene, Thailand map | a public-data video on a social-security board vote |
| `line-cartoon/` | full 62 s video: 7 scenes, big sticker library, Thailand map, still checker | a public-data video on solar power in Korat |
| `risograph-sample/` | one cover + sticker strip (no video yet) | a template-choice round |

Reuse a full template:

```bash
mkdir -p $W/visual && cp -R templates/line-cartoon/* $W/visual/
cp $W/timeline.json $W/visual/        # your timing (mv-timeline.py)
python3 $W/visual/build.py            # inlines everything into index.html
python3 scripts/mv-render.py --html $W/visual/index.html --duration <DUR> --preview 1,10,20,30
```

With only a new `timeline.json`, the scenes re-time to your narration (the example in
`examples/korat-solar` does exactly this with free placeholder voice). For a new story,
rewrite the scene functions in `vid.js` (the data and words on screen) and keep `helpers.js`.
The page contract every template follows: `window.render(t)` deterministic,
`window.DURATION`, captions from `NAR` in `#cap` outside the camera, `window.SFX_CUES`.

The on-screen facts in `civic-poster` and `line-cartoon` belong to their original stories
(Thai public data, sources on their end cards). Replace them before publishing your own video.
