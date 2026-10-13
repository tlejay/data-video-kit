#!/usr/bin/env python3
"""Short phrases and repeated lines from a local cache, rendered once and reused.

Use it for anything you voice more than once: a channel's sign-off, an intro sting,
a line you keep re-timing. Same text + same settings = the same file, no new charge.
`--variant N` renders a slightly different read (style/stability cycle) so a phrase
used in every video does not sound copy-pasted; rotate variants across clips.

    python3 scripts/tts-cached.py "แล้วคุณล่ะ คิดว่ายังไง" --out outro.mp3
    python3 scripts/tts-cached.py "แล้วคุณล่ะ คิดว่ายังไง" --variant 2 --out outro-2.mp3
    python3 scripts/tts-cached.py --list           # what is cached
    python3 scripts/tts-cached.py "..." --dry-run  # cached already? cost if not

Cache lives in .tts/cache (or TTS_CACHE_DIR); index.jsonl records text and settings.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import tts_core  # noqa: E402

# Variant k uses STYLE[k-1], STAB[k-1]; variant 1 = the default settings.
STYLE_CYCLE = [None, 0.65, 0.85]
STAB_CYCLE = [None, 0.30, 0.40]


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("text", nargs="?")
    ap.add_argument("--out", help="copy the clip here")
    ap.add_argument("--variant", type=int, default=1, help="1..3, different read of the same text")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    if a.list:
        idx = tts_core.cache_dir() / "index.jsonl"
        if not idx.exists():
            print("(cache empty)")
            return 0
        for line in idx.read_text(encoding="utf-8").splitlines():
            r = json.loads(line)
            print(f"{r['file']}  style={r['style']} stab={r['stability']}  {r['text'][:60]}")
        return 0
    if not a.text:
        ap.print_help()
        return 1

    k = (a.variant - 1) % len(STYLE_CYCLE)
    over = {"style": STYLE_CYCLE[k], "stability": STAB_CYCLE[k]}
    c = tts_core.config(**over)
    path = tts_core.cache_dir() / f"{tts_core.cache_key(a.text, c)}.mp3"
    if a.dry_run:
        print(json.dumps({"cached": path.exists(), "cache_file": str(path),
                          **tts_core.estimate(a.text)}, ensure_ascii=False))
        return 0
    data, voice, hit = tts_core.cached_render(a.text, **over)
    if a.out:
        Path(a.out).write_bytes(data)
    print(json.dumps({"cache_file": str(path), "out": a.out, "cache_hit": hit, "voice": voice},
                     ensure_ascii=False))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except RuntimeError as e:
        print(f"[tts] {e}", file=sys.stderr)
        raise SystemExit(1)
