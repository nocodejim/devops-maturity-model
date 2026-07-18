# Observability Bootstrap — Agent Prompt

**Role:** You are an engineering agent executing the "observability-bootstrap" playbook below.

**When to use this prompt:** Replace print/console.log debugging with structured logging, global exception handling, request correlation, and honest health checks. Use when an app logs via print() or scattered console.log, has no global error-handling strategy, or its health endpoint doesn't actually check anything.

---


# Observability Bootstrap

MVP-stage apps debug with `print()` and `console.log`, handle errors wherever
someone happened to add a `try`, and report health by returning a hardcoded
"ok". That's fine until the app runs where you can't attach a debugger. This
skill installs the minimum enterprise floor: structured logs, one place where
unhandled errors land, request correlation, and health checks that tell the
truth.

**Note:** during early MVP development, "log everything, verbosely" is a
reasonable directive. This skill is the enterprise *inverse* of that
directive — the transition point is the first shared deployment. Verbose
diagnostic logging survives, but only behind the dev environment gate, and
never with credentials in it.

## Backend (FastAPI)

### 1. Logging configuration

One logging setup, applied at startup; module loggers everywhere else.

- Dev: human-readable lines. Prod: JSON (one object per line) so a log
  aggregator can index fields — don't build dashboards first, just emit
  parseable structure.
- Level from config (`LOG_LEVEL`, default `INFO`; `DEBUG` only in dev).
- `logger = logging.getLogger(__name__)` per module. **Replace every
  `print()` in app code** — grep: `grep -rn "print(" --include="*.py" app/`.
- Log *events with context*, not narration: `logger.info("assessment
  completed", extra={"assessment_id": ..., "score": ...})` beats
  `print("done!")`.
- **Never log:** passwords, tokens/JWTs, full request bodies on auth routes,
  connection strings. Seed/init scripts that print created credentials are a
  finding, not a convenience.

### 2. Global exception handling

Three handlers registered on the app — after this, *no* stack trace reaches a
client and *every* unhandled error is logged exactly once:

```python
@app.exception_handler(RequestValidationError)   # 422 + field errors (safe)
@app.exception_handler(HTTPException)            # pass through, log at info/warning
@app.exception_handler(Exception)                # the important one:
async def unhandled(request: Request, exc: Exception):
    logger.exception("unhandled error", extra={"path": request.url.path,
                                               "request_id": request.state.request_id})
    return JSONResponse(status_code=500,
                        content={"detail": "Internal server error",
                                 "request_id": request.state.request_id})
```

Opaque body out, full traceback into the logs, request ID on both sides so a
user report ("I got error, request_id abc123") lands on the exact traceback.

With the catch-all in place, **delete defensive `try/except` blocks whose
only job was preventing a raw 500** — and hunt the opposite defect: excepts
that swallow errors into fallback values. Errors are either handled
meaningfully (retry, translate to a domain error, add context and re-raise)
or not caught at all.

### 3. Request-ID middleware

Generate/propagate a request ID per request (honor an incoming
`X-Request-ID` from the ingress/load balancer, else `uuid4().hex[:12]`),
stash it on `request.state`, return it as a response header, include it in
every log line for that request (contextvar or `extra=`).

### 4. Honest health checks

A health endpoint that hardcodes `{"database": "connected"}` without querying
is worse than none — orchestrators and humans trust it while the DB is down.

- **Liveness** (`/health/live`): process is up; no dependencies. This is what
  a container restart policy should probe.
- **Readiness** (`/health/ready`): actually exercise each dependency —
  `db.execute(text("SELECT 1"))` inside try/except; return 503 with
  per-dependency status when anything fails. This is what the load balancer
  / k8s readiness probe should hit.
- Wire the orchestrator (compose `healthcheck:` or k8s probes) to these; a
  health endpoint nothing probes is decoration.

## Frontend (React/TS)

### 1. Dev-gated logger

`console.log` sprinkled through auth flows ships credentials to any browser
console (and to error-reporting breadcrumbs). Replace with a tiny util:

```ts
// src/lib/logger.ts
const isDev = import.meta.env.DEV
export const log = {
  debug: (...a: unknown[]) => { if (isDev) console.debug(...a) },
  info:  (...a: unknown[]) => { if (isDev) console.info(...a) },
  error: (...a: unknown[]) => console.error(...a),   // always
}
```

Then: `grep -rn "console\." src/` and migrate every call. Even in dev, never
log passwords, tokens, or full auth responses — dev consoles get
screen-shared and screenshotted.

### 2. Error boundary

One top-level React error boundary (class component or a library) that shows
a fallback UI and logs via `log.error`. Without it, a render error blanks the
whole app with nothing but a console line nobody sees.

### 3. Centralized API error handling

All error translation lives in the API client (interceptor/wrapper): map
HTTP failures to typed errors, log once with URL + status (never the request
body), and **propagate** — components decide presentation. Delete any
"return mock/empty data on failure" fallbacks found along the way; a UI
rendering fake data during an outage is a silent failure, the worst kind.

## Order of work

1. Backend logging config + print() replacement
2. Global exception handlers + request-ID middleware
3. Honest liveness/readiness endpoints, wired into the orchestrator
4. Frontend logger util + console.* migration (credential-logging lines
   first — those are security findings, not refactors)
5. Error boundary + API-client error centralization

## Exit criteria

- `grep -rn "print(" app/` and `grep -rn "console\.log" src/` → zero hits in
  app code (scripts/tests may differ; say so)
- Forced test error (temporary `raise` route in dev) produces: opaque 500
  body with request ID + one logged traceback with the same ID
- Readiness endpoint returns 503 when the database is stopped — actually
  test this by stopping it
- No credential, token, or auth-response logging anywhere, any environment
- Orchestrator probes point at the new endpoints
