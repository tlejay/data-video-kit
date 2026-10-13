# Voice guide: ElevenLabs narration, settings, Thai pronunciation, cost

Everything this kit knows about turning a script into narration. Read it before voicing
anything; `scripts/mv-script-lint.py` reads the mispronunciation table at the bottom of
this file, so keep that table's heading and shape.

## The one rule about money

**Voicing is the only paid step in the pipeline.** Music is procedural, mixing and
rendering are local. So:

- Voice only after the script is approved. A rewrite after voicing costs the whole clip again.
- Time drafts with free placeholder narration (`scripts/placeholder-voice.py`, macOS `say`
  or silence) and swap in the real takes at the end.
- Never schedule clips to render automatically; a person decides each paid render.
- The cache (below) makes re-runs of unchanged lines free.

## Setup

First time with ElevenLabs? [`ELEVENLABS-SETUP.md`](ELEVENLABS-SETUP.md) walks through the account,
a restricted API key (Text to Speech + User read only) and copying a Thai voice ID, with pictures.

Put these in `.env` at the repo root (copy `.env.example`; `.env` is git-ignored) or in your
shell environment:

| Variable | Required | Meaning |
|---|---|---|
| `ELEVENLABS_API_KEY` | yes (or the next one) | one ElevenLabs API key |
| `ELEVENLABS_API_KEYS` | optional | comma-separated pool of keys; the scripts pick the key that has room for each clip |
| `ELEVENLABS_VOICE_ID` | yes | any voice from your ElevenLabs Voice Library; copy its ID |
| `ELEVENLABS_MODEL_ID` | no, `eleven_v4` | `eleven_v3` also supports audio tags |
| `TTS_STABILITY` / `TTS_SIMILARITY` / `TTS_STYLE` | no, `0.25` / `0.75` / `0.75` | voice settings, see below |
| `TTS_BACKEND` | no, `elevenlabs` | `paxa` forces the backup voice |
| `PAXALABS_API_KEY(S)`, `PAXALABS_VOICE` | optional | backup voice when every ElevenLabs key is out |
| `TTS_CACHE_DIR`, `TTS_LEDGER` | no | default `.tts/cache`, `.tts/ledger.jsonl` |

Keys are only ever shown by label (`key1`, `key2`), never printed.

## Voice settings that worked

Model `eleven_v4` (chosen over v3 after an A/B on the same script), **stability 0.25, style
0.75, similarity 0.75**, speaker boost on. That is the expressive end of the range, which is
what audio tags need: raising stability makes tags weaker and the read flatter. Any voice
works; pick one that reads Thai cleanly and test a 2-line sample before a full script.

## Scripts

| Script | Use |
|---|---|
| `scripts/tts-clip.py --dir work` | voice every `tN.txt` into `tN.mp3` (skips existing; `--force` redoes) |
| `scripts/tts-clip.py t1.txt t1.mp3` | one clip |
| `scripts/tts-clip.py --dir work --dry-run` | characters, seconds and cost, no API call |
| `scripts/tts-cached.py "text" --out x.mp3 [--variant 2]` | short repeated phrases (sign-offs, stings), rendered once; variants give a different read |
| `scripts/tts-quota.py [--need N]` | balance per key (free call); `--need` exits 1 unless ONE key has N chars |
| `scripts/placeholder-voice.py --dir work` | free stand-in voice for timing drafts |

`tts-clip.py` and `tts-cached.py` share a content cache: the same text with the same voice,
model and settings is read from `.tts/cache` instead of calling the API. Use `--no-cache`
when you want a fresh take of an unchanged line.

## Budget: think per key, not in total

- ElevenLabs bills characters. A 60 s Thai narration is about 700 to 800 characters
  (about **12 Thai characters per second** spoken).
- **One clip is rendered by one key.** If you pool free accounts, the usable headroom is
  the best single key, never the sum. A check that summed the pool once said 34,367
  characters were left while the first four keys had under 500 each, and the render failed.
  `tts-quota.py --need N` checks the right thing.
- **A 401 usually means "not enough left on this key for this clip"**, not a dead key. The
  same key that refused a long clip rendered a short one hours later. Free accounts cannot
  overdraw, so the scripts pick a key that fits *before* sending.
- **The balance API lags.** `character_count` did not move for 20 s after a render. Every
  TTS response carries a `character-cost` header with the exact charge; the scripts append
  it to `.tts/ledger.jsonl` and use it as a floor for the next balance check.
- Speech-to-text (if you add it) does not consume the TTS character quota.

## Backup voice (optional)

If every ElevenLabs key is out and a PaxaLabs key is configured, `tts-clip.py` falls back to
PaxaLabs (`PAXALABS_VOICE`, default `tako`; about 10 credits per 1,000 characters on their
free tier). It is a different voice, so do not mix it into one video with the main voice.
`TTS_BACKEND=paxa` forces it for a test. The JSON output's `voice` field says which backend
spoke. Docs: https://paxalabs.com/docs

## Writing for the ear

- **Numbers as words** in the narration ("สิบหก", not "16"); captions keep digits. So each
  line has two files: `tN.txt` (spoken) and `tN.cap.txt` (on screen).
- **English names as Thai sounds** in the narration (a product name spelled the way it is
  said); units in full ("เมกะวัตต์", not "MW"). Subtitles may keep the English spelling.
- **No English abbreviations** the voice will spell letter by letter; say the Thai name.
- No markdown, no bullet syntax, no symbols: none of it survives speech.
- No em dash and no middle dot in narration or on screen (the lint checks it).
- Give the whole line in one call rather than word by word: the model acts better with context.
- **Words the voice mispronounces: rephrase, do not respell.** Respelling with different
  tone marks did not fix the cases below, so say something else in the voice and keep the
  real word on screen. Add every new case to the table; the lint fails scripts that use them.

## Audio tags

Square-bracket directions such as `[curious]` or `[thoughtful]` shape the read on
`eleven_v4`, `eleven_v4_turbo` and `eleven_v3`. Full cheat sheet: `docs/voice-audio-tags.md`.
For data videos: **at most one tag per clip**, usually none; `[curious]` on an opening
question, `[thoughtful]` before the payoff, `[warmly]` on the closing line.

## When it breaks

- TTS fails: keep the placeholder narration, deliver the stills and script, say the audio is
  pending. Never ship a video whose voice and captions disagree.
- A clip comes out too long for its scene: shorten the text, do not speed the audio up
  (sped-up Thai sounds rushed and tone marks blur).
- After replacing placeholder clips with real takes, **always re-run `mv-timeline.py`**:
  real clips have different lengths and pauses.

## Words the voice mispronounces

| Word | Heard as | What failed | Say instead |
|---|---|---|---|
| บก (ท่าเรือบก, ทางบก) | บ๊ก (high tone) | บ่ก, บ็อก, โบ่ก, `language_code: th`, "ดรายพอร์ต" | "ศูนย์ย้ายสินค้าจากรถขึ้นราง" |
