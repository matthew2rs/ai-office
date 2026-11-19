#!/bin/bash
# AI Office: copy the two skills and the house rules into your Claude folder. Safe to run again.
set -euo pipefail
KIT="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$HOME/.claude/skills"
for s in manager-checkin decide-card; do
  rm -rf "$HOME/.claude/skills/$s"
  cp -R "$KIT/claude/skills/$s" "$HOME/.claude/skills/$s"
  echo "installed skill: $s"
done
RULES="$HOME/.claude/ai-office-rules.md"
if [ -f "$RULES" ]; then
  echo "kept your existing $RULES (delete it and run again to reset)"
else
  sed "s#FILL IN: /Users/you/ai-office-kit (install.sh fills this in)#$KIT#" "$KIT/claude/CLAUDE.md" > "$RULES"
  echo "copied the house rules to $RULES: fill in your board link and your name"
fi
echo "Next: add this line to ~/.claude/CLAUDE.md so every session reads the rules:"
echo "@~/.claude/ai-office-rules.md"
