# Collaboration Best Practices - Reference Documentation

## Purpose

This document provides detailed guidelines for maintaining documentation and commit quality. It is a **reference document** for human developers and AI collaborators.

**For active instructions, see:** `/CLAUDE.md` (concise, loaded with every session)

---

## Pre-Commit Checklist

Before running `git commit`, ALWAYS complete these steps:

### 1. Update lessons-learned.md
**File**: `/docs/lessons-learned.md`

**When**: Encountered any issue, bug, error, or learned something new

**What to add**:
- Issue description and impact
- Root cause analysis
- Resolution steps taken
- Lesson learned (what to do differently)
- Category (Dependencies, Code Quality, Process, etc.)
- Priority level

**Example Entry**:
```markdown
### [YYYY-MM-DD HH:MM] - Brief Issue Title
- **Issue**: What went wrong
- **Impact**: How it affected development/functionality
- **Root Cause**: Why it happened
- **Resolution**: How it was fixed
- **Lesson**: Key takeaway for future
- **Category**: Process & Workflow
- **Priority**: CRITICAL/High/Medium/Low
```

### 2. Update progress-tracker.md
**File**: `/docs/progress-tracker.md`

**When**: Completed a feature, phase, or milestone

**What to update**:
- Mark completed checkboxes [x]
- Update phase completion percentages
- Update "Last Updated" date
- Update "Current Phase" status
- Add notes section with progress summary
- Update milestone table with completion dates

### 3. Update testing-checklist.md (if applicable)
**File**: `/docs/testing-checklist.md`

**When**: Added new features that need testing

**What to add**:
- Test cases for new functionality
- Integration test scenarios
- Browser testing requirements
- Expected vs actual results

### 4. Update README.md (for major changes)
**File**: `/README.md`

**When**: Major feature completion, architecture changes, setup changes

**What to update**:
- Feature list if new capabilities added
- Quick Start if setup changed
- Technology Stack if dependencies changed
- API Documentation if endpoints changed
- Troubleshooting if new issues discovered

---

## Commit Message Guidelines

### Format
```
<type>: <subject>

<body>

<lessons-learned-reference>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Subject
- Concise (50 chars or less)
- Imperative mood ("Add" not "Added")
- No period at end

### Body
- Explain WHAT and WHY (not HOW)
- Reference issue numbers if applicable
- List major changes
- Include lessons learned summary

### Lessons Reference
If this commit resolves an issue in lessons-learned.md, reference it:
```
Fixes issue documented in lessons-learned.md #7
Related to Critical Testing Directive (lesson #5)
```

---

## Documentation Update Workflow

```
1. CODE CHANGE
   ↓
2. TEST IN BROWSER (Critical - Lesson #5 & #7)
   ↓
3. Document any issues in lessons-learned.md
   ↓
4. Update progress-tracker.md checkboxes
   ↓
5. Update testing-checklist.md if needed
   ↓
6. Stage files: git add <changed-files> docs/
   ↓
7. Commit with comprehensive message
   ↓
8. Verify commit includes doc changes
```

---

## Critical Testing Directive (Lesson #5 & #7)

**NEVER mark features as complete without testing in actual environment:**

- ✅ **DO**: Test web apps in browser
- ✅ **DO**: Test APIs with actual requests
- ✅ **DO**: Check browser console for errors
- ✅ **DO**: Verify network traffic
- ✅ **DO**: Run TypeScript build to catch type errors

- ❌ **DON'T**: Trust curl/wget for frontend testing
- ❌ **DON'T**: Assume HTML response = working app
- ❌ **DON'T**: Skip browser console checks
- ❌ **DON'T**: Commit without verifying TypeScript compiles

**Command to check TypeScript before commit:**
```bash
docker-compose exec frontend npm run build
```

---

## Common Documentation Locations

| What Changed | File to Update |
|--------------|----------------|
| Bug discovered/fixed | `docs/lessons-learned.md` |
| Feature completed | `docs/progress-tracker.md` |
| New test cases | `docs/testing-checklist.md` |
| Setup instructions | `README.md` |
| API endpoints | `README.md` + API docs |
| Dependencies | `README.md` Technology Stack |

---

## Example: Complete Documentation Update

### Scenario: Fixed TypeScript compilation error

**1. Update lessons-learned.md**
```markdown
### [2025-10-07 12:28] - TypeScript Compilation Errors Preventing Frontend Execution
- **Issue**: Login page displayed but clicking "Sign In" did nothing
- **Impact**: Critical - entire frontend non-functional
- **Root Cause**: TypeScript errors preventing Vite compilation
- **Resolution**: Added null safety, created vite-env.d.ts
- **Lesson**: Always run `npm run build` to catch TypeScript errors
- **Category**: Code Quality, Process & Workflow
```

**2. Update progress-tracker.md**
```markdown
## Notes

### 2025-10-07
- Fixed critical TypeScript compilation errors
- Frontend now fully functional
- All Phase 2 features complete
```

**3. Commit**
```bash
git add frontend/ docs/
git commit -m "fix: Resolve TypeScript compilation errors

- Fixed ResultsPage.tsx undefined score handling
- Created vite-env.d.ts for proper Vite types
- Restarted frontend container

Documented in lessons-learned.md #7
Related to Critical Testing Directive (lesson #5)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Why This Matters

1. **Knowledge Preservation**: Future sessions can learn from past mistakes
2. **Quality Assurance**: Forces testing before committing
3. **Clear History**: Git log tells the story of development
4. **User Trust**: Shows diligence and thoroughness
5. **Debugging**: Easy to find when/why issues were introduced

---

## Quick Reference Card

Before EVERY commit:
```
□ Tested in actual environment (browser/API)
□ Updated lessons-learned.md (if issue encountered)
□ Updated progress-tracker.md (if milestone reached)
□ Updated testing-checklist.md (if new tests needed)
□ Updated README.md (if major change)
□ Commit message includes docs/ changes
□ Commit message references lessons learned
```

---

**Remember**: Documentation is not optional. It's part of the deliverable.

**User's Instruction**: "maintain instruction and documentation integrity as you work"

This means: Update docs FIRST, then commit. Not as an afterthought.
