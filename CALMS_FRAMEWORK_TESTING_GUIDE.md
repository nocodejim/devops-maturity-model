# CALMS Framework Testing Guide

## Overview

This guide explains how to test the **CALMS DevOps Framework** (Culture, Automation, Lean, Measurement, Sharing) in both the backend and SpiraApp.

The CALMS Framework provides a **lightweight organizational readiness assessment** for DevOps transformation, with **28 questions across 5 domains**, taking approximately **90 minutes to complete**.

---

## Quick Start

### For Backend Testing (PostgreSQL Database)
```bash
cd /home/jim/projects/devops-maturity-model/backend
docker-compose exec backend python -m app.scripts.seed_calms_framework
```

### For SpiraApp Testing (Settings Page Upload)
1. Access SpiraApp Settings Page
2. Upload: `/home/jim/projects/devops-maturity-model/src/spiraapp-mvp/calms-framework.json`
3. View results in dashboard widget

---

## Part 1: Backend Setup

### 1.1 Seed the CALMS Framework

**Location**: `backend/app/scripts/seed_calms_framework.py`

**What it does**:
- Creates the CALMS Framework in PostgreSQL
- Adds 5 domains with proper weightings
- Adds 28 questions with detailed guidance
- Sets up 1 gate per domain (system requirement)

**Command**:
```bash
cd /home/jim/projects/devops-maturity-model
docker-compose exec backend python -m app.scripts.seed_calms_framework
```

**Expected Output**:
```
Created framework: CALMS DevOps Framework
✅ Successfully seeded CALMS DevOps Framework
   - Framework: CALMS DevOps Framework
   - Domains: 5 (Culture 25%, Automation 25%, Lean 15%, Measurement 20%, Sharing 15%)
   - Questions: 28 total (6+6+5+6+5)
   - Estimated completion time: 90 minutes

✨ Lightweight organizational readiness assessment ready for testing!
```

### 1.2 Verify Backend Data

**Check via API**:
```bash
# List all frameworks
curl http://localhost:8680/api/frameworks/

# Get CALMS framework details
curl http://localhost:8680/api/frameworks/ | jq '.[] | select(.name == "CALMS DevOps Framework")'

# Get full structure with all questions
curl http://localhost:8680/api/frameworks/{framework_id}/structure
```

**Check via Database** (optional):
```bash
# Access PostgreSQL directly
docker-compose exec db psql -U devops_user -d devops_db

# List frameworks
SELECT id, name, version FROM frameworks;

# Count questions
SELECT COUNT(*) FROM framework_questions;

# View domain weights
SELECT name, weight, order FROM framework_domains WHERE framework_id = '{CALMS_ID}';
```

---

## Part 2: SpiraApp Settings Page Testing

### 2.1 File Location

**SpiraApp-compatible JSON file**:
```
/home/jim/projects/devops-maturity-model/src/spiraapp-mvp/calms-framework.json
```

**File size**: ~50 KB (well within SpiraApp storage limits)

**Format**: SpiraApp custom framework JSON (domains → questions)

### 2.2 Upload to Settings Page

**Steps**:

1. **Access SpiraApp Settings**
   - URL: `http://localhost:8673/` (or your SpiraApp instance)
   - Navigate to: Product Admin → SpiraApp Settings
   - Find: DevOps Maturity Assessment Widget

2. **Upload Custom Framework**
   - Click: "Upload Custom Framework"
   - Select: `calms-framework.json`
   - File validation should show:
     ```
     ✓ Framework name: CALMS DevOps Framework
     ✓ Domains: 5
     ✓ Questions: 28
     ✓ Estimated duration: 90 minutes
     ```

3. **Save Framework**
   - Click: "Save Framework"
   - Should see success message:
     ```
     Framework uploaded successfully!
     CALMS DevOps Framework is now active for this product.
     ```

### 2.3 Test in Dashboard Widget

**Steps**:

1. **Navigate to Dashboard**
   - Go to: Product Dashboard
   - Find: DevOps Maturity Assessment widget

2. **Verify Framework**
   - Should display: "Framework: CALMS DevOps Framework"
   - Should show: "5 Domains, 28 Questions"

3. **Start Assessment**
   - Click: "Start Assessment"
   - Verify all 28 questions appear:
     - Culture: Q1-Q6 (6 questions)
     - Automation: Q7-Q12 (6 questions)
     - Lean: Q13-Q17 (5 questions)
     - Measurement: Q18-Q23 (6 questions)
     - Sharing: Q24-Q28 (5 questions)

