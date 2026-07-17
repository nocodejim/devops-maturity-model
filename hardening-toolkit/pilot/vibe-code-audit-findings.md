# Vibe-Code Audit: DevOps Maturity Assessment Platform (origin repo) — 2026-07-12

> Pilot run of the `vibe-code-audit` skill against the open-source origin
> repo, executed by following the SKILL.md verbatim. Ships with the toolkit
> as a worked example of the expected output.

## Scope

Audited: `backend/app/` and `frontend/src/` (the core app). Excluded:
SpiraApp experiments (`src/`, `projects/`, `spira-documentation/`,
`future-spiraapps/`, `tools/`), per project decision. Auth/token-storage
design was declared out of scope for this hardening effort (auth is
externally provided in the target environment); token-in-localStorage was
observed but not ranked. Secrets/config findings are reported separately by
the `secrets-config-hygiene` pilot.

Tools run: grep recipes (all), manual category passes (all). Unavailable in
this session: `vulture`, `knip`/`ts-prune`, `ruff --select ALL` (not
installed in the running containers; noted per skill — skipped rather than
installed globally).

## Summary

The codebase is clean and conventional in structure but carries the classic
fast-build defect set: a health endpoint that hardcodes its answer, login
diagnostics that print the full auth response to the console, unvalidated
foreign keys on the busiest create endpoint, zero indexes on any foreign-key
column, and a scoring engine that queries inside a per-domain loop. The
dominant pattern is **silent optimism** — code that reports success or
substitutes a default instead of surfacing a problem. The single most urgent
finding is the lying `/health` endpoint combined with `DEBUG=True` defaults:
both ship false signals to whoever operates this.

## Findings

