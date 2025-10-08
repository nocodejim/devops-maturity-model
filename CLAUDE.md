# DevOps Maturity Assessment Platform

## Project Context
Full-stack assessment platform: FastAPI backend, React/TypeScript frontend, PostgreSQL database. All development in Docker containers.

## Pre-Commit Protocol

**Before EVERY commit:**
1. Read and update `docs/lessons-learned.md` if issues encountered
2. Read and update `docs/progress-tracker.md` for completed milestones
3. Test in actual environment (browser for frontend, API calls for backend)
4. Run TypeScript build: `docker-compose exec frontend npm run build`

**Commit message format:**
```
<type>: <subject>

<body with what/why>

Related to lessons-learned.md #<issue-number> if applicable

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Critical Rules - NON-NEGOTIABLE
- **DOCKER**: NEVER run commands that affect host system
  - ❌ FORBIDDEN: `docker system prune`, `docker volume prune`, `docker network prune`
  - ❌ FORBIDDEN: Any Docker command with `--all` or `-a` flag outside this project
  - ✅ SAFE: `docker-compose down -v` (this project only)
  - ✅ SAFE: `docker-compose build --no-cache` (this project only)
  - ✅ SAFE: File/folder operations within `/home/jim/devops-maturity-model/`
- NEVER mark features complete without browser/API testing
- NEVER install dependencies on host (use Docker only)
- ALWAYS check TypeScript compilation before frontend commits
- See `docs/collab-best-practices.md` for detailed workflow

## Debugging Requirements - MANDATORY FOR MVP/EARLY TESTING
- **ALWAYS add extensive console.log debugging during MVP development**
- Console logs should use prefixed format: `[ComponentName] Description`
- Log every critical step in async flows (API calls, auth, navigation)
- Log both success and error states with full context
- Include request/response details for all API interactions
- Add console.log to api.ts to show detected backend URL
- DO NOT assume code works - verify with actual console output
- We are missing too much information without comprehensive logging
- Better to have too much logging than too little during early testing

## Test User
- Email: admin@example.com
- Password: admin123

## Network Access
- Dev PC Network IP: 192.168.44.93
- Frontend (local): http://localhost:5173
- Frontend (network): http://192.168.44.93:5173
- Backend (local): http://localhost:8000
- Backend (network): http://192.168.44.93:8000
