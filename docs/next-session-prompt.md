# Next Session Prompt

Copy-paste starter for the next working session.

---

**Context:** The branch `feature/hardening-toolkit` now contains two bodies of
work: (1) `hardening-toolkit/` — the portable skills package built for the work
fork, and (2) the **production hardening remediation** (2026-07-17) that worked
every finding from both pilot reports. See `docs/progress-tracker.md`
("Production Hardening") for the full checklist.

**State:** All 8 secrets findings and 15 vibe-audit findings remediated and
verified: full API lifecycle test through the new same-origin `/api` proxy,
headless-browser login + assessment flow (0 console errors, 0 token leaks),
migration 002 applied against live data, production images build and run
non-root, deploy compose refuses to boot without secrets. Config version bumped
to 2.1.0.

**Not yet done / candidate next tasks:**

1. **Commit + PR.** The working tree mixes toolkit files and hardening changes;
   consider two commits (toolkit, hardening) or two PRs off this branch.
2. **Publish 2.1 images** to Docker Hub (`backend/`, `frontend/Dockerfile.prod`)
   so `docker-compose.deploy.yml`'s default tags exist.
3. **Test backfill** (`hardening-toolkit/skills/test-backfill`): backend has
   zero pytest tests; scoring engine and auth deps are the highest-value targets.
4. **Analytics domain breakdown** — `analytics.py` still returns an empty
   `assessments_by_domain` (TODO in code).
5. **UX polish pass** on Dashboard/Results (charts, framework descriptions on
   the create modal).
6. Rewrite the Spira/Jira offshoot apps (explicitly deferred by Jim).

**Gotchas:**
- docker-compose v1 on this host: `down` before `up -d` after image rebuilds
  (KeyError: 'ContainerConfig' — see lessons-learned 2026-07-17).
- Dev login (admin@example.com/admin123) only seeds when `DEBUG=True` AND
  `CREATE_DEV_USERS=True` — both default on in the dev compose only.
- Frontend dev server now proxies `/api` (vite.config.ts) — `VITE_API_URL` is
  an override, not required.

**Environment:** dev stack via `docker-compose up`; ports and test login in
`CLAUDE.md`.
