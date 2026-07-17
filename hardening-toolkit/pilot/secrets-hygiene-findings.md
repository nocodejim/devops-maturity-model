# Secrets & Config Audit: DevOps Maturity Assessment Platform (origin repo) — 2026-07-12

> Pilot run of the `secrets-config-hygiene` skill (audit mode) against the
> open-source origin repo. Ships with the toolkit as a worked example.
> Remediation was intentionally NOT applied — findings feed a future session.

## Findings

| # | Severity | Location | Secret/Default | Exposure |
|---|----------|----------|----------------|----------|
| 1 | CRITICAL | docker-compose.deploy.yml:34 | `SECRET_KEY: change-this-to-a-secure-random-string-in-production` | Deploy-as-is → known JWT signing key |
| 2 | CRITICAL | backend/app/scripts/init_database.py:70-90 | Default admin auto-created on every startup, password documented repo-wide | Known admin credential on any deployment |
| 3 | HIGH | backend/app/config.py:14 | `SECRET_KEY` has a working default (`dev-secret-key-...`) | Unset env var → forgeable tokens, silently |
| 4 | HIGH | backend/app/config.py:11 + both compose files | DB password embedded in default connection string | Known DB credential everywhere config is read |
| 5 | HIGH | backend/app/config.py:35 | `DEBUG: bool = True` default | Insecure by default; traceback exposure |
| 6 | MEDIUM | docker-compose.deploy.yml + frontend/Dockerfile:18 | "Deploy" frontend runs `npm run dev`; no `USER` in either Dockerfile (root) | Dev server + root containers in production posture |
| 7 | MEDIUM | backend/app/config.py:19-30 | CORS allowlist of internal IPs/hostnames hardcoded in source | Network topology leak; config belongs in env |
| 8 | LOW | 10+ markdown files (README, DEPLOYMENT, CLAUDE.md, docs/) | Default admin credential documented as the login | Documented credential = shipped credential |

### Finding 1 — Placeholder signing key in the deploy file
- **Evidence:** the *deploy* compose sets a literal placeholder `SECRET_KEY`.
- **Exposure:** anyone who deploys the file unmodified signs every session
  token with a string that is public in this repo; anyone else can mint
  admin tokens.
- **Remediation:** remove the literal; use `${SECRET_KEY:?required}` so
  compose refuses to start without it.
- **Rotation required:** yes for any environment ever launched from this
  file as-is.

### Finding 2 — Auto-seeded admin account
- **Evidence:** `create_admin_user()` runs on every startup, creates a
  well-known admin login, and prints the credentials to stdout (which lands
  in container logs). The same credential appears in 10+ docs as the way to
  log in (Finding 8).
- **Exposure:** every deployment of this app has a known admin credential
  unless someone remembers to change it after first boot.
- **Remediation:** gate behind `CREATE_DEV_USERS=true` + refuse when
  `DEBUG=false`; never print the password; production first-admin is an
  operator action.
- **Rotation required:** yes — change the admin password in any live
  environment.

### Finding 3 — Working default for SECRET_KEY in application config
- **Evidence:** `SECRET_KEY: str = "dev-secret-key-change-in-production"` —
  the app boots and signs tokens with this if the env var is missing.
- **Remediation:** remove the default (`SECRET_KEY: str`); the app must fail
  at startup when unset.
- **Rotation required:** yes, anywhere the default ever ran.

### Finding 4 — Database credential as a default
- **Evidence:** full connection string with password in `config.py` and both
  compose files.
- **Remediation:** no default in config; compose interpolates from env/
  secrets. Dev convenience moves to `.env` (gitignored) + `.env.example`.
- **Rotation required:** yes for any shared environment using it.

### Findings 5-8
- `DEBUG` should default to `False`; dev opts in (compose already sets it
  explicitly, so flipping the default costs nothing).
- Deploy posture: build a static frontend bundle behind a real web server;
  add non-root `USER` to both Dockerfiles; drop `--reload`-style dev
  commands from anything labeled deploy.
- Move the CORS origin list to an env-provided setting.
- Scrub the default credential from docs once Finding 2 is fixed; document
  the dev-flag mechanism instead.

## Rotation list

1. Admin password on every live deployment (Finding 2)
2. `SECRET_KEY` for any environment launched from the compose defaults
   (Findings 1, 3) — invalidates sessions; announce
3. Database password `devops123`-pattern anywhere shared (Finding 4)

## Git history check

- No `.env`/`.pem`/`.key` file was ever committed (`git log --all
  --diff-filter=A` clean).
- `git log -S` probes returned ambiguous hits inside the SpiraApp experiment
  directories (out of core scope); the project's own lessons log records one
  API key in a diagnostics file that was blocked by push protection. History
  review of the experiment dirs is recommended before open-sourcing further.

## Verification (audit mode — remediation pending)

Not yet performed (by design): boot-without-env-vars test and clean re-run of
detection greps belong to the remediation session.

## Pilot notes (toolkit feedback, not app findings)

- **The original 1.1 grep missed the flagship finding** (`SECRET_KEY` in
  `config.py`) because pydantic fields are type-annotated (`NAME: str =
  "value"`), which the `NAME=value` pattern didn't match. The skill's recipe
  was fixed to allow an optional annotation and to add a connection-string
  credential pattern. Lesson: recipes must be tested against a codebase with
  known findings before trusting a clean result.
- The seeded-credentials grep was too generic (matched `create_index`,
  `UserCreate`); revised to a locator + "read every init/seed script" rule.
