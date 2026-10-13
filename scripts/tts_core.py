"""tts_core.py: voice config, ElevenLabs render with key rotation, PaxaLabs backup, clip cache.

Used by tts-clip.py and tts-cached.py. Everything is configured from the environment
(or the repo's `.env`); see `.env.example` and docs/VOICE.md.
"""
from __future__ import annotations

import hashlib
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Dict, Optional, Tuple

import tts_ledger

ROOT = tts_ledger.ROOT
CHARS_PER_SEC = 12          # measured on a Thai narration: 619 chars came out at about 52 s
COST_PER_CHAR_USD = 0.00030  # ElevenLabs list price per character at the time of writing


def config(**over) -> Dict:
    """Voice settings. Defaults are the expressive set this kit was tuned on."""
    tts_ledger.load_env()
    env = os.environ.get
    c = {
        "voice_id": env("ELEVENLABS_VOICE_ID", ""),
        "model_id": env("ELEVENLABS_MODEL_ID", "eleven_v4"),
        "stability": float(env("TTS_STABILITY", "0.25")),
        "similarity_boost": float(env("TTS_SIMILARITY", "0.75")),
        "style": float(env("TTS_STYLE", "0.75")),
        "output_format": env("TTS_OUTPUT_FORMAT", "mp3_44100_128"),
        "backend": env("TTS_BACKEND", "elevenlabs"),
        "paxa_voice": env("PAXALABS_VOICE", "tako"),
        "paxa_model": env("PAXALABS_MODEL", "paxa-tts-flash-v1"),
    }
    c.update({k: v for k, v in over.items() if v is not None})
    return c


def estimate(text: str) -> Dict:
    n = len(text)
    return {"chars": n, "est_seconds": round(n / CHARS_PER_SEC, 1),
            "est_cost_usd": round(n * COST_PER_CHAR_USD, 4)}


# ── ElevenLabs ────────────────────────────────────────────────────────────────

