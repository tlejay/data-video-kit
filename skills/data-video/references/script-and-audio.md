# Script and audio

Detail for SKILL.md steps 5 and 6. Commands: `docs/PIPELINE.md`. Voice setup and lessons: `docs/VOICE.md`.

## Script (formal unless told otherwise)

- 5 to 7 lines, one per scene, 55 to 75 seconds total, following the step 4 story shape.
- **Few numbers, made human** ([rule]: "when there are many numbers it stops being
  interesting"; the traffic video stacked 60,219, 77,819, 576,245, 47%, 43%). [trial] At most
  3 hero numbers per minute, one per idea. Say the rest as words or a feeling ("เกือบครึ่ง"
  almost half, "สองเท่า" twice), and turn big numbers into a human scale ("77,819 คันต่อวัน" =
  "เกือบทุกวินาที มีรถผ่านหนึ่งคัน", almost one car every second; compare with something the
  viewer knows). Exact figures go in the small source line, not the voice.
  `mv-script-lint.py` counts them.
- When the data has rows a viewer might find themselves in, show the full list at least once
  (all 32 districts, not just the top 5); people look for their own row.
- Show the draft to the editor in a code fence **with the recomputed facts underneath** and
  options (ok / fetch more data / edit). Do not voice before they say ok.
- Two files per line: `tN.txt` is the narration (numbers as Thai words, English names written
  as Thai sounds, one audio tag per clip at most: `[curious]`, `[thoughtful]`, `[warmly]`);
  `tN.cap.txt` is the captions (digits kept, one chunk per line).
- Check the script against "Words the voice mispronounces" in `docs/VOICE.md` before voicing;
  e.g. บก comes out บ๊ก, so the voice says "ศูนย์ย้ายสินค้า" while the screen keeps "ท่าเรือบก".

## Audio

```bash
python3 scripts/placeholder-voice.py --dir $W                   # free draft voice
python3 scripts/tts-clip.py --dir $W --force                    # paid: only after the script ok
python3 scripts/mv-timeline.py --dir $W                         # timeline.json + captions.srt
python3 scripts/mv-music.py --dur <DUR+2> --mood bright --out $W/music.wav   # free, procedural
python3 scripts/mv-mix.py --dir $W --music $W/music.wav --out $W/mix.m4a    # duck + sfx + -16 LUFS
```

- Generated-music APIs need a paid plan; `mv-music.py` is the default bed (moods: bright,
  minor, warm). Sound effects live in `sfx/` (burst, whoosh, highlight, pop, end); add new
  kinds as `sfx-<kind>.mp3` (ElevenLabs `/v1/sound-generation` works on the free tier).
- `mv-timeline.py` writes `T` scene windows, `START` per clip (first at 0.5 s, then previous
  end + 0.5 s; `--gap` to change), `NAR` captions split on the measured pauses (`{a,b,t}`,
  `\n` for a second line), draft `SFX` cues, `DUR` = last clip end + 3.5 s for the end card,
  and the `.srt` from `NAR`. Adjust by hand if a caption break lands badly.
- Share `mix.m4a` with the editor before the visuals are final; it is cheap to change.
