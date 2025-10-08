# Lessons Learned

## Document Format

**When to Update:** Every time you encounter an issue, bug, error, or learn something significant during development.

**Entry Format:**
```markdown
### [YYYY-MM-DD HH:MM] - Brief Issue Title
- **Issue**: What went wrong (be specific)
- **Impact**: How it affected development/functionality
- **Root Cause**: Why it happened
- **Resolution**: How it was fixed
- **Lesson**: Key takeaway for future work
- **Category**: Dependencies & Packages | Code Quality | Process & Workflow | Development Environment | Security
- **Priority**: CRITICAL | High | Medium | Low (optional)
```

**Categories:** Dependencies & Packages, Code Quality, Process & Workflow, Development Environment, Security

---

## Session Date: 2025-10-06

### Purpose
This document tracks mistakes, defects, issues, and lessons learned during the development of the DevOps Maturity Assessment Platform MVP. The goal is to capture insights that can improve documentation, instructions, and development steering.

---

## Issues & Lessons

### [2025-10-06 15:04] - Poetry Package Mode Error
- **Issue**: Docker build failed with error: "The current project could not be installed: No file/folder found for package devops-maturity-backend"
- **Impact**: Backend container couldn't build - blocking issue
- **Root Cause**: Poetry was trying to install the project as a package, but this is an application not a library
- **Resolution**: Added `package-mode = false` to `[tool.poetry]` section in pyproject.toml and removed the second `poetry install` step from Dockerfile
- **Lesson**: When using Poetry for applications (not libraries), always set `package-mode = false` or use `--no-root` flag
- **Category**: Dependencies & Packages

### [2025-10-06 15:05] - Frontend npm ci Without Lock File
- **Issue**: Frontend build failed with "npm ci can only install with an existing package-lock.json"
- **Impact**: Frontend container couldn't build - blocking issue
- **Root Cause**: Used `npm ci` but didn't generate or commit package-lock.json file
- **Resolution**: Changed Dockerfile from `npm ci` to `npm install`
- **Lesson**: Either commit package-lock.json files or use `npm install` instead of `npm ci`. For production, should use `npm ci` with committed lock file for reproducible builds
- **Category**: Development Environment
- **TODO**: Generate and commit package-lock.json for reproducible builds

### [2025-10-06 15:08] - Bcrypt Version Incompatibility
- **Issue**: Password hashing failed with "module 'bcrypt' has no attribute '__about__'" and "password cannot be longer than 72 bytes"
- **Impact**: Could not create users or test authentication - critical functionality broken
- **Root Cause**: passlib 1.7.4 incompatible with bcrypt 5.x (bcrypt changed internal structure)
- **Resolution**: Pinned bcrypt to version 4.x in pyproject.toml by adding explicit `bcrypt = "^4.0.0"` dependency
- **Lesson**: When using passlib with bcrypt, must pin bcrypt to 4.x until passlib is updated. This is a known compatibility issue
- **Category**: Dependencies & Packages
- **Warning**: A deprecation warning still appears but doesn't affect functionality

### [2025-10-06 15:06] - Docker Compose Version Warning
- **Issue**: Warning message: "the attribute `version` is obsolete"
- **Impact**: Cosmetic only - doesn't affect functionality
- **Resolution**: Can be resolved by removing `version: '3.8'` from docker-compose.yml
- **Lesson**: Docker Compose v2 no longer requires version attribute
- **Category**: Development Environment
- **Priority**: Low

### [2025-10-06 15:11] - Critical Testing Directive
- **Issue**: Initial implementation claimed everything worked based on curl tests showing HTML response, but actual browser testing revealed errors
- **Impact**: Would have delivered broken frontend to user - critical quality issue
- **Root Cause**: Insufficient testing - only tested that endpoints return responses, not that the application actually works
- **Resolution**: User insisted on proper testing, which revealed the issue
- **Lesson**: **ALWAYS test by actually accessing the application in its intended environment, not just checking if endpoints respond**. curl showing HTML ≠ working application. For web apps, test in browser. For APIs, test actual functionality not just HTTP responses.
- **Category**: Process & Workflow
- **Priority**: CRITICAL - This is a fundamental testing principle
- **Action Item**: Never mark frontend as "working" without browser verification. Never mark backend as "working" without functional API testing.

---

