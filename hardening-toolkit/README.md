# Hardening Toolkit

A portable package of AI-agent skills and instructions for taking a
fast-built ("vibe coded") full-stack application to enterprise-ready.
Written for a **FastAPI + React/TypeScript/Vite + PostgreSQL + Tailwind**
stack running in containers, but most content transfers to adjacent stacks.

This folder is self-contained: copy it into any repo (or share it as-is) and
everything keeps working. Nothing in it references private hosts, real
credentials, or the machine it was written on — `scripts/validate-toolkit.sh`
enforces that.

## What's inside

| Path | What it is |
|---|---|
| `skills/<name>/SKILL.md` | Canonical skills, Claude Code format |
| `prompts/<name>.md` | Generated tool-agnostic twins — same content, usable as a system/task prompt in any AI tool |
| `instructions/CLAUDE-TEMPLATE.md` | Drop-in `CLAUDE.md`/`AGENTS.md` template: the working agreement agents operate under |
| `instructions/HARDENING-PLAYBOOK.md` | The ordered path: which skill to run when, with exit criteria per phase |
| `scripts/build-prompts.sh` | Regenerates `prompts/` from `skills/` — never edit `prompts/` by hand |
| `scripts/validate-toolkit.sh` | Structural lint: frontmatter, twin parity, leakage/time-estimate checks |
| `pilot/` | Worked example outputs — real audit reports produced by running two of the skills against the origin repo |

## The skills

| Skill | Use when |
|---|---|
| `vibe-code-audit` | Inheriting/reviewing fast-built code — produces a severity-ranked findings report (read-only) |
| `secrets-config-hygiene` | Before any shared deployment — find and kill hardcoded secrets, insecure defaults, seeded credentials |
| `test-backfill` | Zero-coverage codebase — bootstrap pytest + Vitest harnesses and backfill in value order |
| `migration-safety` | Any schema migration — author and review without data loss or irreversibility |
| `observability-bootstrap` | print()/console.log debugging, no error strategy — structured logs, global handlers, honest health checks |
| `ci-bootstrap` | Linters configured but nothing enforces them — pre-commit hooks + blocking pipeline |
| `verify-real-environment` | Every change, forever — proof-by-exercising before claiming completion |

Start with `instructions/HARDENING-PLAYBOOK.md` — it sequences these into
phases with exit criteria.

## Using with Claude Code

```bash
# from your repo root
mkdir -p .claude/skills
cp -r hardening-toolkit/skills/* .claude/skills/
```

Skills then trigger automatically when relevant, or invoke one explicitly
("run the vibe-code-audit skill"). Install the instructions half by copying
`instructions/CLAUDE-TEMPLATE.md` to your repo's `CLAUDE.md` and filling in
the `{{PLACEHOLDERS}}`.

## Using with any other AI tool

Paste the matching file from `prompts/` as the system or task prompt — the
twins carry the full skill content with a role preamble instead of
frontmatter. The template and playbook are plain markdown and tool-neutral
already.

## Maintaining

- Edit skills only under `skills/`, then run `scripts/build-prompts.sh`.
- Run `scripts/validate-toolkit.sh` before sharing; it fails on broken
  frontmatter, stale prompt twins, and origin-repo leakage.

## Validation provenance

The two audit skills were piloted verbatim against the origin repo (the
open-source DevOps Maturity Assessment Platform) with a known answer key of
previously-reviewed defects. Both reports are in `pilot/`. The pilots caught
and fixed two real skill defects before release — a detection grep that
missed type-annotated pydantic secrets, and a missing scope-setting step —
and the audits rediscovered the full answer key plus a false positive in the
prior human review. Treat `pilot/` as the reference for what good output
from these skills looks like.
