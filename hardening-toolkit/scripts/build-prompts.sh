#!/usr/bin/env bash
# Regenerates prompts/ (tool-agnostic twins) from skills/ (canonical SKILL.md).
# SKILL.md is the single source of truth; never edit prompts/ by hand.
#
# Usage: scripts/build-prompts.sh [output_dir]
#   output_dir defaults to <toolkit>/prompts (pass a temp dir to diff-check).
set -euo pipefail

TOOLKIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${1:-$TOOLKIT_DIR/prompts}"
mkdir -p "$OUT_DIR"

for skill_file in "$TOOLKIT_DIR"/skills/*/SKILL.md; do
  name=$(awk -F': *' '/^name:/{print $2; exit}' "$skill_file")
  description=$(awk -F': *' '/^description:/{sub(/^description: */,""); print; exit}' "$skill_file")

  if [[ -z "$name" || -z "$description" ]]; then
    echo "ERROR: missing name/description frontmatter in $skill_file" >&2
    exit 1
  fi

  # kebab-case -> Title Case
  title=$(echo "$name" | sed -E 's/-/ /g; s/\b(.)/\u\1/g')

  {
    echo "# ${title} — Agent Prompt"
    echo
    echo "**Role:** You are an engineering agent executing the \"${name}\" playbook below."
    echo
    echo "**When to use this prompt:** ${description}"
    echo
    echo "---"
    echo
    # Body = everything after the closing '---' of the frontmatter block
    awk 'f>=2 {print} /^---$/ {f++}' "$skill_file"
  } > "$OUT_DIR/${name}.md"

  echo "built: prompts/${name}.md"
done
