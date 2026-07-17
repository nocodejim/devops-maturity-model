---
name: vibe-code-audit
description: Systematic read-only audit of AI-generated or rapidly-built code for dead code, silent failures, performance traps, correctness debt, and leaky diagnostics. Use when inheriting, reviewing, or hardening a codebase that was built fast without review ("vibe coded"). Produces a severity-ranked findings report; does not change code.
---

# Vibe-Code Audit

You are auditing a codebase that was built quickly — likely AI-assisted, likely
without consistent review. Your job is to produce a **severity-ranked findings
report**, not to fix anything. This audit is strictly **read-only**: if you
spot something tempting to fix, write it down and move on.

The audit assumes a FastAPI + SQLAlchemy backend and a React + TypeScript
frontend, but the method applies to any stack — adapt the recipes.

## Ground rules

1. **Read-only.** No edits, no formatting, no "quick fixes."
2. **Evidence, not vibes.** Every finding cites a file and line, quotes the
   offending code, and states the concrete failure mode.
3. **Rank ruthlessly.** A report with 10 ranked findings beats one with 60
   unranked ones. Severity = (how bad when it bites) × (how likely it bites).
4. **Verify before reporting.** A module that *looks* orphaned may be loaded
   dynamically. Confirm each finding with a second signal (grep for imports,
   check the router registration, run the type-checker) before writing it up.
5. **Fix the scope before starting.** Agree which directories are in and out,
   and which topics are owned elsewhere (e.g. auth handled by an external
   service, secrets covered by a separate audit). Record scope and exclusions
   in the report — observed-but-out-of-scope items get one line there, not a
   ranked finding.

## Phase 1 — Inventory

Establish what actually runs before judging anything:

- **Entry points:** locate the app factory / main module. For FastAPI, list
  every `include_router(...)` call — routers defined but never included are
  instant dead-code candidates. For the frontend, walk the route table and
  note which pages are reachable.
- **Declared vs. imported dependencies:** compare `pyproject.toml` /
  `package.json` against actual imports. Both directions matter: unused
  declared deps (bloat, attack surface) and imports satisfied only
  transitively (breakage waiting to happen).
- **Configuration surface:** find the settings module(s) and every place env
  vars are read. Note anything read but never set, or set but never read.

## Phase 2 — Automated signal pass

Cheap tools first; they seed the manual passes. Run what's available in the
project's container; skip what isn't installed rather than installing globally.

Backend:

```bash
# Silent failure candidates
grep -rn "except Exception" --include="*.py" app/ | grep -v test
grep -rn "except:" --include="*.py" app/
# Print-debugging in app code
grep -rn "print(" --include="*.py" app/ | grep -v test
# Deprecated datetime usage (naive timestamps)
grep -rn "datetime.utcnow" --include="*.py" .
# Lint with everything on, then triage
ruff check --select ALL --statistics app/ 2>/dev/null | head -40
# Dead code candidates (verify each by hand afterward)
vulture app/ --min-confidence 80 2>/dev/null
```

Frontend:

```bash
# Console noise and potential credential logging
grep -rn "console\.log" src/ | wc -l
grep -rnE "console\.log.*(password|token|credential|email|response)" src/
# Unused exports / files / deps (knip preferred; ts-prune as fallback)
npx knip 2>/dev/null || npx ts-prune 2>/dev/null
# Type-check is a free audit
npx tsc --noEmit
```

Record raw counts (e.g. "N console.log calls, M broad excepts") — they
calibrate how deep the manual passes need to go.

## Phase 3 — Category passes

Work through the five categories. For each, the recipe, the smell, and the
failure mode to describe in the finding.

### 3.1 Dead code

Vibe-coded projects accumulate abandoned experiments instead of deleting them.

- Modules imported nowhere (`grep -rn "import <name>\|from .* import <name>"`).
  Classic case: a several-hundred-line "engine" module superseded by a rewrite
  but never removed.
- Routers/blueprints defined but not registered, or registered lines
  commented out in the entry point.
- Frontend API-client functions that return canned/stub data ("DEPRECATED",
  `return { data: [] }`) — worse than dead: callers get plausible fake data.
- Dependencies declared but never imported.
- Failure mode to cite: dead code still gets read by humans and AI agents,
  shows up in searches, and silently diverges from the schema/API it mimics.

