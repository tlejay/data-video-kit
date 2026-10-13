---
name: data-video
description: Turn raw data (a sheet, CSV, list, stats, survey, sales log) into a short narrated vertical video that tells a story the viewer cares about, not a reading of the table. Finds the angle, writes the script, voices it, mixes music and effects, briefs the visuals, renders through the motion-video skill. Trigger - "make a video from this data", "turn this CSV into a clip", "data video", "ทำวิดีโอจากข้อมูล", "เอาข้อมูลนี้ไปทำคลิป", a brief plus a sheet/CSV, /data-video.
allowed-tools: Bash Read Write Edit AskUserQuestion Agent
---

# /data-video

**The story layer.** The `motion-video` skill knows how to *produce* a clip (HTML frames,
Playwright, ffmpeg). This skill decides *what the clip should say* when all you were given
is data, and runs the whole job end to end.

Why it exists: the first version of a store-network video described the table ("430 stores,
one district has 165, the rest tie at 17"). The second asked a question the data could
answer: *if a retail chain picks locations with careful research, what does its store map
tell us about where people live and trade?* Same numbers, a reason to keep watching. Raw
data is usually public already; **the value is the interpretation, told from the viewer's
side.**

**Paths.** Everything below is relative to the kit folder: `$DATA_VIDEO_KIT` if set, else the
cloned repo (the folder holding `scripts/mv-render.py`). Run `/kiki-init` once if the kit is
not set up yet.

**Who decides.** "The editor" below is the person you are making the video for. Ask them
with AskUserQuestion (clear options, one batch at a time) rather than open questions.

**How this skill is laid out:** this file is the workflow and the rules that must never be
missed. Each step points to a file in `references/` with the full detail and the lessons
behind it. **Read that file when you reach the step**, not before.

| Step | Read |
|---|---|
| 0 team, models | `references/team-and-models.md` |
| 1-2 data, second dataset | `references/data-and-pairing.md`, `references/data-sources.md` |
| 4 hooks, frame 1, shapes | `references/hooks-and-shapes.md`, `references/storytelling.md`, `references/series-log.md` |
| 5-6 script, audio | `references/script-and-audio.md`, `docs/VOICE.md` |
| 4, 7 template, visuals | `references/visual-templates.md`, `references/visual-craft.md`, `references/review-checklist.md` |
| commands | `docs/PIPELINE.md` |

## 0. Direct, delegate the building, stay available

A video takes about an hour of wall time and the editor keeps sending other work meanwhile.

- **Keep yourself:** the angle, the script, the fact check, voice + mix (short), every review
  of stills, and every message to the editor.
- **Delegate in parallel:** research sections and gap-fill rounds go to parallel subagents,
  one per section. **The visual build (the HTML motion piece) goes to the strongest model
  you have, as a background subagent** with its own folder: HTML motion design is where the
  top model is clearly better. Put every lesson from previous reviews into its prompt. Give
  each a written spec file in the work folder, not a long chat. Keep the same visuals agent
  and send fixes to it.
- **Long commands run in the background** (`mv-render.py`, slow APIs). Never block on a render.
- Review fast and send precise fixes back (numbered, with coordinates or seconds) rather
  than fixing big things yourself; one-line fixes are fine to do directly.
- Tell the editor what each helper is on and a realistic ETA, then go quiet until there is
  something to show.

## 1. Understand the data before having ideas

Get it into a file, clean it, find its shape. **Every number said on screen is recomputed by
you**, never copied from the brief; when the brief and the data disagree, ask the editor
(with options) before writing. Detail: `references/data-and-pairing.md`.

## 2. Pair it with a second dataset (the default axis)

One dataset says where/how much; a second says why and per what. **Check the second dataset
measures what the sentence claims** (registered population is not where people live, so no
per-head ratios on it). Show the editor the joined findings with their caveat first. Detail
and the pairing table: `references/data-and-pairing.md`.

## 3. Find the angle (this is the skill)

Write 3 candidate angles in one line each, then pick one. Good angles come from asking:

| Lens | Question to ask of the data |
|---|---|
| What it reveals | What does this data quietly tell us about something else? (stores → where people are) |
| Why it is like this | Who decided this, and what were they optimising? Credit them. |
| Viewer's own life | Where am I in this? "แล้วอำเภอของคุณล่ะ" |
| Surprise | What would people guess wrong? Lead with the guess, then the answer. |
| Contrast | Biggest vs smallest, before vs after, here vs there. |
| Pattern | Does it line up with a road, a river, a calendar, a price band? |

Rules for the angle:
- **Respect the subject.** A brand, agency or person in the data is shown as competent.
  Name as text; no logos or brand artwork unless the editor supplies them.
- **Claims stay inside the evidence.** If the story needs data you do not have, hedge
  ("อาจสะท้อน", "may reflect") and offer to fetch the missing data from an official source.
- **Invite the viewer to think** rather than lecture: open on a question, close on a
  question that points back at them.
- When the editor wants more than one take, keep each version separate (own folder, own
  script, own visuals) and make them look like a series.

## 4. Hook, frame 1, story shape

Rules (detail, examples and the hook table: `references/hooks-and-shapes.md`). Labels: see
"Keeping this skill healthy" below.
- [rule] **Something worth stopping for lands inside 3 s**, and the opening promise is paid
  off. No "ถ้า..." (if...), no greeting, no setup clause. True, not clickbait.
- [rule] **A question in the voice is answered inside the first 5 s.**
- [rule] **Pick the visual template with the editor first:** 4 templates, 2 per image split
  left | right (cover + elements each), shown one image at a time with options
  (`references/visual-templates.md`); then make the frame-1 posters in the chosen one.
- [rule] **Frame 1 is a full-bleed thesis poster** that alone tells what the video is about,
  no draw-in. **Before any build, show the editor three frame-1 stills (A/B/C) and build only
  the one they pick.**
- [rule] **Rotate the pattern across the series:** read `references/series-log.md` first;
  hook pattern, story shape and pivot device must differ from the last two clips.
- [trial] "แต่" (but) at most once per script, never the main turn two clips in a row.
- Write 5 hooks, show the editor the top 2, and name the chosen shape in the draft.
- Defaults saved by `/kiki-init` in `.env`: `DVK_TEMPLATE` (lead the template choice with
  it) and `DVK_MUSIC_MOOD` (the `mv-music.py --mood`).

## 5. Script (formal unless told otherwise)

5 to 7 lines, 55 to 75 s. [rule] Few numbers, made human; [trial] **at most 3 hero numbers
per minute**, the rest as words or human scale. Write each line twice: `tN.txt` as spoken
(numbers as words) and `tN.cap.txt` as captioned (digits). Check against the
mispronunciation table in `docs/VOICE.md`. Run `python3 scripts/mv-script-lint.py <work
folder>` and fix every FAIL, then show the draft in a code fence with the recomputed facts
underneath and options (ok / fetch more data / edit). [rule] **Do not voice before the
editor says ok.** Detail: `references/script-and-audio.md`.

## 6. Audio

Time drafts with `scripts/placeholder-voice.py` (free). After the editor's ok: narration
per line with `scripts/tts-clip.py --dir <work>` (paid; the ok is the trigger), then
`mv-timeline.py` (timeline.json + .srt from the measured clips), `mv-music.py`, `mv-mix.py`.
Share `mix.m4a` before the visuals are final. Commands and timing rules:
`references/script-and-audio.md`, `docs/PIPELINE.md`.

## 7. Visuals (delegate, then review)

Write `SPEC-visual.md` in the work folder and hand it to the visuals subagent. Start from a
template in `templates/` when one fits. **Step 0 of every spec: the three frame-1 poster
stills** (step 4). The spec always carries:
- the camera rule (world canvas + keyframed camera, a move every 1.5 to 2.5 s, strong moves
  only at turns), from `references/visual-craft.md`;
- [rule] **no lazy backgrounds:** every scene gets a genuinely different background
  treatment (paper, interior, contour map, halftone, blueprint, pattern...), tied to its
  content; never one background re-coloured. Consistency comes from palette, accent, object
  style and type;
- the safe-area contract for 1080x1920: readable content inside **x 90..990, y 250..1480**,
  below y 950 also **x < 880**; subtitles **y 1290..1470, x 150..860**; check with
  `scripts/mv-safezone.py`;
- `T`, `window.DURATION`, inline `NAR` driving `#cap` outside the camera,
  `window.SFX_CUES` at the real animation times, per-scene content with exact seconds;
- sources and licences for any map or geometry (never invent a line or border), no logos;
- the whole of `references/review-checklist.md`, pasted in;
- "no audio, no final render; deliver index.html, contact.jpg, sceneN.png".

When it reports: read every still yourself (and the safe-zone overlay), remix with the real
cues (`mv-mix.py --cues cues.json`), show the editor the stills with any data caveats, and
only then render in the background (`mv-render.py --audio mix.m4a@0`).

## 8. Deliver

Deliver the full MP4 + SRT + the stills, a caption/post text draft in the editor's voice in a
code fence, and the source/licence lines. Verify the files exist and play (size, duration
with `ffprobe`) before saying they are delivered. Never publish anywhere yourself. Then
**append the clip to `references/series-log.md`** (hook, shape, pivot) and add reactions as
they arrive. Save an approved build as a template in `templates/<name>/` (see
`references/team-and-models.md`).

## Keeping this skill healthy

Rules grow one clip at a time, which risks rules that fit one video only, rules that
contradict each other, and examples that teach a habit a rule forbids (the old hook
examples used "แต่" in 4 of 5 while a rule limited it). Four guards, from Anthropic's skill
authoring guidance (progressive disclosure, evaluations, observe-and-refine):

1. **Label every rule.** `[rule]` = the editor stated it as a standing rule; `[trial]` = a
   threshold or a lesson from one clip, kept until `series-log.md` shows it works, then
   promoted to `[rule]` with the editor's ok or dropped. New feedback lands as `[trial]`
   unless the editor states it as a rule. Unlabelled lines in `references/` are craft notes.
2. **Audit every 3 clips** (count rows in `references/series-log.md`): reread SKILL.md and
   all references, list contradictions, over-fitted `[trial]` rules and examples that steer
   against a rule, fix, and tell the editor in one message what changed.
3. **Scripts check what can be measured:** `scripts/mv-script-lint.py` (numbers per minute,
   "แต่" count, ถ้า/greeting openers, mispronounced words, dashes) and
   `scripts/mv-safezone.py` (layout). A rule that can be checked by a script should be.
4. **Evaluations:** `evals/` holds three briefs with rubrics. After any change to the step 3
   to 5 rules, run them (fresh agent, skill only, stop at the script draft) and grade
   against the rubric before trusting the change.

Related: the `motion-video` skill (production), `docs/VOICE.md`, `docs/PIPELINE.md`.
