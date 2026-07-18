# Hardening Playbook

An ordered path from "vibe coded" to enterprise-ready for a containerized
FastAPI + React/TypeScript + PostgreSQL application. Each phase names the
skill that drives it and the exit criteria that gate the next phase.

Phases are strictly ordered — later phases assume the safety net built by
earlier ones. There are deliberately **no durations** here: how long a phase
takes depends on findings, and the humans decide pacing.

## Phase 0 — Adopt the contract

Install `CLAUDE-TEMPLATE.md` as the repo's `CLAUDE.md` (or `AGENTS.md`),
placeholders filled in. Every subsequent phase is executed under its rules:
real-environment verification, lessons-learned logging, no time estimates,
container-only development.

**Exit:** the template is committed, placeholders resolved, and the team/agent
sessions actually reference it.

## Phase 1 — Baseline safety

Know what you have and stop the bleeding before building anything.

1. **`secrets-config-hygiene`** (audit mode, then remediate). Hardcoded
   secrets are the one defect class where delay compounds: every day a
   committed credential stays valid is exposure. Remediate CRITICAL findings
   immediately; put the rotation list in front of whoever owns the
   environments.
2. **`vibe-code-audit`** (read-only). Produces the severity-ranked backlog
   that Phase 3 works through. Do not fix while auditing — mixing the two
   contaminates both.

**Exit:** secrets findings remediated or explicitly accepted; app fails fast
on missing config; audit report exists with ranked findings and quick wins;
both reports checked into the repo (or tracker) as the backlog of record.

## Phase 2 — Verification infrastructure

Build the safety net before touching the backlog — fixing code with no tests
and no CI just re-rolls the vibe-code dice.

1. **`test-backfill`**, priority tiers 1–2 at minimum: harness proven green
   in containers, pure domain logic covered. Tier 3 (API contract tests) for
   the most critical router if feasible.
2. **`ci-bootstrap`**: pre-commit hooks + pipeline. Lint, format, type-check,
   and build blocking immediately; the test job wired in and blocking as soon
   as the smoke suite exists. Branch protection on.

**Exit:** one blessed test command per side, green in containers; a
deliberately-broken PR gets rejected by CI; lockfiles committed.

## Phase 3 — Work the backlog

Fix the Phase 1 audit findings in severity order, under the new safety net.

- Quick wins first (dead-code deletion, index additions, log-line removal) —
  they shrink the codebase every later fix has to navigate.
- **Every fix ships with a regression test** (`test-backfill` tier 5
  discipline).
- Any fix that touches schema goes through **`migration-safety`** — no
  hand-written migrations, real downgrades, round-trip dry runs.
- Re-run the audit's raw-signal greps periodically; the counts should only
  go down.

**Exit:** all CRITICAL and HIGH findings fixed (with regression tests) or
explicitly accepted with a written reason; signal counts down from the
baseline recorded in the audit report.

## Phase 4 — Operability

Make the app diagnosable and honest in shared environments.

1. **`observability-bootstrap`**: structured logging, global exception
   handlers, request IDs, honest liveness/readiness endpoints wired into the
   orchestrator, frontend error boundary, credential-free consoles.
2. Tighten CI: tests now fully blocking; consider adding coverage reporting
   (visibility first, thresholds later).

**Exit:** zero `print()`/stray `console.log` in app code; a forced error
produces one correlated traceback and an opaque client response; readiness
endpoint verified against a stopped database.

## Phase 5 — Ongoing discipline

Hardening isn't a project that ends; it's a posture.

- **`verify-real-environment`** on every change, forever — the evidence rule
  in every completion report.
- **`migration-safety`** on every schema change.
- New bugs → lessons-learned entry + regression test, per the contract.
- Re-run **`vibe-code-audit`** after any period of rapid feature work; compare
  raw signal counts against the previous report. Rising counts mean the vibe
  is creeping back.

**Exit:** none. This phase is the steady state.

## Choosing a starting point mid-stream

If some phases are already partially done (e.g. work has CI but no tests):
run the Phase 1 audits regardless — they're cheap and produce the ground
truth — then enter the earliest phase whose exit criteria aren't met. Don't
skip Phase 2 because "we'll add tests later"; Phase 3 without a net is how
the codebase got here.