### [2025-10-06 15:13] - Invalid Tailwind CSS Class
- **Issue**: Frontend failing with error: "The `border-border` class does not exist"
- **Impact**: Frontend completely non-functional - critical issue that was missed by insufficient testing
- **Root Cause**: Used `@apply border-border;` in index.css, which is a shadcn/ui convention requiring specific theme setup
- **Resolution**: Removed the invalid `@apply border-border;` line from src/index.css
- **Lesson**: Don't use framework-specific conventions without proper setup. Tailwind's `@apply` only works with defined utility classes
- **Category**: Code Quality
- **Detection**: Only discovered after user insisted on proper testing - curl showed HTML response but app was broken

---

### [2025-10-06 15:17] - GitHub Push Protection: API Key in Diagnostics File
- **Issue**: GitHub blocked push with "Repository rule violations - Push cannot contain secrets". Anthropic API key found in mcp_diagnostics.txt
- **Impact**: Could not push to remote repository - blocking deployment
- **Root Cause**: MCP diagnostics file (4.1MB) was committed with embedded API keys
- **Resolution**: Added mcp_diagnostics.txt to .gitignore, removed from git index, amended commit
- **Lesson**: Always review files before committing. Diagnostic/debug files often contain secrets and should be gitignored. GitHub's push protection is a safety net but we should catch this earlier.
- **Category**: Process & Workflow
- **Best Practice**: Add diagnostic files to .gitignore proactively, never commit large debug dumps

---

### [2025-10-07 12:28] - TypeScript Compilation Errors Preventing Frontend Execution
- **Issue**: Login page displayed but clicking "Sign In" did nothing - no console messages, no network traffic
- **Impact**: Critical - entire frontend non-functional despite appearing to load
- **Root Cause**: TypeScript compilation errors in ResultsPage.tsx (possibly undefined overall_score) and api.ts (import.meta.env type issue) were preventing Vite from compiling the application
- **Resolution**:
  1. Fixed ResultsPage.tsx by adding null coalescing: `const overallScore = report.assessment.overall_score ?? 0`
  2. Created vite-env.d.ts file to properly type import.meta.env
  3. Restarted frontend container
- **Lesson**: **Vite in development mode fails silently on TypeScript errors - the page loads but JavaScript doesn't execute**. Always run `npm run build` or check browser console for TypeScript errors when frontend appears broken.
- **Category**: Code Quality, Process & Workflow
- **Detection**: User reported broken functionality, ran `npm run build` to discover TypeScript errors
- **Best Practice**: Add TypeScript type checking to CI/CD pipeline. Test in browser immediately after code changes.

---

### [2025-10-07 14:45] - Suggested Destructive Docker Command (docker system prune)
- **Issue**: Suggested `docker system prune -f` as a debugging step, which would delete ALL unused Docker resources across the entire host system
- **Impact**: CRITICAL - Could have destroyed hundreds of user's containers, volumes, and networks for other projects
- **Root Cause**: Failed to consider scope of Docker commands - suggested host-wide command instead of project-scoped command
- **Resolution**: Added explicit "NON-NEGOTIABLE" rules to CLAUDE.md forbidding system-wide Docker commands
- **Lesson**: **NEVER suggest Docker commands that affect the host system**. Only use project-scoped commands: `docker-compose down -v`, `docker-compose build --no-cache`. User has other critical systems running.
- **Category**: Process & Workflow, Safety
- **Priority**: CRITICAL
- **Safe Commands**: `docker-compose` commands are project-scoped and safe
- **Forbidden Commands**: `docker system prune`, `docker volume prune`, `docker network prune`, any command with `--all` or `-a` outside project scope

---

### [2025-10-07 16:20] - FastAPI/Pydantic Version Incompatibility and Missing poetry.lock
- **Issue**: Backend failed to start on work PC with `AttributeError: 'FieldInfo' object has no attribute 'in_'`
- **Impact**: CRITICAL - Application completely broken on fresh deployments, unable to start backend service
- **Root Cause**:
  1. FastAPI 0.104.1 incompatible with Pydantic 2.6+ (Poetry resolved Pydantic 2.12.0 on work PC)
  2. No poetry.lock file committed, causing different dependency versions across environments
  3. Empty migration file (only `pass` statements) - generated against existing database
- **Resolution**:
  1. Upgraded FastAPI from ^0.104.1 to ^0.115.0 (compatible with Pydantic 2.12+)
  2. Upgraded uvicorn from ^0.24.0 to ^0.30.0 (compatible with FastAPI 0.115)
  3. Generated and committed poetry.lock file (211KB) for reproducible builds
  4. Created proper initial migration file with all table CREATE statements
