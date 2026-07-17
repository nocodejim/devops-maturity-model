# Next Session Prompt

Copy-paste starter for the next working session.

---

## Context

`feature/hardening-toolkit` (3 commits, 2026-07-17) delivered the hardening
toolkit, full remediation of both pilot audit reports, and a small visible UX
pass (results-page radar chart, dashboard framework badges). Production
plumbing is done: secure-by-default config, real health checks, non-root
images, same-origin `/api`, FK indexes, timezone-aware timestamps.

**The next iteration is product work, not tech debt.** Remaining debt (PR to
master, publish 2.1 Docker Hub images, pytest backfill, analytics stub) is
tracked in `docs/progress-tracker.md` and can go to Opus.

## Known product gaps (found 2026-07-17, unfixed by design)

1. **Assessments belong to the assessor, not the organization.** `team_name`
   is free text — no Team entity, so no way to track the same team across
   assessments. Kills the assessment-over-time story, which is the core value
   proposition of a maturity model. Fix this schema before real data
   accumulates.
2. **Roles are decorative.** Viewer/assessor/admin exist but there is no admin
   UI at all (user creation is a raw API call), no org-scoped visibility, no
   "consultant sees all their clients, client sees only their own."
3. **Analytics is a stub** — it averages scores across unrelated teams and
   frameworks. The real products: domain-level trends per team, benchmarking a
   team against the org or against all assessments, and "what did teams that
   improved actually change."

## The prompt

> You're the product lead. This tool's job is to help a consultant walk an
> organization from assessment to improvement over time. Propose the v3
> product — data model (Team entity, org-owned assessments), roles and
> administration experience, and the analytics/learnings story — as a short
> spec I can argue with. Don't write code yet. After I've torn the spec apart,
> we'll build it in vertical slices, each one something I can click.

## Environment

Dev stack via `docker-compose up`; ports and dev login in `CLAUDE.md`.
A completed demo assessment ("Platform Team Demo", CALMS) is in the dev DB to
showcase the results page.

Gotchas: docker-compose v1 needs `down` before `up -d` after image rebuilds;
dev admin only seeds when `DEBUG=True` and `CREATE_DEV_USERS=True` (dev
compose defaults both on).
