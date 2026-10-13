---
name: motion-video
description: Make a short code-driven motion-graphics video (vertical 9:16 for TikTok/Reels/Shorts by default) with narration, synced captions and audio-reactive visuals, rendered from HTML frames with Playwright + ffmpeg. Trigger - "make a short video", "motion graphics clip", "vertical video", "comparison clip", "ตัดคลิป", "ทำวิดีโอ", "ทำคลิปแนวตั้ง", /motion-video.
allowed-tools: Bash Read Write Edit AskUserQuestion Agent
---

# /motion-video

**The production layer.** Turns a script into a finished MP4. The style comes from the
"code-to-video" showcases (HyperFrames-style HTML pipelines): **pure code, no stock footage,
huge kinetic type, a new idea every 1.5 to 2 seconds.** HyperFrames itself is not needed;
the same idea runs on Playwright + ffmpeg.

**Starting from raw data (a sheet, a list, stats)?** Use `/data-video` first: it finds the
angle and writes the script, then hands production back to this pipeline.

**Paths** are relative to the kit folder (`$DATA_VIDEO_KIT`, or the cloned repo holding
`scripts/mv-render.py`). Full command reference: `docs/PIPELINE.md`. Voice: `docs/VOICE.md`.

Worked example: `example-voice-compare.html` in this folder (open it to copy patterns:
blob background, a config card that fills in line by line, waveform bars driven by the real
audio envelope, slam numbers, narration pill, audio-tag chips). Saved full builds live in
`templates/` (each with a `build.py`).

## Rules for these videos (learned the hard way)

1. **Never open cold.** A comparison clip that opened straight on "v3 vs v4" lost viewers.
   Say what is about to happen → context (what is compared, the settings) → the demo → a
   call to action. (Data videos use a verdict-first hook instead; see `/data-video`.)
2. **Narrate it.** The voice explains each step before it happens.
3. **Subtitle every spoken line.** Feeds autoplay muted. Narration = dark pill in the
   subtitle band; demo audio = big caption in the middle. Two looks, so viewers can tell
   who is speaking.
4. **Show the config, not just the result.** A card with the real parameters, each row
   lighting up as the narration reaches it.
5. **Brand:** pick a palette and one font family up front and state them in the spec; put a
   small watermark (your handle) bottom right, outside the app UI zones.
6. No em dash, no middle dot in on-screen text.
7. **Safe area** (TikTok + Reels, measured on real phones): readable content inside x 90..990,
   y 250..1480 (and x < 880 below y 950); narration subtitles at y 1290..1470. Check stills
   with `python3 scripts/mv-safezone.py <png>`. Details:
   `skills/data-video/references/visual-craft.md`.
8. **Hide, don't dim.** Anything waiting to appear stays at opacity 0 until its cue. A faded
   placeholder spoils the reveal.
9. **Narration in Thai sounds only** (for Thai videos): write English names as Thai sounds and
   units in full (เมกะไบต์). Subtitles may keep the English spelling.
10. **Public = anonymous:** no private project, domain, form, ticket number or machine names
    on screen; say "Project A".
11. **Tell the real ending.** If the story is still happening, build the first scenes and
    record the last clip only after the real close, with real times.

## Pipeline

Work in a folder outside the repo (`$W`).

**1. Script first.** 4 to 7 short clips (one per scene), plain language, numbers spelled
the way they should be spoken: `t1.txt .. tN.txt`, plus `tN.cap.txt` caption chunks.

**2. Voice it.** Free draft: `python3 scripts/placeholder-voice.py --dir $W`. Real voice
(paid, only once the script is approved): `python3 scripts/tts-clip.py --dir $W --force`.
Direct the read with audio tags from `docs/voice-audio-tags.md` (tag before the words, one
per clause).

**3. Measure, because you cannot hear.**
```bash
python3 scripts/mv-timeline.py --dir $W                          # timeline.json + captions.srt
python3 scripts/mv-audio-analyze.py $W/t*.mp3 --out $W/env.json  # per-frame loudness + pauses
```
Pauses = phrase boundaries: captions hang on them. The per-frame `env` array drives waveform
bars and small bounces so motion follows the real voice.

**4. Lay out the timeline** from the durations: put scene changes a beat before the
narration that introduces them (`mv-timeline.py` does this; `--gap`, `--pre` to tune).

**5. Build `index.html`** exposing `window.render(t)` that sets every element from `t` alone
(no CSS transitions, no timers, no randomness without a seed). 1080x1920 default. Inline all
data (Chromium blocks `fetch()` on `file://`). Easing helpers, `set(id, opacity, transform)`
and a `NAR` caption table are in the example.

**6. Look before rendering everything.**
```bash
python3 scripts/mv-render.py --html $W/index.html --duration 64.5 --preview 1,6,16,23,30,46,61
```
Read `contact.jpg`. Check Thai text wraps, nothing overlaps, captions sit where they should.

**7. Music, mix, render.**
```bash
python3 scripts/mv-music.py --dur 67 --mood bright --out $W/music.wav
python3 scripts/mv-mix.py --dir $W --music $W/music.wav --out $W/mix.m4a
python3 scripts/mv-render.py --html $W/index.html --duration 64.5 --audio $W/mix.m4a@0 --out $W/final.mp4
```
Or place raw clips directly: `--audio $W/n1.mp3@0.4 --audio $W/sample.mp3@25.6`. About 100 s
for 65 s of video on a laptop; run it in the background. Produces `final.mp4` (crf 20) and
`final-small.mp4` (crf 27, under most chat-app upload limits).

**8. Deliver.** The full MP4 + the SRT + a caption/post text draft + source lines. Verify the
file plays (`ffprobe` duration and size) before calling it delivered. Never post to a social
account yourself unless asked.

## Ideas that fit this format

Before/after comparisons (models, prompts, settings), "how we did X" explainers, event
teasers, number reveals from public stats. Keep it under ~70 s; 9:16 unless asked for square
or landscape (`--size 1080x1080`).