### 3.2 Silent failures

The signature vibe-code defect: errors converted into defaults so the demo
keeps working.

- `except Exception:` blocks that log nothing and return a fallback value.
- Lookups that fall back to a placeholder (`"Unknown X"`) instead of raising —
  these mask data-integrity bugs indefinitely.
- Guard clauses that prevent a crash (e.g. division by zero) but don't log the
  misconfiguration that made the guard necessary.
- Frontend `.catch()` that swallows, or API wrappers returning mock data on
  failure so the UI renders normally while the backend is down.
- Health endpoints that hardcode their answer (`"database": "connected"`
  without a `SELECT 1`) — a lying health check is worse than none.
- Calibration: an app-sized backend with only a handful of `except` blocks
  isn't clean — it means errors aren't being handled at all and are surfacing
  as raw 500s (or being swallowed upstream).

### 3.3 Performance traps

- **N+1 queries:** any loop whose body contains `db.query(...)` /
  `session.execute(...)`. Grep: `grep -rn -B5 "db.query" app/ | grep -A5 "for "`.
  Suggested fix to cite: `selectinload`/`joinedload` or one aggregate query.
- **Missing FK indexes:** for each `ForeignKey(...)` column in the models,
  check for `index=True` or an explicit `Index(...)`. FK columns used in
  `filter()`/joins without an index degrade linearly with table growth.
- **In-loop linear scans:** `next(x for x in list if ...)` inside another loop
  over related data — O(n·m) where a dict lookup is O(1).
- **Unmemoized React renders:** large `.map()` renders without `memo`/
  `useMemo`/`useCallback`; objects/Sets/arrays constructed inline in render
  bodies (new identity every render, defeats reconciliation and memoized
  children).

### 3.4 Correctness debt

- `datetime.utcnow()` (deprecated; naive) — should be
  `datetime.now(timezone.utc)`. Check model column defaults especially.
- **Missing per-resource access control:** for each router, ask "which rows
  can the authenticated user reach?" Look for list/get endpoints with no
  ownership or org filter, and roles defined in the model but never enforced
  in any dependency or check.
- Missing input validation: create endpoints that accept foreign keys without
  verifying the referenced row exists; enums accepted as raw strings.
- Missing uniqueness constraints for things the code assumes are unique
  (e.g. seed scripts that skip-if-name-exists imply a constraint that isn't
  in the schema).
- Mutable default arguments; response-schema fields that are declared but
  never populated (consumers may already depend on their absence).

### 3.5 Leaky diagnostics

- `console.log`/`print` of credentials, tokens, emails, or full API response
  bodies — flag any hit from the Phase 2 grep as high severity in auth flows.
- Debug flags defaulting to on (`DEBUG: bool = True`) — stack traces exposed
  in production by default.
- Verbose logging of request/response payloads that will end up in log
  aggregation with PII in it.

## Phase 4 — Report

Produce the report in exactly this format:

```markdown
# Vibe-Code Audit: <project> — <date>

## Scope
<what was audited, what was excluded, tools that ran vs. were unavailable>

## Summary
<3-5 sentences: overall condition, the dominant defect pattern, the single
most urgent finding>

## Findings

| # | Severity | Category | Location | Finding |
|---|----------|----------|----------|---------|
| 1 | CRITICAL | silent-failure | app/api/foo.py:42 | <one line> |

<Then one subsection per finding:>

### Finding 1 — <title>
- **Evidence:** <quoted code / command output>
- **Failure mode:** <concrete scenario: inputs/state → wrong outcome>
- **Suggested fix:** <one or two sentences; no code changes made>

## Quick wins
<findings fixable in minutes with near-zero risk — dead-file deletion,
index additions, log-line removals>

## Raw signal counts
<the Phase 2 numbers, for before/after comparison on the next audit>
```

Severity scale: **CRITICAL** (data loss, security exposure, silent corruption)
· **HIGH** (wrong results or outages under realistic conditions) · **MEDIUM**
(degradation, maintainability trap) · **LOW** (hygiene).

## Exit criteria

- Every category pass was executed (say so explicitly if a pass found nothing).
- Every finding has file:line, evidence, and a failure mode.
- The report ends with quick wins and raw counts.
- **No code was modified.**
