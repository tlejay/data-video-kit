# Visual templates catalog

[rule] **Choose the template with the editor first**, and only then make the three frame-1
posters (SKILL.md step 4) inside that template.

[rule] How to show the choice:
- **Always 4 templates**, drawn for this clip's topic (not old clips' art).
- **Two templates per image, split left | right.** Each half = that template's cover for
  this clip plus a strip of the elements/stickers it would use. So 2 images, shown **one at
  a time** (the editor picks per image), each with options for its two sides plus "neither".
- Mix catalog templates with at least one new look when the catalog has fewer than 4 fitting
  ones; add every new look to the catalog below. One template per clip; rotate across the
  series like hooks and shapes (`series-log.md`).

A template = a look plus a kit: palette, type, background behaviour, illustration language
and a reusable library of drawn parts ("stickers"). The kit is what makes a template cheap to
reuse and rich on screen (the reference reel that inspired `line-cartoon` stood out because
its maker had built a large sticker set). So every template grows its sticker library, and
the library is saved with it.

When an approved build is saved, it goes to `templates/<name>/` (`index.html`, `build.py`,
`helpers.js` with the sticker library, `README.md` with the data contract), see
`team-and-models.md`.

## Catalog

| Name | Look | Kit / stickers | Status |
|---|---|---|---|
| `civic-poster` | Deep coloured background with light rays, 3D objects on a perspective floor, amber hero numbers, teal accents, pill labels, Kanit 700. Background colour changes per scene and flows with the camera ("keep switching background colours, but with continuity"). | ballot boxes, ballot papers, people pictograms (farmer, vendor, labourer, office worker), ID card, clock, coin jar | built, `templates/civic-poster/` |
| `line-cartoon` | Flat cartoon line-art in the style of popular app explainer reels: thick black outlines, flat fills, simple smiling faces, clean light background, characters that move smoothly (blink, gesture, walk, react). | **many small stickers**: sun, solar panels, houses, factory, meter, piggy bank, calendar, sweat drops, sparkles, hearts, speech bubbles; build a large set, reuse across clips | built, `templates/line-cartoon/` |
| `risograph` | Screen-print editorial: 3 spot inks (yellow, orange-red, blue) on cream paper, halftone, misregistration, cut paper, stamps. | stamps, halftone dots, torn-paper shapes | cover sample only, `templates/risograph-sample/` |
| `earth-poster` | Warm cream/earth day palette flipping to dusk at the turn; field over asphalt poster; pictograms of the real thing. | cassava roots, factories, trucks, train wagons, ship crane, tablet | described only (not included) |

## Adding a template

Add a row when the editor sends a reference or approves a new look: name, what defines the
look, the stickers it needs, status (`reference only` / `building` / `built`). Everything is
drawn in code (SVG/CSS); no AI images, photos or logos.