def _call_elevenlabs(text: str, key: str, c: Dict):
    body = json.dumps({
        "text": text,
        "model_id": c["model_id"],
        "voice_settings": {
            "stability": c["stability"],
            "similarity_boost": c["similarity_boost"],
            "style": c["style"],
            "use_speaker_boost": True,
        },
    }, ensure_ascii=False).encode("utf-8")
    url = (f"https://api.elevenlabs.io/v1/text-to-speech/{c['voice_id']}"
           f"?output_format={c['output_format']}")
    req = urllib.request.Request(url, data=body, headers={
        "xi-api-key": key, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=90) as resp:
        return resp.read(), resp.headers


def generate_mp3(text: str, **over) -> bytes:
    """Render on a key that has room for THIS clip; raise RuntimeError if none can.

    Order comes from tts_ledger.pick_order: keys whose balance covers len(text), soonest
    reset first, then the rest as a fallback. The exact charge comes back in the
    `character-cost` header and is appended to the ledger, since the balance API lags.
    """
    c = config(**over)
    if not c["voice_id"]:
        raise RuntimeError("ELEVENLABS_VOICE_ID is not set (any voice from your ElevenLabs library works)")
    labels = [label for label, _ in tts_ledger.keys()]
    if not labels:
        raise RuntimeError("no ElevenLabs key: set ELEVENLABS_API_KEY or ELEVENLABS_API_KEYS")
    try:
        rows = {r["key"]: r for r in (tts_ledger.probe(k) for k in labels)}
        order = tts_ledger.pick_order(list(rows.values()), len(text))
    except Exception as e:  # probing is an optimisation, never a blocker
        print(f"[tts] balance probe failed ({type(e).__name__}), using default order", file=sys.stderr)
        rows, order = {}, labels
    last_err = None
    for label in order:
        key = tts_ledger.key_value(label)
        if not key:
            continue
        try:
            data, headers = _call_elevenlabs(text, key, c)
            if data[:1] == b"{":  # ElevenLabs answers JSON on errors (quota, invalid key)
                err = json.loads(data)
                code = err.get("detail", {}).get("status", "") if isinstance(err.get("detail"), dict) else ""
                if code in ("quota_exceeded", "too_many_requests", "invalid_api_key"):
                    print(f"[tts] {label}: {code}, trying next key", file=sys.stderr)
                    last_err = f"{label}: {code}"
                    continue
                raise RuntimeError(f"ElevenLabs error on {label}: {err}")
            try:
                cost = int(headers.get("character-cost") or len(text))
            except ValueError:
                cost = len(text)
            row = rows.get(label) or {}
            tts_ledger.record(label, cost, headers.get("request-id"), c["model_id"],
                              row.get("used") if row.get("ok") else None)
            print(f"[tts] {label} charged {cost} chars", file=sys.stderr)
            return data
        except urllib.error.HTTPError as e:
            body = e.read(400).decode("utf-8", errors="replace")
            if e.code in (429, 401):
                print(f"[tts] {label}: HTTP {e.code}, trying next key", file=sys.stderr)
                last_err = f"{label}: HTTP {e.code}"
                continue
            raise RuntimeError(f"ElevenLabs HTTP {e.code} on {label}: {body}")
    raise RuntimeError(f"All ElevenLabs keys exhausted. Last error: {last_err}")


# ── PaxaLabs backup voice (optional) ──────────────────────────────────────────

def _paxa_keys():
    tts_ledger.load_env()
    pool = [k.strip() for k in os.environ.get("PAXALABS_API_KEYS", "").split(",") if k.strip()]
    single = os.environ.get("PAXALABS_API_KEY", "").strip()
    return pool or ([single] if single else [])


def generate_mp3_paxa(text: str, **over) -> bytes:
    c = config(**over)
    keys = _paxa_keys()
    if not keys:
        raise RuntimeError("no PaxaLabs key: set PAXALABS_API_KEY or PAXALABS_API_KEYS")
    last_err = None
    for i, key in enumerate(keys, 1):
        req = urllib.request.Request(
            "https://api.paxalabs.com/v1/tts",
            data=json.dumps({"text": text, "voice": c["paxa_voice"], "model": c["paxa_model"]},
                            ensure_ascii=False).encode("utf-8"),
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=300) as resp:
                data = resp.read()
            if data[:1] == b"{":
                last_err = f"paxa key{i}: {data[:200]!r}"
                continue
            print(f"[tts] PaxaLabs key{i} voice {c['paxa_voice']} ({len(text)} chars)", file=sys.stderr)
            return data
        except urllib.error.HTTPError as e:
            last_err = f"paxa key{i}: HTTP {e.code}"
            print(f"[tts] {last_err}, trying next key", file=sys.stderr)
    raise RuntimeError(f"PaxaLabs backup failed too. Last error: {last_err}")


def render(text: str, **over) -> Tuple[bytes, str]:
    """ElevenLabs first; the PaxaLabs voice only when every ElevenLabs key is out
    (and a PaxaLabs key is configured), or when TTS_BACKEND=paxa forces it."""
    c = config(**over)
    if c["backend"] == "paxa":
        return generate_mp3_paxa(text, **over), "paxa:" + c["paxa_voice"]
    try:
        return generate_mp3(text, **over), "elevenlabs:" + c["voice_id"][:6]
    except RuntimeError as e:
        if "exhausted" not in str(e) or not _paxa_keys():
            raise
        print(f"[tts] {e}; falling back to PaxaLabs {c['paxa_voice']}", file=sys.stderr)
        return generate_mp3_paxa(text, **over), "paxa:" + c["paxa_voice"]


# ── content cache: never pay twice for the same line ──────────────────────────

def cache_dir() -> Path:
    tts_ledger.load_env()
    return Path(os.environ.get("TTS_CACHE_DIR") or ROOT / ".tts" / "cache")


def cache_key(text: str, c: Dict) -> str:
    fields = ("voice_id", "model_id", "stability", "similarity_boost", "style",
              "output_format", "backend")
    sig = dict({k: c[k] for k in fields}, text=text)
    sig = json.dumps(sig, ensure_ascii=False, sort_keys=True)
    return hashlib.sha256(sig.encode("utf-8")).hexdigest()[:20]


def cached_render(text: str, use_cache: bool = True, **over) -> Tuple[bytes, str, bool]:
    """(mp3 bytes, voice label, cache_hit). Same text + same settings = same file, free."""
    c = config(**over)
    path = cache_dir() / f"{cache_key(text, c)}.mp3"
    if use_cache and path.exists():
        return path.read_bytes(), "cache", True
    data, label = render(text, **over)
    if use_cache:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        idx = path.parent / "index.jsonl"
        with idx.open("a", encoding="utf-8") as f:
            f.write(json.dumps({"file": path.name, "text": text, "voice": label,
                                "style": c["style"], "stability": c["stability"]},
                               ensure_ascii=False) + "\n")
    return data, label, False
