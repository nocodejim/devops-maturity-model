#!/usr/bin/env bash
# Structural lint for the hardening toolkit. Run before sharing the package.
#
# Hard failures (exit 1): broken frontmatter, name/dir mismatch, missing or
# stale prompt twins, origin-repo leakage (private hostnames, credentials,
# local paths).
# Warnings (exit 0): possible time-estimate language — review hits by hand;
# the NO-TIME-ESTIMATES rule forbids durations as planning promises, not the
# words themselves.
set -uo pipefail

TOOLKIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FAIL=0

fail() { echo "FAIL: $*"; FAIL=1; }
warn() { echo "warn: $*"; }
ok()   { echo "  ok: $*"; }

echo "== 1. Skill frontmatter =="
for skill_file in "$TOOLKIT_DIR"/skills/*/SKILL.md; do
  dir_name=$(basename "$(dirname "$skill_file")")
  head -1 "$skill_file" | grep -q '^---$' || fail "$dir_name: no frontmatter block"
  name=$(awk -F': *' '/^name:/{print $2; exit}' "$skill_file")
  description=$(awk -F': *' '/^description:/{sub(/^description: */,""); print; exit}' "$skill_file")

  [[ "$name" == "$dir_name" ]] || fail "$dir_name: frontmatter name '$name' != directory name"
  [[ "$name" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]] || fail "$dir_name: name not kebab-case"
  [[ -n "$description" ]] || fail "$dir_name: empty description"
  [[ ${#description} -lt 1024 ]] || fail "$dir_name: description >= 1024 chars"
  echo "$description" | grep -q "Use when" || fail "$dir_name: description lacks 'Use when' trigger clause"
  ok "$dir_name"
done

echo "== 2. Prompt twins in sync =="
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT
"$TOOLKIT_DIR/scripts/build-prompts.sh" "$TMP_DIR" > /dev/null || fail "build-prompts.sh errored"
for built in "$TMP_DIR"/*.md; do
  twin="$TOOLKIT_DIR/prompts/$(basename "$built")"
  if [[ ! -f "$twin" ]]; then
    fail "missing twin: prompts/$(basename "$built") (run scripts/build-prompts.sh)"
  elif ! diff -q "$built" "$twin" > /dev/null; then
    fail "stale twin: prompts/$(basename "$built") (run scripts/build-prompts.sh)"
  else
    ok "prompts/$(basename "$built")"
  fi
done
# Orphaned prompts (skill deleted but twin left behind)
for twin in "$TOOLKIT_DIR"/prompts/*.md; do
  [[ -f "$TMP_DIR/$(basename "$twin")" ]] || fail "orphaned prompt with no skill: prompts/$(basename "$twin")"
done

echo "== 3. Origin-repo leakage (hard fail) =="
# The package must be shareable: no private hostnames/IPs, no credentials
# from the origin repo, no local filesystem paths.
LEAK_PATTERNS='192\.168\.|localhost:86[0-9][0-9]|admin@example\.com|admin123|devops123|/home/[a-z]+|cinf\.net|lnxvthfth'
hits=$(grep -rnE "$LEAK_PATTERNS" "$TOOLKIT_DIR" \
        --include="*.md" --include="*.sh" \
        | grep -v "scripts/validate-toolkit.sh" \
        | grep -v "^Binary" || true)
if [[ -n "$hits" ]]; then
  echo "$hits"
  fail "origin-repo leakage found (above)"
else
  ok "no leakage patterns found"
fi

echo "== 4. Time-estimate language (review warnings by hand) =="
TIME_PATTERNS='[Ww]eek [0-9]|[0-9]+ (weeks?|sprints?)|[Pp]hase [0-9]+ \([0-9]|take about|takes about'
hits=$(grep -rnE "$TIME_PATTERNS" "$TOOLKIT_DIR" --include="*.md" \
        | grep -v "scripts/validate-toolkit.sh" || true)
if [[ -n "$hits" ]]; then
  echo "$hits"
  warn "possible time estimates — verify none is a duration promise"
else
  ok "no time-estimate language found"
fi

echo
if [[ $FAIL -eq 1 ]]; then
  echo "RESULT: FAIL"
  exit 1
fi
echo "RESULT: PASS"
