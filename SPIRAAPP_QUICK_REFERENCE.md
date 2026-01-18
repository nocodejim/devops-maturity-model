# SpiraApp MVP: Quick Reference for Configurable Assessments

## Current State

| Aspect | Status | Location |
|--------|--------|----------|
| **Hardcoded Questions** | ✅ Implemented | `widget.js` lines 88-304 (DMM_QUESTIONS) |
| **Custom Framework Upload** | ❌ NOT IMPLEMENTED | `settings.js` does not exist |
| **Framework Validation** | ❌ NOT IMPLEMENTED | `settings.js` does not exist |
| **Storage Per-Product** | ✅ Pattern established | `widget.js` uses storageGetProduct/storageUpdateProduct |
| **Dynamic Rendering** | ✅ Implemented | `widget.js` lines 587-612 (renderAssessmentForm) |
| **Scoring Logic** | ✅ Implemented | `widget.js` lines 702-747 (calculateScores) |
| **Backend Integration** | ❌ NOT IMPLEMENTED | Would use `spiraAppManager.executeRest()` |

---

## Architecture Overview

```
SpiraApp Widget (widget.js) - IMPLEMENTED
├─ Init: initDmmWidget() → loadDmmHistory()
├─ Questions: Uses hardcoded DMM_QUESTIONS (no custom framework support yet)
├─ Render: Mustache templates with questions grouped by domain
├─ Scoring: Dynamic calculation based on DOMAIN_WEIGHTS
└─ Storage: Save assessment history to dmm_assessments_history

Settings Page (settings.js) - NEEDS TO BE CREATED
├─ Display current framework status
├─ Upload JSON file
├─ Validate structure
└─ Save to custom_framework storage key

Widget Loading (FUTURE - needs implementation):
├─ loadCustomFramework() → Check storage for custom_framework
├─ If found: Use custom framework JSON
├─ If not: Fall back to hardcoded DMM_QUESTIONS
```

---

## Key Data Files

### 1. manifest.yaml
**Purpose**: SpiraApp configuration
**Current Settings**:
```yaml
guid: 4B8D9721-6A99-4786-903D-9346739A0673
name: DevOpsMaturityAssessment
dashboards:
  - dashboardTypeId: 1  # Product home page widget
    code: file://widget.js
# NOTE: No settings page or storage keys declared yet
# These need to be added for custom framework support
```

### 2. widget.js (842 lines)
**Purpose**: Main assessment logic
**Components**:
- Lines 10-14: Domain weights (hardcoded DOMAIN_WEIGHTS)
- Lines 88-304: DMM_QUESTIONS array (20 questions, 3 domains)
- Lines 307-397: Templates (TPL_SUMMARY, TPL_FORM, TPL_RESULTS)
- Lines 412-418: Event registration (windowLoad, dashboardUpdated)
- Lines 435-518: `loadDmmHistory()` - fetch assessment history from storage
- Lines 587-626: `renderAssessmentForm()` - render form with hardcoded questions
- Lines 702-747: `calculateScores()` - score calculation
- Lines 750-821: `saveAssessmentResults()` - persist to storage
- NOTE: `loadCustomFramework()` does NOT exist yet - needs to be added

### 3. settings.js - DOES NOT EXIST (needs to be created)
**Purpose**: Product admin settings UI for custom framework upload
**Required Components**:
- `processFile()` - file upload handler
- `validateFramework()` - JSON schema validation
- `saveFramework()` - persist custom framework to storage
- `renderCurrentStatus()` - show current framework info

### 4. Custom Framework JSON Structure
**Purpose**: Template for custom frameworks
**Structure**:
```json
{
  "meta": {name, description, version},
  "domains": [
    {id, name, weight, order, questions: [
      {id, text, guidance, order}
    ]}
  ]
}
```

---

## Critical Lessons Learned

### Storage API Gotchas
1. **Must include pluginName** as 2nd parameter (omitting causes logout)
   - ✅ Correct: `storageGetProduct(appGuid, appName, key, productId, success, error)`
   - ❌ Wrong: `storageGetProduct(appGuid, key, productId, success, error)`

2. **Container ID is lowercase**
   - Expected: `4B8D9721-6A99-4786-903D-9346739A0673_content`
   - Actual: `4b8d9721-6a99-4786-903d-9346739a0673_content`
   - Solution: Use `window.DMM_CONTAINER_ID` discovered at runtime

