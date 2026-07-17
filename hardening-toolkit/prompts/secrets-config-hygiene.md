# Secrets Config Hygiene — Agent Prompt

**Role:** You are an engineering agent executing the "secrets-config-hygiene" playbook below.

**When to use this prompt:** Find and eliminate hardcoded secrets, insecure defaults, and seeded credentials, then establish 12-factor configuration with fail-fast validation. Use when preparing a codebase for any shared, staging, or production deployment, or when auditing config handling in a fast-built app.

---


# Secrets & Config Hygiene

Fast-built apps almost always ship with working defaults — a dev signing key,
a known database password, an auto-created admin user — because defaults make
the demo work. Every one of those defaults is a credential the moment the app
runs anywhere shared. This skill finds them, removes them, and makes the app
refuse to start without real configuration.

Two modes: **audit** (find and report) and **remediate** (apply the fixes).
Always run the audit first and share findings before remediating.

## Phase 1 — Detection

Search code, config, and history. A secret is anything that grants access:
signing keys, passwords, API keys, connection strings, seeded accounts.

### 1.1 Secret-shaped defaults in application config

The highest-value target. In pydantic-settings / env-var wrappers, look for
fields whose *default value* is itself a credential:

```python
# Every one of these is a finding:
SECRET_KEY: str = "dev-secret-key-change-in-production"   # works if unset!
DATABASE_URL: str = "postgresql://app:apppass123@db:5432/app"
DEBUG: bool = True                                        # insecure default
```

The "change-in-production" comment is not a mitigation — it's an admission.
If the env var is unset in production, the app boots happily with the known
key, and every JWT it signs is forgeable by anyone who has read the repo.

```bash
# Note the optional type annotation: pydantic fields are `NAME: str = "value"`,
# so a plain NAME=value pattern misses them entirely.
grep -rnE "(SECRET|PASSWORD|API_KEY|TOKEN|_KEY)[A-Z_]*\s*(:\s*[A-Za-z]+)?\s*=\s*[\"'][^\"']+[\"']" --include="*.py" .
# Credentials embedded in connection-string defaults (user:pass@host)
grep -rnE "://[A-Za-z0-9_]+:[^@\"'{ ]+@" --include="*.py" --include="*.yml" --include="*.yaml" .
grep -rn "DEBUG.*=.*True" --include="*.py" app/
```

### 1.2 Credentials in orchestration files

Compose files, k8s manifests, Helm values — anywhere `environment:` blocks
carry literal values instead of references:

```bash
grep -rnE "(PASSWORD|SECRET|KEY|TOKEN)" --include="*.yml" --include="*.yaml" . | grep -v "\${" | grep -vE "secretKeyRef|valueFrom"
```

Pay special attention to files named `deploy`/`prod`: a placeholder like
`SECRET_KEY: change-this-in-production` in a *deploy* file becomes the real
signing key for anyone who deploys it as-is. Also flag deploy files that run
dev servers (`--reload`, `npm run dev`) or containers as root — config
hygiene includes the runtime posture the config creates.

### 1.3 Seeded credentials

Init/seed scripts that create accounts. Greps here are only a locator — the
patterns are too generic to judge from matches alone; **read every init/seed
script end to end**:

```bash
ls **/scripts/ **/seed* **/init* 2>/dev/null            # find them
grep -rniE "create.*(admin|user)" --include="*.py" . | grep -viE "test|schema|index"
```

An admin user auto-created **on every startup** with a documented password is
an unauthenticated backdoor. Even worse if the script prints the credentials
to logs. Check docs and READMEs too — a credential documented for operators
("log in with the default admin password") is a shipped credential.

### 1.4 Git history

The working tree being clean is not enough:

```bash
# .env or key files ever committed?
git log --all --diff-filter=A --name-only -- "*.env" "*.pem" "*.key" | sort -u
# Secret-shaped strings in history (slow but thorough on small repos)
git log -p --all -S "SECRET_KEY" -- "*.py" "*.yml" | grep -c "^+.*SECRET_KEY"
```

**Rule: committed once = compromised.** History rewriting is rarely worth it;
rotation always is. Any secret that ever appeared in a commit must be rotated,
not just removed.

### 1.5 Adjacent exposure

- CORS: `allow_origins` lists of hardcoded internal IPs/hostnames in source
  (leaks network topology; belongs in config), `allow_credentials=True`
  combined with wildcard methods/headers.
- Debug/diagnostic dump files committed to the repo (grep for files with
  "debug", "dump", "diagnostic" in the name; these have leaked API keys
  before).
- Frontend: secrets in `VITE_`-prefixed vars (anything `VITE_*` is public —
  it's compiled into the served bundle).

## Phase 2 — Report

```markdown
# Secrets & Config Audit: <project> — <date>

## Findings
| # | Severity | Location | Secret/Default | Exposure |
|---|----------|----------|----------------|----------|

### Finding N — <title>
- **Evidence:** <quoted line>
- **Exposure:** <who can use this and what they get>
- **Remediation:** <specific change>
- **Rotation required:** yes/no — <because it appeared in commit <sha>/history>

## Rotation list
<every credential that has ever been committed, in priority order>
```

Severity: CRITICAL = usable credential reaching a deployed/shared environment;
HIGH = usable credential in repo/history; MEDIUM = insecure default or
topology leak; LOW = hygiene.

## Phase 3 — Remediation patterns

Apply only after findings are reviewed.

1. **No defaults for secrets — fail fast at boot.**

   ```python
   class Settings(BaseSettings):
       SECRET_KEY: str            # no default: app refuses to start unset
       DATABASE_URL: str          # same
       DEBUG: bool = False        # safe default; opt IN to debug
   ```

   The app crashing at startup with a clear "field required" error is the
   desired behavior. It converts a silent security hole into a loud
   deployment error.

2. **`.env` is gitignored; `.env.example` is committed** with every required
   key present and placeholder values that cannot possibly work
   (`SECRET_KEY=generate-with-openssl-rand-hex-32`).

3. **Orchestration references, never values:** compose `${VAR}` interpolation
   or `env_file`; k8s `secretKeyRef` / external secrets operator. Deploy
   manifests in git contain zero literal credentials.

4. **Seed users behind an explicit dev flag** (`CREATE_DEV_USERS=true`), never
   default-on, never printed to logs, and refused when `DEBUG` is false.
   Production first-admin creation is a deliberate operator action (one-off
   command or invite flow), not a startup side effect.

5. **Rotate everything on the rotation list.** New signing key invalidates
   existing sessions — announce it; that's the cost of the earlier commit.

6. **Move environment-specific lists (CORS origins, hosts) into config**, out
   of source.

## Verification

- Boot test: unset the secret env vars → the app must **fail to start** with
  a clear error naming the missing field.
- Re-run every Phase 1 grep → clean (or each remaining hit is documented as a
  false positive).
- `.env.example` covers every required variable; a fresh clone + copy +
  fill-in boots successfully.
- Deploy config contains no literal credentials and no dev-server commands.
