"""tts_ledger.py: ElevenLabs keys from the environment, balance per key, and a spend ledger.

Keys come from the environment (or the repo's `.env`, never committed):

    ELEVENLABS_API_KEYS=key_a,key_b,key_c   # optional pool, tried in balance order
    ELEVENLABS_API_KEY=key_a                # single key (used when the pool is empty)

Keys are shown only by label (`key1`, `key2`, ...), never by value.

Why the ledger exists (checked against the official API):

- `GET /v1/user/subscription` (also inside `GET /v1/user`) is the documented balance:
  character_limit minus character_count. It LAGS. A 5 character render came back with
  header `character-cost: 5`, and character_count had still not moved 20 seconds later,
  so checking right after a clip reads the old number.
- Every text-to-speech response carries `character-cost` (the exact charge) and
  `request-id`. That is the number to trust, so each render appends it to the ledger
  together with the balance seen just before sending.
- Free accounts cannot overdraw (`can_extend_character_limit: false`): a key without room
  for THIS clip answers 401 quota_exceeded. So pick a key that fits before sending
  instead of walking the list and collecting 401s.
- A 401 therefore usually means "this clip is longer than what is left on that key",
  not "the key is dead". The same key that refused a long clip in the morning rendered a
  250 character clip the same evening.

Effective used = max(API count, our own floor from recent ledger rows). The floor only
looks back RECENT_SEC: long enough to cover the API lag, short enough that a monthly
reset cannot be mistaken for spend.
"""
from __future__ import annotations

import datetime
import json
import os
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Dict, List, Optional, Tuple

ROOT = Path(__file__).resolve().parents[1]
RECENT_SEC = 3600


def load_env(path: Path = ROOT / ".env") -> None:
    """Read KEY=VALUE lines from the repo's .env into os.environ (real env wins)."""
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        v = v.strip().strip('"').strip("'")
        os.environ.setdefault(k.strip(), v)


def keys() -> List[Tuple[str, str]]:
    """[(label, value)] for every configured ElevenLabs key, pool first."""
    load_env()
    pool = [k.strip() for k in os.environ.get("ELEVENLABS_API_KEYS", "").split(",") if k.strip()]
    single = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if not pool and single:
        pool = [single]
    return [(f"key{i}", v) for i, v in enumerate(pool, 1)]


def key_value(label: str) -> Optional[str]:
    return dict(keys()).get(label)


def ledger_path() -> Path:
    load_env()
    return Path(os.environ.get("TTS_LEDGER") or ROOT / ".tts" / "ledger.jsonl")


def read_ledger(path: Optional[Path] = None) -> List[dict]:
    path = path or ledger_path()
    if not path.exists():
        return []
    rows = []
    for line in path.read_text(encoding="utf-8").splitlines():
        try:
            rows.append(json.loads(line))
        except ValueError:
            continue
    return rows


def ledger_floor(key: str, rows: List[dict], now: float) -> int:
    """Lowest character_count the API can honestly be at for this key, from our own
    renders in the last RECENT_SEC: the balance seen before a render plus everything
    charged from that render onward."""
    mine = sorted((r for r in rows if r.get("key") == key
                   and now - r.get("ts", 0) <= RECENT_SEC
                   and r.get("used_before") is not None),
                  key=lambda r: r["ts"])
    floor = 0
    for i, r in enumerate(mine):
        floor = max(floor, r["used_before"] + sum(x.get("cost", 0) for x in mine[i:]))
    return floor


def record(key: str, cost: int, request_id: Optional[str], model: str,
           used_before: Optional[int], path: Optional[Path] = None) -> None:
    path = path or ledger_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps({"ts": time.time(), "key": key, "cost": cost,
                            "request_id": request_id, "model": model,
                            "used_before": used_before}) + "\n")


def probe(label: str, rows: Optional[List[dict]] = None) -> Dict:
    """Balance of one key (free call: GET /v1/user, no characters spent)."""
    tok = key_value(label)
    if not tok:
        return {"key": label, "ok": False, "why": "not configured"}
    try:
        u = json.load(urllib.request.urlopen(urllib.request.Request(
            "https://api.elevenlabs.io/v1/user",
            headers={"xi-api-key": tok}), timeout=15))
    except urllib.error.HTTPError as e:
        return {"key": label, "ok": False,
                "why": "rejected by the API (401)" if e.code == 401 else f"HTTP {e.code}"}
    except Exception as e:  # network, DNS, timeout
        return {"key": label, "ok": False, "why": f"{type(e).__name__}: {str(e)[:60]}"}
    d = u.get("subscription", {})
    api_used = d.get("character_count", 0)
    used = max(api_used, ledger_floor(label, read_ledger() if rows is None else rows, time.time()))
    rs = d.get("next_character_count_reset_unix")
    return {"key": label, "ok": True,
            "used": used, "api_used": api_used,
            "left": d.get("character_limit", 0) - used,
            "limit": d.get("character_limit", 0),
            "tier": d.get("tier"),
            "reset_unix": rs,
            "reset": datetime.datetime.fromtimestamp(rs).isoformat() if rs else None}


def pick_order(rows: List[dict], need: int) -> List[str]:
    """Keys that can cover `need`, soonest reset first (spend what is about to expire
    anyway), then every other key in the usual order as a fallback in case a probe
    was wrong."""
    fit = sorted((r for r in rows if r.get("ok") and r["left"] >= need),
                 key=lambda r: (r.get("reset_unix") or float("inf"), r["key"]))
    first = [r["key"] for r in fit]
    return first + [label for label, _ in keys() if label not in first]