3. **IIFE wrapping prevents collisions**
   - Necessary for dashboard refreshes (prevents "identifier already declared")

4. **Error on first run is expected**
   - "Key not found" 500 error → handle gracefully in error callback

### Validation Requirements
- `meta.name` (required, non-empty)
- `domains` (array, non-empty)
- Each domain: `id`, `name`, `weight` (number), `questions` (array)
- Each question: `id`, `text` (both required)
- Domain weights should sum to ~1.0 (warns if off by >0.01)

---

## How to Create a Custom Framework

### Step 1: Download Template
Click "Download Template" in Product Admin settings → opens `assessment-template.json`

### Step 2: Edit JSON
```json
{
  "meta": {
    "name": "Your Assessment Name",
    "description": "What your assessment measures",
    "version": "1.0"
  },
  "domains": [
    {
      "id": "domain1",
      "name": "Domain Name",
      "weight": 0.35,
      "questions": [
        {
          "id": "Q1",
          "text": "Your question text?",
          "guidance": "Score guidance for assessor"
        }
      ]
    }
  ]
}
```

### Step 3: Upload
1. Go to Product Admin → DevOps Maturity Model
2. Click "Upload Custom Framework"
3. Select edited JSON file
4. Preview shows: domains count, questions count, version
5. Click "Save Framework"

### Step 4: Use
Dashboard widget now displays custom assessment for this product

---

## Scoring Logic

### Calculation Process
```
1. Collect responses (question_id → score 0-5)
2. For each domain: sum scores / (question_count × 5) × 100 = domain%
3. Overall score = Σ(domain% × weight)
4. Map score to level:
   - 0-20%    = Level 1 (Initial)
   - 21-40%   = Level 2 (Developing)
   - 41-60%   = Level 3 (Defined)
   - 61-80%   = Level 4 (Managed)
   - 81-100%  = Level 5 (Optimizing)
```

### Customization Points
- **Weights**: Each domain has `weight` (sum should = 1.0)
- **Score Range**: Currently hardcoded 0-5 (could be extended)
- **Thresholds**: Currently hardcoded 20/40/60/80 (could be customized)

---

## Storage Keys

### Per-Product Storage (via `spiraAppManager.storageGetProduct`)

| Key | Purpose | Type | Example |
|-----|---------|------|---------|
| `custom_framework` | Custom assessment JSON (one per product) | JSON object | `{meta: {name: "..."}, domains: [...]}` |
| `dmm_assessments_history` | Assessment results history (one per product) | JSON array | `[{date: "...", overallScore: 85, ...}, ...]` |

### Signature Required
```javascript
spiraAppManager.storageGetProduct(
  appGuid,        // "4B8D9721-6A99-4786-903D-9346739A0673"
  appName,        // "DevOpsMaturityAssessment"
  key,            // "custom_framework" or "dmm_assessments_history"
  productId,      // current product
  successCallback, // function(data)
  errorCallback   // function(error)
);
```

---

## Implementation Approaches

### Approach A: Local Upload Only (Current MVP)
- ✅ Framework upload via JSON file
- ✅ Per-product configuration
- ✅ No backend required
- ❌ Manual upload per product
- **Use When**: Simple, offline-capable tool needed

### Approach B: Backend-Driven (Future)
- Framework list from backend API
- Product admin selects from dropdown
- Fetches framework on widget load
- Requires internet connection
- **Use When**: Centralized framework management needed

### Approach C: Hybrid (Recommended Medium Term)
- Keep local upload
- Add optional backend framework selection
- Implement fallback chain
- Cache frameworks offline
- **Use When**: Maximum flexibility desired

---

## Extending the MVP

### To Add a New Question to DMM_QUESTIONS
1. Edit `widget.js` lines 92-308
2. Add to appropriate domain array:
   ```javascript
   {
     id: "Q21",
     domain: "domain1",
     text: "Your new question?",
     options: [
       { score: 0, text: "..." },
       { score: 1, text: "..." },
       // ... up to 5
     ]
   }
   ```
3. Rebuild & redeploy SpiraApp package

### To Support Backend Frameworks
1. Add to `manifest.yaml` productSettings:
   ```yaml
   productSettings:
     - settingTypeId: 3
       name: selectedFramework
       caption: Select Framework
   ```
