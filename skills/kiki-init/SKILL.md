---
name: kiki-init
description: First-run setup for the data-video kit. Walks a new user through prerequisites (python3, ffmpeg, node, Playwright + Chromium, pip deps), installs the skills into ~/.claude/skills, sets the ElevenLabs key and voice in .env without ever echoing the key, picks a default template and music mood, then runs a free smoke test and reports pass/fail per step with the fix. Idempotent, safe to re-run. Trigger - /kiki-init, "set up the data video kit", "ติดตั้ง kit วิดีโอ", "เริ่มใช้งานครั้งแรก".
allowed-tools: Bash Read Edit Write AskUserQuestion
---

# /kiki-init: set up the data-video kit

Goal: from a fresh clone to "make your first video" in one sitting, with every step
checked rather than assumed. **Idempotent:** start every run with the doctor, skip what
already passes, and never redo a done step unless the user asks.

Ask with **AskUserQuestion**, one batch at a time, short options, a recommended option
first. Speak the user's language (Thai if they write Thai).

## 0. Find the kit and take stock

The kit folder is the one holding `scripts/kit-doctor.py`: `$DATA_VIDEO_KIT` if set, else the
current repo, else ask the user where they cloned it. Then:

```bash
python3 "$KIT/scripts/kit-doctor.py" --json
```

Show a compact table of the result (step, status). Only the WARN/FAIL rows need work;
if everything passes, jump to step 5 (smoke test).

## 1. Prerequisites (only the failing ones)

Detect the OS (`uname -s`; on Windows, the kit runs inside **WSL2 Ubuntu**: tell the user
to open the WSL terminal and use the Linux commands, since Playwright and `say` differ
natively). Batch one AskUserQuestion: "Install the missing tools now?" (Install all /
Show me the commands / Skip). Commands per tool:

| Tool | macOS (Homebrew first) | Debian/Ubuntu (and WSL) |
|---|---|---|
| Homebrew | `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` | n/a |
| python3 3.9+ | `brew install python` | `sudo apt install -y python3 python3-pip python3-venv` |
| ffmpeg + ffprobe | `brew install ffmpeg` | `sudo apt install -y ffmpeg` |
| node (optional) | `brew install node` | `sudo apt install -y nodejs npm` |
| pip deps | `python3 -m pip install -r requirements.txt` | same (add `--user`, or use a venv if pip refuses: `python3 -m venv .venv && . .venv/bin/activate`) |
| Chromium for Playwright | `python3 -m playwright install chromium` | `python3 -m playwright install --with-deps chromium` |
| placeholder voice (optional) | built in: add Thai voice "Kanya" in System Settings > Accessibility > Spoken Content > System voice > Manage Voices | `sudo apt install -y espeak-ng` |

Run the installs the user approved (sudo ones: show the command and let the user run it,
since a password prompt cannot be answered from here). Re-run the doctor after each group.

## 2. Install the skills

If the doctor shows the skills missing from `~/.claude/skills`, ask: Symlink (recommended,
follows `git pull`) / Copy / Skip (use only inside this folder). Then:

```bash
bash "$KIT/install.sh"            # or: bash "$KIT/install.sh" --copy
```

If `DATA_VIDEO_KIT` is not set, offer to append `export DATA_VIDEO_KIT="<kit path>"` to the
user's shell profile (`~/.zshrc` on macOS, `~/.bashrc` on Linux); check first with `grep`
so a re-run never adds it twice. Tell them it applies to new terminals.

## 3. Voice: ElevenLabs key and voice (the only paid part)

Explain in one line: everything is free except narration; without a key they can still run
the whole pipeline with placeholder voice.

Ask: Set up ElevenLabs now / Later (placeholder voice only). If now:

- **No account or key yet?** Point the user to `docs/ELEVENLABS-SETUP.md` (illustrated, Thai
  first): sign up, open https://elevenlabs.io/app/settings/api-keys, create a key restricted to
  **Text to Speech: Access** and **User: Read** with an optional credit limit, copy it once,
  then pick a Thai voice in https://elevenlabs.io/app/voice-library and Copy voice ID. Wait
  for them to come back before continuing.

- **API key: never ask the user to paste it into the chat, never print it, never commit it.**
  Run `python3 "$KIT/scripts/set-env.py" --has ELEVENLABS_API_KEY`; if it is unset, create
  `.env` from `.env.example` if needed (`cp -n .env.example .env`), then ask the user to open
  `.env` in their editor and fill `ELEVENLABS_API_KEY=`, or run
  `read -rs K && python3 scripts/set-env.py ELEVENLABS_API_KEY "$K"; unset K` themselves in a
  terminal (hidden input, stays out of shell history) (or `ELEVENLABS_API_KEYS=k1,k2,...`
  for several free accounts; one clip always renders on one key). Wait, then check again
  with `--has` (it prints nothing). If the user pastes a key into the chat anyway, write it
  into `.env` with the Edit tool, do not repeat it in any message, and suggest rotating it
  later if the chat is shared.
- **Voice ID** is not secret: ask for it (AskUserQuestion with an "I'll paste it" option),
  explain any voice works (Voices > My Voices > ⋯ > Copy voice ID, see step 6 of
  `docs/ELEVENLABS-SETUP.md`), then
  `python3 "$KIT/scripts/set-env.py" ELEVENLABS_VOICE_ID <id>`.
- Model and settings: keep the defaults (`eleven_v4`, stability 0.25, style 0.75, similarity
  0.75) unless they ask; point to `docs/VOICE.md`.
- Verify for free: `python3 "$KIT/scripts/tts-quota.py"` (balance per key, no characters spent).
  Do **not** render a test clip unless the user explicitly says yes (it costs credits).
- Confirm `.env` is ignored: `git -C "$KIT" check-ignore -q .env && echo ignored`.

## 4. Defaults: template and music mood

One AskUserQuestion batch with two questions:

1. Default visual template: `line-cartoon` (flat cartoon, light, many stickers; recommended
   for general topics) / `civic-poster` (deep colours, 3D objects, civic and economic topics) /
   `risograph` (print look, cover only so far; the first video builds it out).
   Show `templates/risograph-sample/preview.jpg` if they ask what it looks like.
2. Default music mood: `bright` (recommended) / `warm` / `minor` (serious topics).

Save with `set-env.py DVK_TEMPLATE <name>` and `set-env.py DVK_MUSIC_MOOD <mood>` (both
idempotent). These are defaults only: the `data-video` skill still offers 4 templates per video.

## 5. Smoke test (free)

```bash
python3 "$KIT/scripts/kit-doctor.py" --smoke --json
```

It lints the example script, makes a 5 s music wav, voices the example with placeholder
narration (`say` / `espeak-ng` / silence), writes timeline.json + SRT, mixes, and renders a
preview of the `line-cartoon` template. Report one line per step: PASS, or FAIL with the
`fix` from the JSON. For a failure, offer to apply the fix and re-run only that part. If the
user wants to see the result, re-run with `--keep` and show the contact sheet image.

## 6. Finish

Summarise in a few lines: what was installed, what was skipped (and how to do it later), the
defaults chosen, whether real voice is ready. End with exactly:

> Make your first video: `/data-video <your csv>`

Optional next step: `bash examples/korat-solar/run.sh --full` renders a complete example video for free.
