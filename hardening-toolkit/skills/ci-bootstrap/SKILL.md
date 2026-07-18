---
name: ci-bootstrap
description: Stand up continuous integration and pre-commit hooks that enforce a project's already-configured linters, type checks, and tests. Use when a repo has ruff/eslint/prettier/tsc configs but nothing runs them automatically, or when quality gates exist only as documentation.
---

# CI Bootstrap

The common failure mode isn't missing tools — it's configured-but-unenforced
tools: ruff and eslint configs sitting in the repo, `pre-commit` in the dev
dependencies with no `.pre-commit-config.yaml`, a "run the build before
committing" rule in a doc that nothing checks. Discipline that depends on
remembering is not discipline. This skill wires what already exists into
gates that block.

## Principles

1. **Enforce what exists before adding anything new.** Inventory first:
   ```bash
   ls .pre-commit-config.yaml .github/workflows/ 2>/dev/null
   grep -l "ruff\|black\|mypy" backend/pyproject.toml
   ls frontend/.eslintrc* frontend/.prettierrc* 2>/dev/null
   grep '"lint"\|"test"\|"build"' frontend/package.json
   ```
   Every tool found is a gate to wire, not a decision to make. Add new tools
   (mypy, coverage thresholds) later, one at a time, after the pipeline is
   trusted.
2. **Blocking from day one** for lint, format, type-check, and build — these
   are already expected to pass. Tests become blocking the moment a smoke
   suite exists (see `test-backfill`); a non-blocking test job trains
   everyone to ignore red.
3. **CI runs the same commands developers run.** One blessed command per
   check, defined once (package script / make target), invoked identically
   locally, in pre-commit where cheap, and in CI. Divergence breeds "works
   locally."
4. **Match CI's environment to the containers.** Same language versions and
   database engine as the compose/k8s setup — a suite passing on SQLite or a
   different Python is a false gate.

## Layer 1 — Pre-commit hooks (seconds, not minutes)

Fast checks only; anything slow belongs in CI, or the hooks get
`--no-verify`'d into irrelevance.

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.6.0
    hooks:
      - id: check-yaml
      - id: check-merge-conflict     # catches committed conflict markers
      - id: detect-private-key
      - id: end-of-file-fixer
      - id: trailing-whitespace
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.6.9
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format
  - repo: local
    hooks:
      - id: eslint
        name: eslint
        entry: bash -c 'cd frontend && npx eslint --max-warnings 0 src/'
        language: system
        files: ^frontend/src/.*\.(ts|tsx)$
        pass_filenames: false
      - id: prettier
        name: prettier
        entry: bash -c 'cd frontend && npx prettier --check src/'
        language: system
        files: ^frontend/src/.*\.(ts|tsx|css)$
        pass_filenames: false
```

Install per clone: `pre-commit install`. Add that line to the project README
/ onboarding; hooks are per-machine, and an uninstalled hook is a silent gap
(CI is the backstop for exactly this reason).

## Layer 2 — The pipeline (tool-agnostic definition)

Whatever the CI system, the job graph is:

| Job | Steps | Blocking |
|---|---|---|
| backend-lint | ruff check + ruff format --check (or black --check) | yes |
| backend-test | pytest against a real PostgreSQL service container | yes, once suite exists |
| frontend-typecheck | `tsc --noEmit` | yes |
| frontend-lint | eslint --max-warnings 0; prettier --check | yes |
| frontend-test | vitest run | yes, once suite exists |
| frontend-build | vite production build | yes |

Triggers: every PR + every push to the default branch. Lint/typecheck jobs
run in parallel; build after typecheck. Keep the total under ~10 minutes or
people stop waiting for it.

## Layer 3 — GitHub Actions example

`.github/workflows/ci.yml` (condense jobs as fits the repo):

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main, master]

jobs:
  backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test    # CI-only throwaway, not a real credential
          POSTGRES_DB: test_db
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready --health-interval 5s
          --health-timeout 5s --health-retries 10
    defaults: { run: { working-directory: backend } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - run: pipx install poetry && poetry install --no-root
      - run: poetry run ruff check . && poetry run ruff format --check .
      - run: poetry run pytest -x -q
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db
          SECRET_KEY: ci-only-not-a-real-key

  frontend:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: frontend } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: npm, cache-dependency-path: frontend/package-lock.json }
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npx eslint --max-warnings 0 src/
      - run: npm test --if-present
      - run: npm run build
```

`npm ci` requires a committed `package-lock.json` — commit lockfiles
(`package-lock.json`, `poetry.lock`); reproducible builds are part of the
gate.

### Adapting to GitLab / Jenkins / Azure DevOps

The Layer 2 table is the spec; only syntax changes. GitLab: jobs in
`.gitlab-ci.yml`, Postgres via `services:`, cache `.venv`/`node_modules` by
lockfile hash. Jenkins: pipeline stages calling the same blessed commands,
ideally inside the project's own images. If deployment is k8s, CI still runs
these checks pre-image-build; add an image build + scan job after the gates
pass. In restricted networks, mirror the pre-commit hook repos internally or
pin local hooks only.

## Branch protection

Gates that can be merged around aren't gates. Protect the default branch:
required status checks (every blocking job above), no direct pushes, PRs
required. Do this the same day the pipeline goes green.

## Exit criteria

- Pre-commit hooks installed and passing on a fresh clone
- Pipeline green on the default branch; every Layer 2 job present and
  blocking (tests may be pending the `test-backfill` smoke suite — say so)
- A deliberately-broken PR (lint error, type error) is **rejected** by CI —
  actually test this once
- Branch protection requires the checks
- Lockfiles committed; CI uses them (`npm ci`, `poetry install`)
