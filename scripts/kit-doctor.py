#!/usr/bin/env python3
"""Check that the kit is ready, and run a free smoke test of the whole pipeline.

    python3 scripts/kit-doctor.py             # prerequisites + config
    python3 scripts/kit-doctor.py --smoke     # + lint, music, placeholder voice, timeline, mix, preview render
    python3 scripts/kit-doctor.py --json      # machine readable (used by /kiki-init)

Every line is PASS / WARN / FAIL / SKIP with the fix for anything not passing.
Spends nothing: no paid API is called (key checks only look at whether values are set).
Safe to re-run; smoke-test output goes to a temporary folder that is deleted afterwards
(--keep to keep it).
"""
from __future__ import annotations

import argparse
import json
import os
import platform
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

KIT = Path(__file__).resolve().parents[1]
S = KIT / "scripts"
MAC = platform.system() == "Darwin"


def fix(mac: str, linux: str) -> str:
    return mac if MAC else linux


def run(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)


def checks():
    out = []
    add = lambda name, status, detail="", how="": out.append(
        {"step": name, "status": status, "detail": detail, "fix": how})

    v = sys.version_info
    add("python3 >= 3.9", "PASS" if v >= (3, 9) else "FAIL", f"{v.major}.{v.minor}.{v.micro}",
        fix("brew install python", "sudo apt install python3 python3-pip"))
    for tool in ("ffmpeg", "ffprobe"):
        p = shutil.which(tool)
        add(tool, "PASS" if p else "FAIL", p or "not found",
            fix("brew install ffmpeg", "sudo apt install ffmpeg"))
    try:
        import numpy  # noqa: F401
        add("numpy", "PASS", numpy.__version__)
    except ImportError:
        add("numpy", "FAIL", "not installed", "python3 -m pip install -r requirements.txt")
    try:
        import playwright  # noqa: F401
        add("playwright (python)", "PASS")
        r = run([sys.executable, "-c",
                 "from playwright.sync_api import sync_playwright as s\n"
                 "p=s().start(); b=p.chromium.launch(); b.close(); p.stop()"], timeout=90)
        add("chromium for playwright", "PASS" if r.returncode == 0 else "FAIL",
            "" if r.returncode == 0 else r.stderr.strip().splitlines()[-1][:120] if r.stderr.strip() else "launch failed",
            "python3 -m playwright install chromium" + ("" if MAC else "  (and: python3 -m playwright install-deps chromium)"))
    except ImportError:
        add("playwright (python)", "FAIL", "not installed", "python3 -m pip install -r requirements.txt")
        add("chromium for playwright", "SKIP", "needs playwright first", "python3 -m playwright install chromium")
    node = shutil.which("node")
    add("node (optional, README tooling only)", "PASS" if node else "WARN", node or "not found",
        fix("brew install node", "sudo apt install nodejs npm"))
    say = shutil.which("say") or shutil.which("espeak-ng")
    add("placeholder voice engine (optional)", "PASS" if say else "WARN", say or "none: silence will be used",
        fix("built into macOS (add the Thai voice Kanya in Spoken Content settings)", "sudo apt install espeak-ng"))
    if MAC and shutil.which("say"):
        r = run(["say", "-v", "?"])
        has = "Kanya" in r.stdout
        add("Thai voice Kanya (optional)", "PASS" if has else "WARN", "" if has else "not installed",
            "System Settings > Accessibility > Spoken Content > System voice > Manage Voices > Thai")

    dest = Path(os.environ.get("CLAUDE_SKILLS_DIR", Path.home() / ".claude" / "skills"))
    for s in ("data-video", "motion-video", "kiki-init"):
        ok = (dest / s / "SKILL.md").exists()
        add(f"skill {s} in {dest}", "PASS" if ok else "WARN",
            "" if ok else "only available when Claude Code runs inside this folder", "bash install.sh")
    env_ok = bool(os.environ.get("DATA_VIDEO_KIT"))
    add("DATA_VIDEO_KIT set", "PASS" if env_ok else "WARN", os.environ.get("DATA_VIDEO_KIT", ""),
        f'echo \'export DATA_VIDEO_KIT="{KIT}"\' >> ~/.zshrc')

    sys.path.insert(0, str(S))
    import tts_ledger
    tts_ledger.load_env()
    envf = KIT / ".env"
    add(".env file", "PASS" if envf.exists() else "WARN", "" if envf.exists() else "missing (voice step only)",
        "cp .env.example .env  then fill in the voice values")
    n = len(tts_ledger.keys())
    add("ElevenLabs key(s) set", "PASS" if n else "WARN", f"{n} key(s) configured (values not shown)",
        "set ELEVENLABS_API_KEY (or ELEVENLABS_API_KEYS) in .env")
    vid = bool(os.environ.get("ELEVENLABS_VOICE_ID"))
    add("ELEVENLABS_VOICE_ID set", "PASS" if vid else "WARN", "", "set ELEVENLABS_VOICE_ID in .env (any voice works)")
    r = run(["git", "-C", str(KIT), "check-ignore", "-q", ".env"])
    add(".env is git-ignored", "PASS" if r.returncode == 0 else "FAIL", "",
        "add .env to .gitignore before anything else")
    return out