4. **Answer Sample Questions**
   - Select scores for 5-10 questions
   - Verify guidance text appears correctly
   - Click: "Calculate Scores"

5. **Verify Results**
   - Should show domain scores (weighted by 0.25, 0.25, 0.15, 0.20, 0.15)
   - Should show overall maturity level
   - Should save to assessment history

---

## Part 3: Framework Structure Details

### 3.1 Domain Breakdown

| Domain | Weight | Questions | Focus Area |
|--------|--------|-----------|-----------|
| **Culture** | 25% | 6 | Collaboration, blameless culture, ownership |
| **Automation** | 25% | 6 | CI/CD, testing, infrastructure automation |
| **Lean** | 15% | 5 | Continuous improvement, waste reduction |
| **Measurement** | 20% | 6 | Metrics, monitoring, data-driven decisions |
| **Sharing** | 15% | 5 | Knowledge sharing, documentation, learning |

**Total**: 28 questions, weighted to 100%

### 3.2 Scoring Scale

All questions use 0-5 maturity scale:
- **0** = None/Unknown
- **1** = Initial/Ad-hoc
- **2** = Developing
- **3** = Defined
- **4** = Managed
- **5** = Optimizing

### 3.3 Guidance Examples

Each question includes detailed guidance for all 5 levels:

```json
{
  "text": "How are application builds created?",
  "guidance": "Score 0 = Manual build process ... | Score 1 = Basic shell scripts ... | Score 2 = Scripted builds ... | Score 3 = Automated on commit ... | Score 4 = Fully automated CI ... | Score 5 = Automated CI for all projects ...",
}
```

---

## Part 4: Testing Scenarios

### 4.1 Happy Path: Complete Assessment

**Steps**:
1. Upload `calms-framework.json` to settings
2. Answer all 28 questions with scores 3-4 (typical mid-range org)
3. Verify scores are calculated correctly
4. Save assessment

**Expected Result**:
- Overall score: ~65-75% (depends on answers)
- Maturity level: "Managed" (level 4)
- Results saved to history

### 4.2 Edge Case: Minimal Effort

**Steps**:
1. Answer only first 5 questions
2. Click "Calculate Scores"

**Expected Result**:
- System should either:
  - Calculate partial score (only answered domains), or
  - Require all questions to be answered
- Verify behavior is documented

### 4.3 Edge Case: All Zeros (Immature Org)

**Steps**:
1. Answer all 28 questions with score 0
2. Calculate

**Expected Result**:
- Overall score: 0%
- Maturity level: "Initial" (level 1)
- All domains show 0%

### 4.4 Edge Case: All Fives (Excellent Org)

**Steps**:
1. Answer all 28 questions with score 5
2. Calculate

**Expected Result**:
- Overall score: 100%
- Maturity level: "Optimizing" (level 5)
- All domains show 100%

### 4.5 Framework Switching

**Steps**:
1. Upload CALMS framework
2. Run assessment, save results
3. Upload different framework (e.g., DORA)
4. Verify CALMS history is preserved

**Expected Result**:
- Assessment history shows both frameworks
- Can switch between frameworks
- Previous results not lost

---

## Part 5: Validation Checklist

### Backend Validation

- [ ] Seed script runs without errors
- [ ] 5 domains created with correct weights
- [ ] 28 questions created across domains
- [ ] Each question has guidance text
- [ ] Questions ordered correctly (1-6, 1-6, 1-5, 1-6, 1-5)
- [ ] API endpoint returns correct structure
- [ ] Database queries are performant

### SpiraApp Validation

- [ ] JSON file is valid (no parse errors)
- [ ] File size < 1MB (safe for SpiraApp storage)
- [ ] Framework validates in settings page
- [ ] All 28 questions appear in widget
- [ ] Guidance text renders correctly
- [ ] Scoring logic works with custom weights
- [ ] Results save to assessment history
- [ ] Can upload/replace framework multiple times

### Scoring Validation

- [ ] Domain weights sum to 1.0 (or 0.99-1.01)
- [ ] Scores calculated per domain (25%, 25%, 15%, 20%, 15%)
- [ ] Overall score is weighted average
- [ ] Maturity levels map correctly:
  - 0-20% = Level 1 (Initial)
  - 21-40% = Level 2 (Developing)
  - 41-60% = Level 3 (Defined)
  - 61-80% = Level 4 (Managed)
  - 81-100% = Level 5 (Optimizing)