- **Lesson**: **ALWAYS commit lock files (poetry.lock, package-lock.json) for reproducible builds**. Version ranges (^) resolve to different versions on different systems. FastAPI/Pydantic compatibility must be tested - FastAPI 0.104.x only works with Pydantic <2.6.
- **Category**: Dependencies & Packages, Process & Workflow
- **Priority**: CRITICAL
- **Detection**: User cloned repo on work PC, followed README, backend failed to start
- **Best Practice**:
  - Use lock files for all package managers
  - Test dependency compatibility in fresh Docker environment
  - Pin major version combos that have known compatibility issues
  - Document exact working versions in README
- **Files Changed**: backend/pyproject.toml (FastAPI/uvicorn versions), backend/poetry.lock (new), backend/alembic/versions/20251007_1600_initial_schema.py (proper migration)

---

### [2025-10-07 17:42] - Incomplete Migration File and Repeated Testing Failure
- **Issue**: After "fixing" FastAPI/Pydantic issue, claimed it was tested but only verified Docker build, not actual functionality. Migration was missing `last_login` column.
- **Impact**: CRITICAL - Would have failed on user creation, same deployment failure on work PC
- **Root Cause**: Violated Critical Testing Directive (lesson #5 & #7) AGAIN - assumed build success = working application
- **Resolution**:
  1. User questioned: "did we test this to ensure it was working after you made these updates?"
  2. Properly tested: Started containers, ran migrations, created user, tested auth
  3. Discovered missing column in migration, fixed it
  4. Re-tested end-to-end: Backend start → Migration → User creation → Auth → Success
- **Lesson**: **Build success ≠ Working application. This is the THIRD time making this testing mistake.** Must test actual functionality:
  1. Docker build succeeds (necessary but not sufficient)
  2. Containers start without errors
  3. Migrations run successfully
  4. Core functionality works (create user, auth, API calls)
  5. No errors in logs
- **Category**: Process & Workflow, Code Quality
- **Priority**: CRITICAL
- **Detection**: User challenged assumption that build = tested
- **Best Practice**: Create checklist for "tested" claims:
  - [ ] Build succeeds
  - [ ] Containers start
  - [ ] Migrations run
  - [ ] Core workflows execute
  - [ ] No errors in logs
- **Files Changed**: backend/alembic/versions/20251007_1600_initial_schema.py (added last_login column)

---

## Summary Statistics
- **Total Issues**: 10
- **Critical Issues**: 7 (Poetry package mode, bcrypt incompatibility, Tailwind CSS error, TypeScript compilation errors, destructive Docker command, FastAPI/Pydantic incompatibility, incomplete migration + repeated testing failure)
- **Security Issues**: 1 (API key in diagnostics file - caught by GitHub)
- **Safety Issues**: 1 (docker system prune suggestion - caught by user)
- **Process Failures**: 3 (Issues #5, #7, #10 - all testing-related)
- **Resolved Issues**: 10
- **Open Issues**: 0
- **TODOs**: 1 (Generate package-lock.json for frontend)

---

### [2025-10-07 20:40] - Login Failure After FastAPI/Pydantic Upgrade (Investigation In Progress)
- **Issue**: User reports login not working after FastAPI 0.104 → 0.115 upgrade
- **Impact**: Unknown - backend API fully functional via curl, issue appears frontend/browser specific
- **Testing Completed**:
  - ✅ Backend API: All endpoints tested with curl - working correctly
  - ✅ Login endpoint: Returns JWT token via curl
  - ✅ Authenticated endpoints: Work with JWT token
  - ✅ Frontend build: TypeScript compiles without errors
  - ✅ Frontend serving: HTML delivered correctly
  - ❌ Browser testing: Cannot test without actual browser DevTools
- **Root Cause**: UNKNOWN - requires browser DevTools inspection
- **Next Steps**: Created comprehensive testing document at docs/TESTING-SESSION-PROMPT.md
- **Category**: Process & Workflow, Testing
- **Priority**: HIGH
- **Detection**: User reported issue during work PC testing
- **Best Practice**: Backend API tests are not sufficient - must test actual browser behavior with DevTools
- **Note**: Cannot replicate browser environment with curl - need Console/Network tab inspection

---

*This document will be updated throughout the development session.*