| # | Severity | Category | Location | Finding |
|---|----------|----------|----------|---------|
| 1 | HIGH | silent-failure | backend/app/main.py:44-47 | `/health` hardcodes `"database": "connected"` without querying |
| 2 | HIGH | leaky-diagnostics | frontend/src/pages/LoginPage.tsx:21-31 | Login flow logs email and full auth response (incl. token) to console |
| 3 | HIGH | leaky-diagnostics | backend/app/config.py:35 | `DEBUG: bool = True` default — tracebacks exposed unless explicitly disabled |
| 4 | HIGH | correctness-debt | backend/app/api/assessments.py (create_assessment) | `framework_id`/`organization_id` accepted without existence or membership validation |
| 5 | MEDIUM | performance | backend/app/core/scoring.py:27-33 | N+1: two queries per domain inside the domain loop |
| 6 | MEDIUM | performance | backend/app/models.py (all FKs) | No index on any ForeignKey column; only `users.email` is indexed |
| 7 | MEDIUM | correctness-debt | backend/app/models.py:48-125 et al. | `datetime.utcnow` (deprecated, naive) as column default across every model |
| 8 | MEDIUM | silent-failure | backend/app/core/scoring.py:51,144 | `"Unknown Gate"` / `"Unknown Domain"` fallbacks mask referential-integrity bugs |
| 9 | MEDIUM | correctness-debt | backend/app/models.py / api/*.py | `VIEWER` role defined but never enforced anywhere |
| 10 | MEDIUM | silent-failure | backend/app/api/ (whole layer) | No global exception handler; ~zero error handling in routers — unhandled errors surface as raw 500s |
| 11 | MEDIUM | correctness-debt | frontend/src/services/api.ts:26-28 | Backend URL guessed from frontend port (`8673 → 8680`, else `8000`) — breaks on any other deployment shape |
| 12 | LOW | dead-code | backend/app/api/gates.py + main.py:31 | 9-line router, registration commented out; superseded but never deleted |
| 13 | LOW | dead-code | frontend/src/services/api.ts:207-208 | `gatesApi` stub marked DEPRECATED, returns canned data if ever called |
| 14 | LOW | performance | frontend/src/pages/AssessmentPage.tsx:213 | `new Set()` built inside render per domain; no memoization |
| 15 | LOW | silent-failure | backend/app/scripts/init_database.py:93,128 | Seed/init errors caught, printed, and execution continues as if fine |

### Finding 1 — /health reports a database connection it never makes
- **Evidence:** `return {"status": "healthy", "database": "connected"}` — no
  query, no session, no try/except.
- **Failure mode:** database down → orchestrator, load balancer, and humans
  all see "healthy"; traffic keeps routing; every request 500s while the
  health page is green.
- **Suggested fix:** liveness/readiness split; readiness executes `SELECT 1`
  and returns 503 with per-dependency status on failure (see
  `observability-bootstrap`).

### Finding 2 — Login flow logs credentials-adjacent data
- **Evidence:** `console.log('[Login] Starting login with email:', email)`
  and `console.log('[Login] Login response received:', response)` — the
  response object contains the access token.
- **Failure mode:** any screen-share, screenshot, browser extension, or
  error-reporting breadcrumb capture now contains a live bearer token and a
  user identifier.
- **Suggested fix:** dev-gated logger util; never log auth payloads in any
  environment (see `observability-bootstrap`).

### Finding 3 — DEBUG defaults to on
- **Evidence:** `DEBUG: bool = True` in the settings class.
- **Failure mode:** any deployment that forgets the env var runs with debug
  behavior and traceback exposure — insecure by default, secure by opt-in
  (backwards).
- **Suggested fix:** `DEBUG: bool = False`; dev opts in via `.env`.

### Finding 4 — create_assessment trusts client-supplied foreign keys
- **Evidence:** `framework_id=assessment_in.framework_id` and
  `organization_id=assessment_in.organization_id` written straight into the
  row; no existence check, no membership check.
- **Failure mode:** invalid `framework_id` → raw IntegrityError 500 (or an
  orphan assessment if constraints are lax); a user can attach an assessment
  to an organization they don't belong to.
- **Suggested fix:** validate referenced rows exist and the user may use
  them; return 422/403 accordingly.

### Finding 5 — Scoring engine queries per domain in a loop
- **Evidence:** `for domain in domains:` containing
  `db.query(FrameworkGate).filter(...)` and
  `db.query(FrameworkQuestion).filter(...)`; plus an O(n·m) `next(g for g in
  gates ...)` per question at scoring.py:50.
- **Failure mode:** 2 queries × domains per scoring call, growing with
  framework size; latency degrades as frameworks/domains are added.
- **Suggested fix:** fetch gates+questions for the framework in one pass
  (join or `selectinload`), build dict lookups.

### Finding 6 — No FK indexes
- **Evidence:** every `ForeignKey(...)` column in models.py lacks
  `index=True`; the API filters on `assessor_id`, `framework_id`,
  `assessment_id` constantly.
- **Failure mode:** sequential scans on the hottest filters; degrades
  linearly with data growth — invisible in dev, painful in production.
- **Suggested fix:** `index=True` on all FK columns via one autogenerated,
  reviewed migration (see `migration-safety`).

### Finding 7 — Deprecated naive datetimes everywhere
- **Evidence:** `default=datetime.utcnow` on every model's timestamp columns;
  also used in `assessments.py` (`started_at=datetime.utcnow()`).
- **Failure mode:** deprecated API (removal pending), naive timestamps
  ambiguous under timezone handling; comparisons with aware datetimes raise.
- **Suggested fix:** `datetime.now(timezone.utc)` (or DB-side
  `server_default=func.now()` with timezone-aware columns).

### Finding 8 — "Unknown Domain" fallbacks mask integrity errors
- **Evidence:** `gate_name = gate.name if gate else "Unknown Gate"`;
  `domain_name_map.get(ds.domain_id, "Unknown Domain")`.
- **Failure mode:** a broken FK or seed bug produces a plausible-looking
  report with "Unknown Domain" rows instead of an error — data-integrity
  bugs live forever.
- **Suggested fix:** log an error (or raise) on the missing reference; the
  fallback string may stay for display, but never silently.

### Finding 9 — VIEWER role is decorative
- **Evidence:** `UserRole.VIEWER` defined in models; grep shows role checks
  only for `ADMIN` (auth.py, organizations.py). No viewer restriction
  anywhere; assessments are ownership-scoped only.
- **Failure mode:** a "viewer" account can create/modify anything a member
  can — the role system promises a control that doesn't exist.
- **Suggested fix:** either enforce VIEWER (read-only dependency) or delete
  the role; a decorative permission model is worse than none.

### Finding 10 — No error-handling strategy in the API layer
- **Evidence:** zero `except` blocks in `app/api/` and `app/core/scoring.py`
  outside scripts; no global exception handler registered.
- **Failure mode:** any unexpected error → raw 500 with (given Finding 3)
  a traceback; nothing logged with request context.
- **Suggested fix:** global handlers + request IDs (see
  `observability-bootstrap`).

### Finding 11 — Backend URL inferred from frontend port
- **Evidence:** `const port = window.location.port === '8673' ? '8680' :
  '8000'` — a hardcoded port pair encodes one specific dev topology.
- **Failure mode:** any other deployment shape (reverse proxy, different
  ports, k8s ingress) silently points the client at the wrong backend;
  `VITE_API_URL` escape hatch exists but the fallback is a trap.
- **Suggested fix:** require `VITE_API_URL` (fail loudly if unset) or use
  same-origin relative `/api` behind a proxy.

### Findings 12-15 — dead code and render hygiene
- `api/gates.py` (9 lines) + the commented-out `include_router` line:
  delete; git remembers. **Correction to prior review:** `core/gates.py`
  (386 lines) is *not* orphaned — `seed_frameworks.py:9` imports
  `GATES_DEFINITION` from it; it's a live seed-data module in a misleading
  location (`core/`), worth relocating, not deleting.
- `gatesApi` stub: delete with its callers (none found).
- `AssessmentPage.tsx:213` builds a `Set` per domain per render; memoize
  with `useMemo` keyed on responses.
- `init_database.py` catches, prints, and proceeds — startup init should
  fail loudly or retry, not shrug.

## Quick wins

1. Delete `backend/app/api/gates.py`, the commented router line, and the
   `gatesApi` stub (Findings 12, 13).
2. `DEBUG: bool = False` (Finding 3) — one character of risk, large posture
   change. Verify dev compose sets `DEBUG=True` explicitly.
3. Remove/gate the two LoginPage credential logs (Finding 2).
4. One migration adding `index=True` to all FK columns (Finding 6).
5. Real `SELECT 1` in `/health` (Finding 1).

## Raw signal counts (baseline for next audit)

- `except Exception` in backend app code: **6** (all in `app/scripts/`)
- Bare `except:`: **0**
- `print(` in backend app code: **~40** (all in `app/scripts/`; 0 in
  routers/core)
- `datetime.utcnow` references: **12+** (models.py) + assessments router
- `console.log` in frontend src: **14** (2 credential-adjacent)
- Routers defined: 6; registered: 5; commented out: 1
- FK columns with an index: **0 / 10**

## Pilot notes (toolkit feedback, not app findings)

- The skill's "verify before reporting" rule caught a false positive that a
  prior human review missed: `core/gates.py` was believed orphaned but is
  imported by the seed script. Two-signal confirmation earns its place.
- Tool absence (vulture/knip) handled as the skill directs: skipped and
  declared in Scope rather than installed on the host.
