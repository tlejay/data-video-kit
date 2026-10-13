# Example: Korat solar (free, no API keys)

A real 62 s video's script, re-voiced with free placeholder narration and rendered through
the `line-cartoon` template, so you can see every stage of the pipeline work before you
spend anything.

| File | What |
|---|---|
| `facts.csv` | the claims the script makes, with value, date, source and status |
| `script/tN.txt` | narration as spoken (numbers as Thai words) |
| `script/tN.cap.txt` | caption chunks (digits), one per line, `\n` = two-line caption |
| `timeline.reference.json` | the timeline of the original video (real ElevenLabs voice) for comparison |
| `run.sh` | the whole pipeline |

```bash
bash examples/korat-solar/run.sh          # lint, placeholder voice, timeline, music, mix, stills (~15 s)
bash examples/korat-solar/run.sh --full   # plus the full MP4 (a few minutes)
```

Output lands in `examples/korat-solar/work/` (git-ignored): `timeline.json`,
`captions.srt`, `music.wav`, `mix.m4a`, `visual/contact.jpg`, `visual/safe-check.png`, and
with `--full`, `final.mp4` + `final-small.mp4`.

Placeholder voice uses macOS `say` with the Thai voice Kanya (System Settings >
Accessibility > Spoken Content > System voice > Manage voices, add Thai), `espeak-ng` on
Linux, or silence if neither exists. To hear the real thing, set up `.env` (see
`docs/VOICE.md`) and replace the placeholder step with:

```bash
python3 scripts/tts-clip.py --dir examples/korat-solar/work --dry-run   # cost first
python3 scripts/tts-clip.py --dir examples/korat-solar/work --force
python3 scripts/mv-timeline.py --dir examples/korat-solar/work          # always re-time after new voice
```

What this example demonstrates from the skill: a "firsts" hook that lands in 3 s, a story
in time order (the first farm, today's rooftops, your roof) with no "แต่" pivot, two hero
numbers in a minute, a closing question pointed at the viewer, and sources on the end card.
