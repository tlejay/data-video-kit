#!/usr/bin/env python3
"""How much ElevenLabs budget is actually left, per key (free check, spends nothing).

The free tier is usually the binding constraint: each account has its own monthly
character allowance, resetting on *different* dates. The total across keys can look
adequate and still run dry mid-cycle, so check here before promising a clip rather than
discovering it at the 401.

    python3 scripts/tts-quota.py             human summary
    python3 scripts/tts-quota.py --json      machine readable
    python3 scripts/tts-quota.py --need 900  exit 1 if NO SINGLE key has 900 chars left

A clip is rendered by ONE key, so the usable headroom is the best single key, never the
sum. (Real case: the total said 34,367 chars while the first four keys had under 500
each; a sum-based check passed and ElevenLabs answered 401.)
"""
from __future__ import annotations

import argparse
import datetime
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from tts_ledger import keys, probe  # noqa: E402

CLIP = 750   # a 60 s Thai narration is about 700 to 800 characters


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--need", type=int, help="exit 1 unless one key has N chars left")
    a = ap.parse_args()

    labels = [label for label, _ in keys()]
    if not labels:
        print("no ElevenLabs key configured: set ELEVENLABS_API_KEY or ELEVENLABS_API_KEYS", file=sys.stderr)
        return 1
    rows = [probe(k) for k in labels]
    total = sum(r.get("left", 0) for r in rows if r["ok"])
    best = max([r.get("left", 0) for r in rows if r["ok"]] or [0])

    if a.json:
        print(json.dumps({"total_left": total, "best_key_left": best,
                          "clips": total // CLIP, "keys": rows}, ensure_ascii=False, indent=1))
    else:
        now = datetime.datetime.now()
        for r in rows:
            if not r["ok"]:
                print(f"  {r['key']:6} unusable  ({r['why']})")
                continue
            rs = datetime.datetime.fromisoformat(r["reset"]) if r["reset"] else None
            when = f"{rs:%d %b} (in {(rs - now).days}d)" if rs else "?"
            print(f"  {r['key']:6} {str(r.get('tier') or '?'):8} left {r['left']:>8,} / {r['limit']:>8,}  reset {when}")
        print(f"\n  total {total:,} chars left  =  ~{total // CLIP} clips at {CLIP} chars")
        print(f"  best single key {best:,} chars  <- a clip cannot span two keys")
        if a.need:
            print(f"  need {a.need:,} -> {'OK' if best >= a.need else 'NOT ENOUGH ON ANY ONE KEY'}")
    return 1 if a.need and best < a.need else 0


if __name__ == "__main__":
    raise SystemExit(main())
