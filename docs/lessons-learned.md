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

## Summary Statistics
- **Total Issues**: 7
- **Critical Issues**: 4 (Poetry package mode, bcrypt incompatibility, Tailwind CSS error, TypeScript compilation errors)
- **Security Issues**: 1 (API key in diagnostics file - caught by GitHub)
- **Resolved Issues**: 7
- **Open Issues**: 0
- **TODOs**: 1 (Generate package-lock.json for frontend)

---

*This document will be updated throughout the development session.*
