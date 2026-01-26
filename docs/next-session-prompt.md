# Next Session Starter Prompt

Copy and paste everything below the line into your next Claude Code session:

---

## Context from Previous Session

I completed a deep-dive analysis of this DevOps Maturity Assessment Platform and implemented Issue #13 (PDF Report Generation). Key findings:

### Architecture Summary

- **Backend**: FastAPI (Python 3.11) with SQLAlchemy ORM, JWT auth, PostgreSQL
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + React Query
- **Frameworks**: 3 assessment frameworks (DOMM 40q, CALMS 28q, DORA 25q)
- **Structure**: Framework → Domain (weighted) → Gate → Question (0-5 scoring)

### Documentation Created

- `docs/architecture-deep-dive-analysis.md` - Full architecture and framework evaluation
- `docs/mvp-spec-gap-analysis.md` - Gap analysis comparing MVP spec vs implementation

### GitHub Issues Created

14 issues created with detailed design specs (Issues #13-#26):
- **HIGH Priority**: #13 PDF Report (COMPLETE), #14 Recommendations Engine, #15 Auto-Save
- **MEDIUM Priority**: #16-#20 (Token Refresh, httpOnly Cookie, Recommendations Page, Test Suites, Admin UI)
- **LOW Priority**: #21-#26 (Analytics Trends, Radar Chart, Progress UI, Notes Display, Pre-commit, shadcn/ui)

### Completed in Previous Session

- **Issue #13 - PDF Report Generation**: Implemented and merged via PR #27
  - Created `backend/app/utils/pdf_generator.py` using ReportLab
  - Added `GET /api/assessments/{id}/report/pdf` endpoint
  - Added download button to ResultsPage with loading/error states
  - Updated USER-GUIDE.md, progress-tracker.md, README.md

---

## Current Task: Implement Issue #15 - Auto-Save Assessment Responses

### Branch Setup

```bash
git checkout master
git pull origin master
git checkout -b feature/auto-save-responses
```

### Issue Details

https://github.com/nocodejim/devops-maturity-model/issues/15

**Summary**: Implement auto-save functionality that automatically saves assessment responses every 30 seconds, preventing data loss.

**Current State**:
- Manual save button only
- No debounced auto-save
- No visual indicator of save status
- Risk of data loss if user navigates away

### Key Files to Modify

**Frontend** (primary work):
- `frontend/src/hooks/useAutoSave.ts` - New hook for auto-save logic
- `frontend/src/pages/AssessmentPage.tsx` - Integrate auto-save hook
- `frontend/src/components/SaveStatusIndicator.tsx` - New component for save status

**Backend** (likely no changes needed):
- `backend/app/api/assessments.py` - Already has `POST /{id}/responses` endpoint

### Design Highlights from Issue

1. **Auto-Save Hook** (`useAutoSave.ts`):
   - Debounced save every 30 seconds
   - Tracks save status: 'idle' | 'saving' | 'saved' | 'error'
   - Only saves when data actually changes
   - Cancels pending saves on unmount

2. **Save Status Indicator**:
   - Shows "Saving..." during save
   - Shows "Saved" with timestamp after success
   - Shows "Error" with retry option on failure

3. **AssessmentPage Integration**:
   - Wire up useAutoSave hook with responses state
   - Add SaveStatusIndicator to header
   - Preserve manual save button as fallback

### Test User

- Email: admin@example.com
- Password: admin123

### Ports

- Frontend: http://localhost:8673
- Backend: http://localhost:8680
- API Docs: http://localhost:8680/docs

---

## Instructions

Please implement Issue #15 (Auto-Save Assessment Responses). Start by:

1. Creating the feature branch
2. Reading the full issue details from GitHub
3. Reviewing the current AssessmentPage.tsx implementation
4. Creating the useAutoSave hook
5. Creating the SaveStatusIndicator component
6. Integrating into AssessmentPage
7. Testing the complete flow (start assessment, answer questions, verify auto-save)

### Implementation Notes

1. The backend already has the responses endpoint working - verify it first
2. Consider using lodash debounce or implementing a simple debounce
3. Make sure to handle the case where the assessment is already submitted (disable auto-save)
4. Add console.log debugging per CLAUDE.md requirements during MVP testing
5. Remember to follow the pre-commit protocol in CLAUDE.md before committing