2. Modify `widget.js` loadCustomFramework():
   ```javascript
   // After checking custom_framework key, check for selectedFramework ID
   // Fetch from /api/frameworks/{id}/structure if ID exists
   ```
3. Add fallback chain: custom_framework → backend → DMM_QUESTIONS

### To Add Custom Score Ranges
1. Add to assessment-template.json:
   ```json
   {
     "meta": {
       "scoreRange": 10  // Instead of hardcoded 5
     }
   }
   ```
2. Modify `calculateScores()`:
   ```javascript
   const maxScore = activeFramework?.meta?.scoreRange || 5;
   domainTotals[r.domain].max += maxScore;
   ```

---

## Debugging

### Console Logging
- Widget uses `dmmLog()` helper (line 466)
- Writes to both console AND localStorage
- View logs: `localStorage.getItem('dmm_debug_log')`
- Logs cleared on page load

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Cannot set property of null (innerHTML)" | Container not found | Check DOM scan in logs, ensure widget added to dashboard |
| "Framework not loading" | GUID case mismatch | Widget discovers ID at runtime, stored in `window.DMM_CONTAINER_ID` |
| "Unexpected error" on submit | Form inputs not found | Verify questions are rendered, check container context in handleSubmit |
| "Storage failed" | Key not found on first run | Expected; error callback should render empty state |
| "JSON invalid" on upload | Schema mismatch | Download template, verify all required fields present |

---

## File Checklist for Deployment

Before building `.spiraapp` package:
- [ ] `manifest.yaml` - version is decimal (not semver), not "1.0.0"
- [ ] `widget.js` - wrapped in IIFE, APP_GUID/APP_NAME match manifest
- [ ] `settings.js` - wrapped in IIFE, same APP_GUID/APP_NAME
- [ ] `assessment-template.json` - valid JSON, included in manifest
- [ ] `widget.css` - referenced in widget.js as WIDGET_STYLES string
- [ ] `settings.css` - referenced in settings.js
- [ ] No external imports or CDN links
- [ ] No console.error() calls (use console.log or dmmLog)

---

## API Endpoints (Backend - For Reference)

```
GET  /api/frameworks/                    # List all frameworks
GET  /api/frameworks/{id}                # Get framework details
GET  /api/frameworks/{id}/structure      # Get full hierarchy

POST /api/assessments/                   # Create assessment
GET  /api/assessments/                   # List assessments
GET  /api/assessments/{id}               # Get assessment
PUT  /api/assessments/{id}               # Update assessment
POST /api/assessments/{id}/responses     # Submit responses
```

**Note**: SpiraApp widget does NOT call these by default. Would need to add integration via `spiraAppManager.executeApi()`.

---

## Resources

### Documentation Files
- `docs/spiraapp-lessons-learned.md` - Gotchas and fixes
- `docs/SpiraApp_Information/SpiraApps-Overview.md` - Architecture
- `docs/SpiraApp_Information/SpiraApps-Manager.md` - API reference
- `docs/SpiraApp_Information/SpiraApps-Reference.md` - IDs, types, limits

### Code References
- Backend frameworks: `backend/app/core/gates.py` (question definitions)
- Database models: `backend/app/models.py` (Framework, Domain, Gate, Question)
- Seed scripts: `backend/app/scripts/seed_*.py` (framework seeding)

---

## Next Steps

### Phase 1: Build Custom Framework Foundation
1. [ ] Create settings.js with admin UI
2. [ ] Update manifest.yaml for settings page
3. [ ] Add framework loading to widget.js
4. [ ] Add fallback to DMM_QUESTIONS
5. [ ] Test end-to-end

### Phase 2: Enhance Validation
1. [ ] Improve error messages & logging
2. [ ] Add dry-run preview before saving
3. [ ] Support custom score ranges (0-3, 0-4, 0-10)
4. [ ] Add assessment export (CSV/PDF)

### Phase 3: Backend Integration
1. [ ] Add manifest settings for backend URL/API key
2. [ ] Implement backend framework selection via executeRest
3. [ ] Add framework versioning & rollback
4. [ ] Add offline caching for backend frameworks

### Phase 4: Advanced Features
1. [ ] Organization-level framework templates
2. [ ] Per-product customization (override questions)
3. [ ] Benchmarking against industry standards
4. [ ] Advanced analytics & trends

