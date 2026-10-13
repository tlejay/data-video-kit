# Visual craft: safe area, camera, motion

Detail for SKILL.md step 7. Paste the relevant parts into every visuals spec.

## Safe area (the app covers part of your frame)

The first two videos went out on TikTok and Facebook Reels with the subtitles sitting under
the caption/account block, and the "165" at the end of the longest bar cut off. Two separate
effects, both measured from real iPhone screenshots:

1. **Side crop.** Phones are taller than 9:16, so the apps scale to fill the height and crop
   about 50 px off each side. Nothing important within 90 px of the left or right edge.
2. **App UI on top.** Header and search across the top ~250 px; the like/comment/share column
   on the right (x > 880 from y 950 down); account name, caption, location tag and promo
   button across the bottom from y ~1480.

Layout contract for 1080x1920:
- Everything that must be read: inside **x 90..990, y 250..1480**, and in the lower half
  also **x < 880**.
- **Subtitles: y 1290..1470, x 150..860**, centred around x 505, max 2 lines, about 46 px.
  Never in the bottom 440 px.
- Charts and maps: size to the safe box, not the canvas. Value labels at bar ends count
  as text (the longest bar plus its number must end before x 990, before 880 below y 950).
- Background colour and decorative motion may fill the whole frame.

Check, do not guess: `python3 scripts/mv-safezone.py <still>` paints the covered zones red
and the subtitle band blue. Run it on every scene still before showing stills, and put the
same contract in every visual spec you delegate.

## Camera (never a locked frame)

[rule] The first videos had every scene as a fixed frame with empty slots reserved for what
would appear, so the viewer could predict the next element, and with no zoom in or out the
video felt static. Rules:

- **Build a world, film it with a camera.** Lay the content out on a canvas larger than the
  frame (e.g. 3000x5000) and render through one camera transform `cam = {x, y, zoom, rot}`
  driven by keyframes derived from `T`. Elements live where they belong in the world, not in
  slots reserved on screen.
- **Something moves every 1.5 to 2.5 s.** Slow push-in (zoom 1.0 to 1.08) on every hold;
  a decisive move (pan, zoom in 1.5x to 3x, whip) on every new idea; zoom out to reveal the
  whole picture at the summary. Never hold a dead frame longer than about 2 s.
- **Reveal by camera, not by fade-in-place:** the next number is off-frame and the camera
  travels to it, or the camera dives into a map district and the chart grows out of it.
- **Vary the shot size:** extreme close-up on one number, medium on a comparison, wide on the
  map. Cut or whip between them on narration beats (the pause times from mv-audio-analyze).
- Ease every move (easeInOutCubic, slight overshoot on arrivals); add 1 to 2 px of drift or
  parallax between background and foreground layers so it never looks frozen.
- **Spend transitions, do not spray them** (traffic video: moves felt too fast and too many,
  and the same ones repeated). Strong moves (whip, slam, shake) only at story turns, at most
  one per clip line; ordinary beats get a calm push or pan. Never use the same transition
  twice in a row; vary between cut, push, pan, dive, rotate, reveal.
- **Try other angles:** isometric or tilted planes (CSS 3D `perspective`, `rotateX/rotateZ`),
  an orbit around a chart, a top-down map tilting into 3D. Rule: tilt while moving, but when
  the camera rests for reading, Thai text faces the viewer flat (stacked vowels and tone
  marks become unreadable on a phone when skewed).
- **Safe area still wins:** wherever the camera rests, the readable element sits inside the
  safe-area box (above) at that moment; during a move, text may cross the edges.
- Captions (`#cap`) are drawn outside the camera transform, fixed in the subtitle band.

## Motion craft (what worked, what was corrected)

- **Turn the whole scene at a story pivot** (the word itself is not the point). At the turn,
  cut, change the background, flip the mood (light to dark, calm to tense) and give the line
  its own moment. Any word or none can carry it.
- **Shrink the old, give space to the new:** the housing chart dropped and the big "-73%"
  took the frame. When a number is the point, let it take the space.
- **Pictograms that mean something:** a quantity drawn as units uses an icon of the thing
  (cars for traffic, houses for housing, people for workers), never generic dots or circles.
- **Counters sparingly:** count up only the one hero number per video, and briefly (about
  0.6 to 1 s, last few values visible). Every other number simply arrives.
- **Creative entrances:** fading up from alpha is the fallback, not the default. Mix in:
  rising from behind a text block, sliding out from behind the background or a card edge,
  unmasking along a line, popping up with a small bounce, being drawn on, dropping in with
  weight. No two neighbouring elements enter the same way.
- **AI illustrations are an accent, not the stage** (full-screen generated images held too
  long were dull; a strong model draws well enough in code). Default: draw everything in
  code. If a generated image is used, show it for 1 to 2 s or as one small element inside a
  composed scene, label it "ภาพประกอบ" (illustration) and credit AI on the end card. High
  production spends long work on a few seconds.

## Map and geometry sources

Cite the licence on the end card: geoBoundaries (CC BY 3.0 IGO), OpenStreetMap (ODbL).
Never invent a line or border; a route that is only a schematic is labelled "แผนภาพ" (diagram).

## Templates

The look of a clip comes from a template chosen with the editor before any poster: see
`visual-templates.md`.
