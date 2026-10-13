#!/usr/bin/env bash
# Link the kit's skills into ~/.claude/skills so Claude Code finds them in any folder,
# and print the DATA_VIDEO_KIT line to add to your shell profile. Safe to re-run.
#   bash install.sh           # symlink (updates follow git pull)
#   bash install.sh --copy    # copy instead
set -euo pipefail
KIT="$(cd "$(dirname "$0")" && pwd)"; DEST="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"
mkdir -p "$DEST"
for s in data-video motion-video kiki-init; do
  if [[ -e "$DEST/$s" && ! -L "$DEST/$s" && "${1:-}" != "--copy" ]]; then
    echo "skip $s: $DEST/$s exists and is not a link (remove it or use --copy)"; continue; fi
  rm -rf "$DEST/$s"
  if [[ "${1:-}" == "--copy" ]]; then cp -R "$KIT/skills/$s" "$DEST/$s"; else ln -s "$KIT/skills/$s" "$DEST/$s"; fi
  echo "installed $s -> $DEST/$s"
done
echo
echo "Add to your shell profile (~/.zshrc or ~/.bashrc) so the skills find the scripts:"
echo "  export DATA_VIDEO_KIT=\"$KIT\""