---

## Part 6: Console Logging (MVP Debugging)

According to `CLAUDE.md`, extensive console logging should be enabled during testing:

### Frontend Console Logs

Add to `src/spiraapp-mvp/widget.js`:

```javascript
[DMM Widget] Framework loaded: CALMS DevOps Framework
[DMM Widget] Domains: 5 (Culture, Automation, Lean, Measurement, Sharing)
[DMM Widget] Questions: 28 total
[DMM Widget] Calculating scores...
[DMM Widget] Domain scores: { culture: 75, automation: 68, ... }
[DMM Widget] Overall score: 72.45
[DMM Widget] Maturity level: Managed (4)
```

### Backend Console Logs

Already included in seed script:

```
Created framework: CALMS DevOps Framework
   - Domain 1: Culture (25%)
   - Domain 2: Automation (25%)
   ...
✅ Successfully seeded CALMS DevOps Framework
```

---

## Part 7: Common Issues & Troubleshooting

### Issue: Framework not appearing in settings

**Causes**:
- JSON file path incorrect
- File has parse errors
- Validation failed

**Solution**:
```bash
# Check JSON validity
python -m json.tool /home/jim/projects/devops-maturity-model/src/spiraapp-mvp/calms-framework.json

# Check console for error messages (F12 → Console)
```

### Issue: Questions appearing in wrong order

**Cause**: Question `order` field not set correctly

**Solution**:
- Verify `"order"` fields are 1-6, 1-6, 1-5, 1-6, 1-5 per domain
- Reload widget

### Issue: Weights not summing to 1.0

**Cause**: Domain weights don't equal 1.0

**Current weights**: 0.25 + 0.25 + 0.15 + 0.20 + 0.15 = 1.00 ✓

### Issue: Seed script fails to run

**Cause**: Database not accessible

**Solution**:
```bash
# Check database is running
docker-compose ps

# Check connection
docker-compose exec db psql -U devops_user -d devops_db -c "SELECT version();"

# Run seed script with verbose output
docker-compose exec backend python -u -m app.scripts.seed_calms_framework
```

---

## Part 8: Performance Considerations

### File Size
- `calms-framework.json`: ~50 KB
- SpiraApp storage limit: Safe (typically 1MB+ per key)

### Load Time
- Framework loading: <100ms (JSON parse)
- Question rendering: <500ms (28 questions)
- Scoring calculation: <50ms

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- No external dependencies
- Pure JavaScript (IIFE wrapped)

---

## Part 9: Next Steps After Testing

### If Validation Passes ✓

1. **Commit to Repository**
   ```bash
   git add src/spiraapp-mvp/calms-framework.json
   git add backend/app/scripts/seed_calms_framework.py
   git commit -m "Add CALMS Framework assessment (28 questions, 5 domains)"
   ```

2. **Update Documentation**
   - Add CALMS to framework list in README
   - Document how to upload in SpiraApp guide

3. **Create Example Assessment**
   - Run assessment with realistic scores
   - Save example results for documentation

### If Issues Found

1. **Fix Issues**
   - Update JSON if validation errors
   - Fix seed script if database issues

2. **Retest**
   - Follow validation checklist again

3. **Document Workarounds**
   - Add to `docs/spiraapp-lessons-learned.md` if needed

---

## Part 10: Files Reference

| File | Purpose | Format |
|------|---------|--------|
| `src/spiraapp-mvp/calms-framework.json` | SpiraApp-compatible framework | JSON (SpiraApp schema) |
| `backend/app/scripts/seed_calms_framework.py` | Database seeding script | Python |
| `CALMS_FRAMEWORK_TESTING_GUIDE.md` | This guide | Markdown |

---

## Summary

The CALMS Framework consists of:
- **28 questions** across **5 domains**
- **Weighted scoring** (Culture 25%, Automation 25%, Lean 15%, Measurement 20%, Sharing 15%)
- **0-5 maturity scale** with detailed guidance
- **~90 minutes** to complete
- **Backend**: Seeded to PostgreSQL via seed script
- **SpiraApp**: Uploaded as JSON to settings page

Test both the backend API and SpiraApp widget to ensure full functionality.

---

**Status**: Ready for testing
**Created**: January 17, 2026
**Framework Version**: 1.0

