---
name: test-backfill
description: Bootstrap automated tests in a zero-coverage codebase — pytest for a FastAPI/SQLAlchemy backend, Vitest + React Testing Library for a React/TypeScript frontend. Use when a project has no tests (or test frameworks installed but no test files) and needs a safety net before hardening or refactoring work.
---

# Test Backfill

A codebase with zero tests can't be safely hardened: every fix is a gamble.
This skill establishes a test harness and backfills tests in strict value
order. The goal of the first session is **not coverage** — it is a running
harness plus tests for the code where bugs are most expensive.

## Priority order — do not reorder

1. **Prove the harness runs.** One trivial test per side, executed in the
   project's containers. Everything else is blocked until `pytest` and
   `vitest` both produce a green run. Frameworks being installed but never
   executed is the most common zero-coverage failure mode.
2. **Pure domain logic.** Scoring, calculation, aggregation — functions with
   no IO. Highest value density: business-critical, trivially testable,
   where silent wrongness hides.
3. **API contract tests, one router at a time.** `TestClient` +
   `dependency_overrides`. Start with the router whose data matters most.
4. **Frontend service layer, then critical pages.** Mock the network with
   `msw`; test the API client's URL/header/error behavior, then render tests
   for the highest-value user flow.
5. **A regression test for every already-known bug.** Walk the project's
   lessons-learned log / peer reviews / issue tracker; each recorded bug gets
   a test proving it stays fixed. This is the cheapest high-value test
   writing available — the failure scenario is already documented.

## Backend harness (pytest + FastAPI + SQLAlchemy)

Layout: `backend/tests/{conftest.py, test_smoke.py, unit/, api/}`.

**Test against real PostgreSQL, not SQLite.** If the models use Postgres
types (`UUID`, `ARRAY`), SQLite will either fail or — worse — pass where
production fails. Use the dev compose Postgres with a dedicated test
database, or `testcontainers`.

`conftest.py` pattern (per-test transaction rollback — fast, isolated):

```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.main import app
from app.database import Base, get_db
from app.config import settings

TEST_DATABASE_URL = settings.DATABASE_URL.rsplit("/", 1)[0] + "/test_db"

engine = create_engine(TEST_DATABASE_URL)

@pytest.fixture(scope="session", autouse=True)
def create_schema():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session():
    """Each test runs inside a transaction that is always rolled back."""
    connection = engine.connect()
    transaction = connection.begin()
    Session = sessionmaker(bind=connection)
    session = Session()
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db_session):
    app.dependency_overrides[get_db] = lambda: db_session
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
```

Auth: override the current-user dependency with a factory-built user rather
than exercising the login flow in every test. One dedicated test module
covers auth itself; everything else injects.

Factories: plain fixture functions that create model rows with sensible
defaults and keyword overrides. Add `factory_boy` only when fixtures get
repetitive — don't start with it.

API contract tests assert on **status code and response body shape/values**,
including the failure paths (404 for missing resource, 422 for invalid body,
403/404 for another user's resource — the access-control test most
vibe-coded apps fail).

Run: `docker compose exec backend pytest -x -q`. Wire a `test` make/poetry
script so there is exactly one blessed command.

## Frontend harness (Vitest + RTL + msw)

Files: `vitest.config.ts` (or a `test` block in `vite.config.ts`),
`src/setupTests.ts`, and a `"test": "vitest run"` script in `package.json`.

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
  },
})
```

```ts
// src/setupTests.ts
import '@testing-library/jest-dom'
import { server } from './test/msw-server'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

`onUnhandledRequest: 'error'` is deliberate: any test hitting an unmocked
endpoint fails loudly instead of silently passing against nothing.

Order of value:
1. **Service layer** (`api.ts`): base-URL resolution (especially if it's
   heuristic), auth header injection, 401 handling, error propagation. This
   file is imported by everything and usually has zero direct tests.
2. **Critical page flows** with RTL: render, interact via
   `screen.getByRole`, assert visible outcome. Test what the user sees, not
   component internals.

## Anti-patterns — reject these in review

- **Mock-everything tests** that mock the function under test's collaborators
  so thoroughly the test can only fail if the mocks change. If the DB layer
  is mocked in an API "contract" test, it's not a contract test.
- **Snapshot spam:** `expect(container).toMatchSnapshot()` on whole pages.
  Snapshots assert "nothing changed", which nobody reviews after the third
  update.
- **Implementation-detail tests:** reaching into component state, spying on
  internal methods, asserting a specific query was constructed. Test
  observable behavior.
- **Coverage-percentage chasing:** a coverage gate before the harness is
  culturally established produces assertion-free tests. Add thresholds only
  after the suite has proven it catches real regressions.
- **Tests that depend on execution order or shared mutable rows.** The
  rollback fixture exists precisely so no test needs cleanup code.

## Exit criteria

- One blessed command per side runs the suite green **inside the project's
  containers**, from a clean checkout.
- Domain-logic module(s) covered, including edge cases (empty inputs, zero
  weights/divisors, missing references).
- At least one router has contract tests covering success + auth-failure +
  validation-failure.
- Frontend service layer tested; at least one page has a behavior test.
- Every bug in the project's incident log has a named regression test or a
  written reason why it can't.
- The suite is wired into CI (see the `ci-bootstrap` skill) — tests that
  aren't run automatically decay into fiction.
