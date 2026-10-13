# Team and models: who builds what

Detail for SKILL.md step 0. Read when briefing a helper agent.

## Strongest model vs a faster model

Where the top model's video skill actually is (from public showcases of code-to-video work
and HyperFrames-style HTML motion pipelines):
- **Composition and motion design:** storyboarding, camera moves, kinetic type, transitions,
  rhythm synced to narration and music. Writes the whole HTML/GSAP piece from one brief.
- **Seeing its own frames:** it renders key frames, *looks* at them, finds overflow/overlap/
  clipping and fixes them itself. This loop is the biggest gap versus smaller models, so
  every visuals prompt must require it (render keyframes, read them, run
  `scripts/mv-safezone.py`, iterate) before reporting.
- Works best with: a storyboard first (scene, visual, narration line, seconds), fixed safe
  margins and max font sizes in the prompt, a design system (palette, fonts) stated up
  front, half-resolution previews while iterating, full render only at the end.
- Prefer HTML + GSAP: one **paused** root timeline, seek it from `window.render(t)`
  (`tl.seek(t, false)`); deterministic only (no Date.now, no unseeded random, no render-time
  fetches). HTML gives the model more creative room than React/Remotion.

Split (give each model the work it is best at):

| Job | Who |
|---|---|
| Angle, script, fact check, voice, mix, final review, talking to the editor | you (the lead session) |
| New visual design, camera, motion, first build of a format | **strongest model, as a background subagent** (faster models' first drafts needed several fix rounds) |
| Visual self-review + fixes on its own build | the same visuals subagent (keep it, send fixes to it) |
| Research, data fetching, CSV/GeoJSON prep, joins | parallel subagents on a faster model, one per section |
| Re-skinning an approved template with new data or a new language, batch variants | a faster model |
| Small mechanical fixes (a colour, a timing, a typo) | a faster model or you directly |
| Long renders, slow APIs | background shell commands |

Cost rule: design once with the strongest model, then reuse the template with a faster
one; that cuts the cost of a series by more than half. Save every approved build as a
template (`templates/<name>/index.html` + `build.py` + a short README of its data contract)
so the next video starts from it.

**Use the waiting time** (the first full build took ~14 min, waiting for the editor's poster
pick ~11 min). While the editor chooses a template or poster, have the visuals agent start
the parts every option shares: the sticker library for the topic, timeline/caption wiring,
the map if any. Start from a saved template in `templates/` when one fits.
