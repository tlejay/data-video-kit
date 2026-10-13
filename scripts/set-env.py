#!/usr/bin/env python3
"""Set one KEY=VALUE in the kit's .env (creates it from .env.example), replacing an
existing line instead of appending a duplicate. Safe to re-run.

    python3 scripts/set-env.py DVK_TEMPLATE line-cartoon
    python3 scripts/set-env.py ELEVENLABS_VOICE_ID <voice id>
    python3 scripts/set-env.py --get DVK_MUSIC_MOOD      # print a NON-secret value
    python3 scripts/set-env.py --has ELEVENLABS_API_KEY  # exit 0 if set (value never printed)

For API keys prefer editing .env yourself, so the key never passes through a chat or a
shell history. --get refuses names containing KEY, TOKEN or SECRET.
"""
import argparse, re, shutil, sys
from pathlib import Path

KIT = Path(__file__).resolve().parents[1]
ENV = KIT / ".env"
SECRET = re.compile(r"KEY|TOKEN|SECRET", re.I)


def read(create=True):
    if not ENV.exists():
        if not create:
            return []
        ex = KIT / ".env.example"
        shutil.copy(ex, ENV) if ex.exists() else ENV.write_text("")
    return ENV.read_text(encoding="utf-8").splitlines()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("name")
    ap.add_argument("value", nargs="?")
    ap.add_argument("--get", action="store_true")
    ap.add_argument("--has", action="store_true")
    a = ap.parse_args()
    lines = read(create=not (a.get or a.has))
    pat = re.compile(rf"^\s*#?\s*{re.escape(a.name)}\s*=")
    cur = next((l.split("=", 1)[1].strip() for l in lines if re.match(rf"^\s*{re.escape(a.name)}\s*=", l)), "")
    if a.has:
        return 0 if cur else 1
    if a.get:
        if SECRET.search(a.name):
            sys.exit("refusing to print a secret; use --has")
        print(cur)
        return 0
    if a.value is None:
        ap.error("value required")
    new = f"{a.name}={a.value}"
    for i, l in enumerate(lines):
        if pat.match(l):
            lines[i] = new
            break
    else:
        lines.append(new)
    ENV.write_text("\n".join(lines) + "\n", encoding="utf-8")
    shown = "(hidden)" if SECRET.search(a.name) else a.value
    print(f"{a.name}={shown} -> {ENV}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
