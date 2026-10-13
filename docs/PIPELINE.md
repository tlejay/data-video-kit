# Pipeline: data to a narrated vertical video

The whole path with exact commands. The `data-video` skill runs these steps for you inside
Claude Code; this page is the same thing by hand, and the reference for what each file is.
All commands run from the kit folder; `W` is a work folder per video (keep it outside the repo
or under `examples/*/work/`, which is git-ignored).

```
data ─► angle ─► hooks ─► script ─► lint ─► (approve) ─► TTS ─► timeline.json + .srt
                                                                   │
                         music ─► mix ◄────────────────────────────┤
                                                                   ▼
             template choice ─► 3 frame-1 posters ─► visual build ─► stills review ─► render ─► deliver
```

| # | Step | Tool | Output |
|---|---|---|---|
| 1 | Understand the data | you / Claude | cleaned CSV, recomputed facts |
| 2 | Pair with a second dataset | you / Claude | joined facts + caveat |
| 3 | Find the angle | `skills/data-video/SKILL.md` §3 | one line |
| 4 | Hooks, frame 1, story shape | `references/hooks-and-shapes.md` | 5 hooks, chosen shape |
| 5 | Script | `tN.txt` (spoken), `tN.cap.txt` (captions) | 5 to 7 lines |
| 6 | Lint | `mv-script-lint.py` | PASS/WARN/FAIL |
| 7 | Voice (paid) | `tts-clip.py` | `tN.mp3` |
| 8 | Measure + timeline | `mv-timeline.py` (uses `mv-audio-analyze.py`) | `timeline.json`, `captions.srt` |
| 9 | Music | `mv-music.py` | `music.wav` |
| 10 | Mix | `mv-mix.py` | `mix.m4a` |
| 11 | Visual build | a template + `build.py` | `index.html` |
| 12 | Stills review | `mv-render.py --preview`, `mv-safezone.py` | `contact.jpg`, `*-safe.png` |
| 13 | Render | `mv-render.py --audio mix.m4a@0` | `final.mp4`, `final-small.mp4` |
| 14 | Deliver | copy | MP4 + SRT + caption text + sources |

## 1-4. Data, angle, hooks

Get the data into a file and recompute every number you will say. Find a second dataset
that turns counts into a "why" or "per what", and check it measures what your sentence
claims. Write three one-line angles, pick one, then five hooks; the verdict (or a question
answered by second 5) must land inside 3 seconds. Details and the lessons behind each rule:
`skills/data-video/references/`.

## 5. Script files

One scene per line, 5 to 7 lines, 55 to 75 s total.

```
W/t1.txt       โซลาร์ฟาร์มแห่งแรกของไทย เกิดขึ้นกลางทุ่งที่โนนสูง โคราช       ← spoken (numbers as words)
W/t1.cap.txt   โซลาร์ฟาร์มแห่งแรกของไทย                                      ← caption chunks, one per line
               เกิดขึ้นกลางทุ่งที่โนนสูง โคราช                                  ("\n" = second caption line)
```

## 6. Lint

```bash
python3 scripts/mv-script-lint.py $W
```

Checks hero numbers per minute, "แต่" count, banned openers (ถ้า, greetings), words the voice
mispronounces (table in `docs/VOICE.md`), an unanswered opening question, em dash / middle
dot. Fix every FAIL before anyone reviews the draft.

## 7. Voice

Free draft first, real voice after the script is approved:

```bash
python3 scripts/placeholder-voice.py --dir $W          # macOS say / espeak-ng / silence
python3 scripts/tts-clip.py --dir $W --dry-run         # chars + cost, no call
python3 scripts/tts-quota.py --need 900                # one key must have room
python3 scripts/tts-clip.py --dir $W --force           # paid; replaces the placeholders
```

Setup and every voice lesson: `docs/VOICE.md`.

## 8. Timeline and captions

```bash
python3 scripts/mv-timeline.py --dir $W                # timeline.json + captions.srt
python3 scripts/mv-audio-analyze.py $W/t*.mp3 --out $W/env.json   # optional: per-frame loudness for audio-reactive visuals
```

`timeline.json` is the contract between audio and visuals:

```json
{"T":     {"t1": [0, 6.07], "t2": [6.07, 14.31]},
 "START": {"t1": 0.5, "t2": 6.42},
 "NAR":   [{"a": 0.5, "b": 2.6, "t": "caption"}],
 "SFX":   [{"t": 6.07, "kind": "whoosh"}],
 "DUR":   62.16}
```

`T` = scene windows, `START` = when each clip plays, `NAR` = captions on the measured pauses,
`SFX` = draft sound cues (`sfx/sfx-<kind>.mp3`: burst, whoosh, highlight, pop, end),
`DUR` = last clip end + 3.5 s for the end card. Re-run after every voice change.

## 9-10. Music and mix

```bash
DUR=$(python3 -c "import json;print(json.load(open('$W/timeline.json'))['DUR'])")
python3 scripts/mv-music.py --dur $(python3 -c "print($DUR+2)") --mood bright --out $W/music.wav   # bright | minor | warm
python3 scripts/mv-mix.py --dir $W --music $W/music.wav --out $W/mix.m4a
```

Music is synthesised (marimba + pad, no licence questions), ducked under the voice with a
sidechain compressor, and the mix is normalised to -16 LUFS. Once the visual build reports
its real animation times as `window.SFX_CUES`, save them to `cues.json` and remix with
`--cues $W/cues.json`. Listen to (or send for review) the mix before the visuals are final:
it is the cheapest thing to change.

## 11. Visual build

Start from a template (`templates/`). Each has a `build.py` that inlines `timeline.json`,
the sticker library and the scene code into one `index.html` (Chromium blocks `fetch()` on
`file://`, so everything is inlined):

```bash
mkdir -p $W/visual && cp -R templates/line-cartoon/* $W/visual/
cp $W/timeline.json $W/visual/ && python3 $W/visual/build.py
```

The page must expose `window.render(t)` (draws time `t` deterministically: no timers, no
`Date.now`, no unseeded random), `window.DURATION`, and ideally `window.SFX_CUES`. For a new
story you rewrite the scene functions in `vid.js` and keep the helpers. The rules a visual
build must follow (safe area, camera, backgrounds, review checklist) are in
`skills/data-video/references/visual-craft.md` and `review-checklist.md`; paste them into
the brief for whoever (or whichever model) builds it.

## 12. Stills review

```bash
python3 scripts/mv-render.py --html $W/visual/index.html --duration $DUR --preview 1,8,18,28,40,50,60
python3 scripts/mv-safezone.py $W/visual/preview/f00002.jpg      # red = covered by app UI, blue = subtitle band
```

Read `contact.jpg` and every safe-zone overlay before rendering everything. The
`line-cartoon` template also has `shoot.py`, which reports any key text outside the safe area.

## 13. Render

```bash
python3 scripts/mv-render.py --html $W/visual/index.html --duration $DUR \
  --audio $W/mix.m4a@0 --out $W/final.mp4
```

About 100 s of wall time for a 65 s video on a laptop. Writes `final.mp4` (crf 20) and
`final-small.mp4` (crf 27, for chat apps). Run it in the background.

## 14. Deliver

Hand over `final.mp4`, `captions.srt`, a caption/post text draft, and the source and licence
lines (data sources; map geometry such as geoBoundaries CC BY 3.0 IGO or OpenStreetMap
ODbL). Then add a row to `skills/data-video/references/series-log.md` (hook, shape, pivot)
so the next video can rotate away from it.
