#!/usr/bin/env bash
# End-to-end demo with NO paid API: placeholder voice -> timeline -> music -> mix -> visuals -> render.
#   bash examples/korat-solar/run.sh            # stills + contact sheet only (fast)
#   bash examples/korat-solar/run.sh --full     # also the full MP4 (a few minutes)
# Output goes to examples/korat-solar/work/ (git-ignored).
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; KIT="$(cd "$HERE/../.." && pwd)"; W="$HERE/work"
rm -rf "$W"; mkdir -p "$W"; cp "$HERE"/script/t*.txt "$W/"
python3 "$KIT/scripts/mv-script-lint.py" "$W"
python3 "$KIT/scripts/placeholder-voice.py" --dir "$W"          # swap for tts-clip.py --dir "$W" once approved
python3 "$KIT/scripts/mv-timeline.py" --dir "$W"
DUR=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['DUR'])" "$W/timeline.json")
python3 "$KIT/scripts/mv-music.py" --dur "$(python3 -c "print($DUR+2)")" --mood bright --out "$W/music.wav"
python3 "$KIT/scripts/mv-mix.py" --dir "$W" --music "$W/music.wav" --out "$W/mix.m4a"
mkdir -p "$W/visual"; cp -R "$KIT/templates/line-cartoon/"* "$W/visual/"; cp "$W/timeline.json" "$W/visual/"
python3 "$W/visual/build.py" --title "Solar Korat"
python3 "$KIT/scripts/mv-render.py" --html "$W/visual/index.html" --duration "$DUR" --preview 1,8,18,28,40,50,60
python3 "$KIT/scripts/mv-safezone.py" "$W/visual/preview/f00003.jpg" --out "$W/visual/safe-check.png"
echo "Read $W/visual/contact.jpg and $W/visual/safe-check.png"
if [[ "${1:-}" == "--full" ]]; then
  python3 "$KIT/scripts/mv-render.py" --html "$W/visual/index.html" --duration "$DUR" --audio "$W/mix.m4a@0" --out "$W/final.mp4"
  cp "$W/captions.srt" "$W/final.srt"; echo "Deliver: $W/final.mp4 + $W/final.srt"
fi