def smoke(keep: bool):
    out = []
    add = lambda name, ok, detail="", how="": out.append(
        {"step": name, "status": "PASS" if ok else "FAIL", "detail": detail, "fix": how})
    tmp = Path(tempfile.mkdtemp(prefix="dvk-smoke-"))
    ex = KIT / "examples" / "korat-solar" / "script"
    try:
        for p in ex.glob("t*.txt"):
            shutil.copy(p, tmp / p.name)
        r = run([sys.executable, str(S / "mv-script-lint.py"), str(tmp)])
        add("lint example script", r.returncode == 0, r.stdout.strip().splitlines()[-1] if r.stdout else r.stderr[-200:],
            "read the FAIL lines; the example should pass as shipped")
        r = run([sys.executable, str(S / "mv-music.py"), "--dur", "5", "--out", str(tmp / "short.wav")])
        add("mv-music short wav", r.returncode == 0 and (tmp / "short.wav").exists(), r.stdout.strip() or r.stderr[-200:],
            "python3 -m pip install numpy")
        r = run([sys.executable, str(S / "placeholder-voice.py"), "--dir", str(tmp)], timeout=180)
        add("placeholder narration", r.returncode == 0, r.stdout.strip().splitlines()[-1] if r.stdout.strip() else r.stderr[-200:],
            "check ffmpeg; or run with --engine silence")
        r = run([sys.executable, str(S / "mv-timeline.py"), "--dir", str(tmp)])
        add("timeline.json + srt", r.returncode == 0, r.stdout.strip() or r.stderr[-200:], "needs ffmpeg and the placeholder clips")
        if r.returncode == 0:
            dur = json.loads((tmp / "timeline.json").read_text())["DUR"]
            r = run([sys.executable, str(S / "mv-music.py"), "--dur", str(dur + 2), "--out", str(tmp / "music.wav")])
            r = run([sys.executable, str(S / "mv-mix.py"), "--dir", str(tmp), "--music", str(tmp / "music.wav"),
                     "--out", str(tmp / "mix.m4a")])
            add("mix narration + music + sfx", r.returncode == 0, r.stdout.strip() or r.stderr[-200:], "ffmpeg must be on PATH")
            vis = tmp / "visual"
            shutil.copytree(KIT / "templates" / "line-cartoon", vis)
            shutil.copy(tmp / "timeline.json", vis / "timeline.json")
            run([sys.executable, str(vis / "build.py")])
            r = run([sys.executable, str(S / "mv-render.py"), "--html", str(vis / "index.html"),
                     "--duration", str(dur), "--preview", "1,20,40"], timeout=300)
            ok = r.returncode == 0 and (vis / "contact.jpg").exists()
            add("render preview (line-cartoon)", ok, str(vis / "contact.jpg") if ok else r.stderr[-300:],
                "python3 -m playwright install chromium; fonts load from Google Fonts, so stay online")
    finally:
        if keep:
            out.append({"step": "smoke folder kept", "status": "PASS", "detail": str(tmp), "fix": ""})
        else:
            shutil.rmtree(tmp, ignore_errors=True)
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--smoke", action="store_true")
    ap.add_argument("--keep", action="store_true")
    ap.add_argument("--json", action="store_true")
    a = ap.parse_args()
    rows = checks() + (smoke(a.keep) if a.smoke else [])
    if a.json:
        print(json.dumps(rows, ensure_ascii=False, indent=1))
    else:
        for r in rows:
            line = f"{r['status']:4}  {r['step']}"
            if r["detail"]:
                line += f"  ({r['detail']})"
            print(line)
            if r["status"] in ("FAIL", "WARN") and r["fix"]:
                print(f"      fix: {r['fix']}")
    return 1 if any(r["status"] == "FAIL" for r in rows) else 0


if __name__ == "__main__":
    raise SystemExit(main())
