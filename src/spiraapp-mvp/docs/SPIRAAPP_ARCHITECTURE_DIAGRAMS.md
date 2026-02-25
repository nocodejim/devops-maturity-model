# SpiraApp MVP: Architecture Diagrams & Flow Charts

## 1. Current Assessment Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    SPIRAAPP DASHBOARD WIDGET                      │
│                      (widget.js - 988 lines)                      │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    initDmmWidget() [line 420]
                              │
                ┌─────────────┼─────────────┐
                │             │             │
                ▼             ▼             ▼
         loadCustom    Check for      Render
         Framework    local history    Summary
         [line 429]   [line 479]       [line 565]
                │
                ├─ No framework found → activeFramework = null
                │
                └─ Framework found → activeFramework = JSON.parse(data)
                              │
                              ▼
                        renderSummary()
                              │
                    ┌─────────┴──────────┐
                    │                    │
                    ▼                    ▼
            Has History?          No History Yet?
                    │                    │
                    ├─ Show latest   ├─ Show CTA:
                    │  score/level   │  "Start Assessment"
                    │  Previous: X   │
                    │  [Assessment   │
                    │   Button]      │
                    │                │
                    └────┬───────────┘
                         │
                         ▼
                  User Clicks Button
                         │
                         ▼
            renderAssessmentForm() [line 631]
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
 Check for      Build Domain        Show Form with:
 activeFramework  Structure from:    - Domain sections
 [line 642]         - Custom         - Questions (radio)
                      framework     - Submit button
                    OR
                    - DMM_QUESTIONS
                      [line 662]
                         │
                         ▼
              Render with Mustache
              (TPL_FORM [line 339])
                         │
                         ▼
                User Answers Questions
                         │
                         ▼
              handleSubmit() [line 751]
                         │
                ┌────────┴─────────┐
                │                  │
                ▼                  ▼
          Validate All       Collect Responses
          Answered [line 805]  [line 782]
                │                  │
                ├─ Missing answer   │
                │  → Error message  │
                │                   │
                └───────┬───────────┘
                        │ (All answered)
                        ▼
              calculateScores() [line 825]
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
    Domain Totals  Overall Score  Maturity Level
    (per domain)   (weighted avg)  (1-5 mapping)
    [line 836]     [line 860]      [line 869]
        │               │               │
        └───────────────┴───────────────┘
                        │
                        ▼
            Result Object Created
            [line 876]
                        │
                        ▼
          saveAssessmentResults()
            [line 896]
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
    Fetch         Append Result      Save History
    Existing      to array           [line 922]
    History       [line 917]
    [line 906]
        │
        ├─ Success: Update [line 922]
        │            or Insert [line 936]
        │
        └─ Error: Try insert [line 936]
                        │
                        ▼
            renderResults() [line 972]
                        │
                ┌───────┴───────┐
                │               │
                ▼               ▼
            Show Score      Show Domain
            & Level         Scores
                │               │
                └───────┬───────┘
                        │
                        ▼
            User Clicks "Back to Dashboard"
                        │
                        ▼
            initDmmWidget() [restart cycle]
```

---

## 2. Storage & Persistence Architecture

```
┌─────────────────────────────────────────────────────────┐
│         SPIRAAPP STORAGE (Per Product)                  │
│     (spiraAppManager.storage*Product API)              │
└─────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
    KEY: custom_   KEY: dmm_          (Additional
    framework      assessments_       keys can be
    (max size ~1MB) history            added)
        │               │
        │               ▼
        │           JSON Array of
        │           Assessment Results:
        ▼           [
    JSON Object:    {date, overallScore,
    {               maturityLevel,
      meta: {       domainScores,
        name,       responses,
        description,frameworkName},
        version     {date, ...},
      },            {date, ...}
      domains: [  ]
        {
          id,
          name,
          weight,
          questions: [
            {
              id,
              text,
              guidance
            }
          ]
        }
      ]
    }
        │
        ▼
    Storage Signature:
    storageGetProduct(
      appGuid,        // "4B8D9721-..."
      appName,        // "DevOpsMaturityAssessment"
      key,            // "custom_framework"
      productId,      // int (from spiraAppManager)
      success,        // callback function
      error           // callback function
    )
```

---

## 3. Configuration Flow: Product Admin Settings Page

```
┌────────────────────────────────────────────────────────┐
│    PRODUCT ADMIN: DEVOPS MATURITY SETTINGS PAGE        │
│           (pageId: 21, settings.js)                    │
└────────────────────────────────────────────────────────┘
                        │
                        ▼
            renderSettingsPage() [line 167]
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
    Load Current              Render HTML:
    Framework [line 213]      TPL_SETTINGS [line 71]
        │                               │
        │                    ┌──────────┴──────────┐
        │                    │                     │
        │                    ▼                     ▼
        │            Current Status         Upload Area
        │            Display                - File input
        │            [line 244]             - Drag & drop
        │                    │              - Preview
        │                    │              - Error msgs
        │                    │              - Download Template
        │                    │
        └────────┬───────────┘
                 │
                 ▼
        bindEvents() [line 268]
                 │
        ┌────────┼────────┬─────────┐
        │        │        │         │
        ▼        ▼        ▼         ▼
      File   Drag&  Download  Clear
      Input  Drop   Template  Framework
      Change       Button      Button
                              (if custom exists)
                 │
                 └──────────┬──────────┐
                            │          │
                            ▼          ▼
                      User Interaction
                            │
                ┌───────────┬┴────────────┐
                │           │            │
                ▼           ▼            ▼
          File           Download     Click Clear
          Selected       Template     Button
                │           │           │
                ▼           ▼           ▼
          processFile() downloadTemplate()  clearFramework()
          [line 319]    [line 587]       [line 557]
                │           │               │
                ▼           ▼               ▼
          Read         Create         Confirm
          File         Blob &         Dialog
                       Trigger
                       Download
                │
                ▼
          JSON.parse()
                │
        ┌───────┴────────┐
        │                │
        ▼                ▼
      Valid            Invalid
      JSON              JSON
        │                │
        ▼                ▼
    validateFramework() showError()
    [line 339, 362]    [line 469]
        │                │
    ┌───┴────┐           │
    │        │           │
    ▼        ▼           │
  Valid   Invalid        │
    │        │           │
    ├─────────┴───────────┘
    │
    ▼
showPreview() [line 433]
    │
    ├─ Framework Name
    ├─ Domain Count
    ├─ Question Count
    ├─ Version
    │
    └─ Buttons:
       - Save Framework
       - Cancel
       │
       ├─ User clicks SAVE
       │       │
       │       ▼
       │   saveFramework() [line 483]
       │       │
       │       ├─ Disable button
       │       ├─ Call storageUpdateProduct()
       │       │       or storageInsertProduct()
       │       │
       │       └─ On Success:
       │           ├─ onSaveSuccess()
       │           ├─ Show success message
       │           ├─ Refresh status display
       │           └─ Clear file input
       │
       └─ User clicks CANCEL
               │
               ▼
           clearPreview()
           pendingFramework = null
```

---

## 4. Data Model: Framework Hierarchy

```
┌─────────────────────────────────────────────────────┐
│              ASSESSMENT FRAMEWORK                    │
│    (Custom JSON stored in SpiraApp Storage)         │
└─────────────────────────────────────────────────────┘
            │
            ├─ meta
            │   ├─ name: string
            │   ├─ description: string
            │   └─ version: string
            │
            └─ domains: array [0..N]
                    │
                    ├─ Domain 1
                    │   ├─ id: "domain1"
                    │   ├─ name: "Source Control"
                    │   ├─ description: string
                    │   ├─ weight: 0.35    ← Relative importance
                    │   ├─ order: 1
                    │   │
                    │   └─ questions: array [0..M]
                    │       │
                    │       ├─ Question 1
                    │       │   ├─ id: "Q1"
                    │       │   ├─ text: "..."
                    │       │   ├─ guidance: "Score 0=... | Score 5=..."
                    │       │   ├─ order: 1
                    │       │   │
                    │       │   └─ options: array (optional, auto-generated if absent)
                    │       │       ├─ {score: 0, text: "Level 0 - None"}
                    │       │       ├─ {score: 1, text: "Level 1 - Initial"}
                    │       │       ├─ {score: 2, text: "Level 2 - Developing"}
                    │       │       ├─ {score: 3, text: "Level 3 - Defined"}
                    │       │       ├─ {score: 4, text: "Level 4 - Managed"}
                    │       │       └─ {score: 5, text: "Level 5 - Optimizing"}
                    │       │
                    │       └─ Question 2
                    │           ├─ id: "Q2"
                    │           ├─ text: "..."
                    │           └─ ...
                    │
                    ├─ Domain 2
                    │   ├─ id: "domain2"
                    │   ├─ name: "Security"
                    │   ├─ weight: 0.30
                    │   └─ questions: [...]
                    │
                    └─ Domain 3
                        ├─ id: "domain3"
                        ├─ name: "CI/CD"
                        ├─ weight: 0.35
                        └─ questions: [...]

Note: Domain weights should sum to 1.0
      Questions per domain can vary
      Score range per question: 0-5 (currently hardcoded)
      Options are auto-generated if not provided
```

---

## 5. Response Collection & Scoring Flow

```
┌──────────────────────────────────────┐
│    USER ANSWERS ALL QUESTIONS        │
│    (Radio buttons in form)           │
└──────────────────────────────────────┘
            │
            ▼
    Form structure (per domain):
    <input name="Q1" value="3" checked />   ← Selected score
    <input name="Q2" value="2" />
    <input name="Q3" value="4" />
    ...
            │
            ▼
    handleSubmit() collects:
    responses = {
      Q1: {domain: "domain1", score: 3},
      Q2: {domain: "domain1", score: 2},
      Q3: {domain: "domain2", score: 4},
      ...
    }
            │
            ▼
    calculateScores(responses) [line 825]
            │
    ┌───────┴───────────────────────────────┐
    │                                       │
    ▼ Step 1: Sum Domain Scores             │
                                            │
    domain1 (Source Control):               │
    ├─ Q1=3, Q2=2                          │
    ├─ Current: 3+2 = 5                    │
    ├─ Max possible: 2 questions × 5 = 10  │
    ├─ Percentage: (5/10) × 100 = 50%      │
    │                                       │
    domain2 (Security):                     │
    ├─ Q3=4, Q4=4, Q5=3                    │
    ├─ Current: 4+4+3 = 11                 │
    ├─ Max possible: 3 × 5 = 15            │
    ├─ Percentage: (11/15) × 100 = 73%     │
    │                                       │
    domain3 (CI/CD):                        │
    ├─ Q6=5, Q7=4, Q8=3, Q9=5, Q10=4       │
    ├─ Current: 5+4+3+5+4 = 21             │
    ├─ Max possible: 5 × 5 = 25            │
    └─ Percentage: (21/25) × 100 = 84%     │
                                            │
    ▼                                       │
    Step 2: Apply Domain Weights           │
    (Get weights from getActiveDomainWeights)
                                            │
    overall = 0                            │
    + (50% × 0.35) = 17.5                  │
    + (73% × 0.30) = 21.9                  │
    + (84% × 0.35) = 29.4                  │
    ────────────────────────               │
      TOTAL = 68.8%                        │
                                            │
    ▼                                       │
    Step 3: Map to Maturity Level          │
    (threshold: 20/40/60/80)               │
                                            │
    68.8% > 60% and < 80%                  │
    → Level 4: "Managed"                   │
                                            │
    └────────────────────────────────────────┘
            │
            ▼
    Result Object:
    {
      date: "2024-01-17T10:30:00Z",
      overallScore: 68.8,
      maturityLevel: "Managed",
      maturityLevelInt: 4,
      domainScores: {
        domain1: 50,
        domain2: 73,
        domain3: 84
      },
      responses: {Q1: {...}, Q2: {...}, ...},
      frameworkName: "DevOps Maturity" or "Custom Name"
    }
            │
            ▼
    renderResults(result) [line 972]
            │
            ├─ Display overall score: "68.8%"
            ├─ Display level badge: "Managed"
            ├─ Display domain cards:
            │  ├─ "Source Control: 50%"
            │  ├─ "Security: 73%"
            │  └─ "CI/CD: 84%"
            │
            ├─ Save history:
            │  └─ Append result to dmm_assessments_history array
            │
            └─ Show "Back to Dashboard" button
```

---

## 6. Approaches for Project-Specific Assessments

### Approach A: Local Custom Framework (Current MVP)

```
┌────────────────────────────────┐
│  Product Admin Settings Page   │
│  (pageId: 21)                  │
└────────────────────────────────┘
            │
            ├─ Current Framework Status
            │  ├─ Default: "Using built-in DevOps Maturity"
            │  └─ Custom: "Using Security Focused Assessment (5 domains, 15 questions)"
            │
            ├─ Upload Custom Framework
            │  ├─ File input (drag & drop)
            │  ├─ Validate JSON schema
            │  └─ Save to custom_framework storage key
            │
            └─ Download Template
               └─ assessment-template.json
                        │
                        ▼
            ┌──────────────────────────────┐
            │   SpiraApp Storage           │
            │   (Per Product Key/Value)    │
            └──────────────────────────────┘
                        │
                        ├─ custom_framework: {...}  ← Custom JSON
                        │
                        ▼
            ┌──────────────────────────────┐
            │  Dashboard Widget            │
            │  (widget.js - initDmmWidget) │
            └──────────────────────────────┘
                        │
                        ├─ Load custom_framework
                        │  ├─ If exists: activeFramework = custom
                        │  └─ If not: activeFramework = null (use DMM_QUESTIONS)
                        │
                        ▼
            ┌──────────────────────────────┐
            │  Render Assessment Form      │
            │  (with custom or default)    │
            └──────────────────────────────┘

Pros:  ✅ Works offline, ✅ Per-product config, ✅ No backend needed
Cons:  ❌ Manual upload, ❌ No framework sharing
```

---

### Approach B: Backend-Driven Selection (Future)

```
┌──────────────────────────────────────────┐
│  Backend Database (PostgreSQL)           │
│  ├─ Framework (id, name, version)        │
│  ├─ FrameworkDomain (id, weight)         │
│  ├─ FrameworkGate (id, name)             │
│  └─ FrameworkQuestion (id, text)         │
└──────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────┐
│  Backend API Endpoints                   │
│  GET  /api/frameworks/                   │
│  GET  /api/frameworks/{id}               │
│  GET  /api/frameworks/{id}/structure     │
└──────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────┐
│  Product Admin Settings Page             │
│  ├─ Fetch framework list: /api/frameworks│
│  ├─ Dropdown: Select Framework           │
│  │  ├─ DORA Metrics Framework            │
│  │  ├─ DevOps Maturity MVP               │
│  │  ├─ CALMS Framework                   │
│  │  └─ Custom Organization Framework     │
│  │                                        │
│  ├─ Save selected: framework_id          │
│  └─ Store to: selected_framework key     │
└──────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────┐
│  SpiraApp Storage (Per Product)          │
│  selected_framework: {                   │
│    framework_id: "uuid",                 │
│    name: "DORA Metrics"                  │
│  }                                       │
└──────────────────────────────────────────┘
            │
            ▼
┌──────────────────────────────────────────┐
│  Dashboard Widget                        │
│  ├─ Load selected_framework.id           │
│  ├─ Fetch /api/frameworks/{id}/structure │
│  │  (using spiraAppManager.executeApi)   │
│  └─ Render with fetched framework        │
└──────────────────────────────────────────┘

Pros:  ✅ Centralized, ✅ Easy to add frameworks, ✅ Multi-org support
Cons:  ❌ Needs internet, ❌ More complex, ❌ Backend dependency
```

---

### Approach C: Hybrid (Recommended)

```
┌────────────────────────────────────────────────┐
│         Fallback Chain                         │
└────────────────────────────────────────────────┘

On widget init:

Step 1: Check local custom framework
        │
        ├─ Found & valid → USE IT (activeFramework = custom)
        │
        └─ Not found → Continue to Step 2

Step 2: Check for backend framework reference
        │
        ├─ Found selected_framework.id
        │  ├─ Fetch /api/frameworks/{id}/structure
        │  │  ├─ Success → USE IT (activeFramework = fetched)
        │  │  └─ Error → Continue to Step 3
        │  │
        │  └─ Not found → Continue to Step 3

Step 3: Fallback to hardcoded default
        │
        └─ USE DMM_QUESTIONS (activeFramework = null)


Result: Maximum flexibility with graceful degradation


┌────────────────────────────────────┐
│  Storage Keys (Both Can Exist)     │
├────────────────────────────────────┤
│ custom_framework: {...}            │  ← Local override (takes priority)
│ selected_framework: {framework_id} │  ← Backend reference (fallback)
└────────────────────────────────────┘


Benefits:
✅ Works offline with local uploads
✅ Centralized management when backend available
✅ Graceful fallback to default
✅ Admin can switch between modes
✅ No breaking changes (local upload still works)
```

---

## 7. Organization Structure for Multi-Tenant Assessment

```
┌─────────────────────────────────────────────────────┐
│    SPIRAPLAN INSTANCE (Single Organization)         │
└─────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
    Product A      Product B       Product C
    "Backend       "Frontend        "DevOps"
    Services"      Team"
        │               │               │
        ├─ Framework:    ├─ Framework:  ├─ Framework:
        │ "DevOps        │ "UI/UX"      │ "Platform
        │  Maturity"     │ "Assessment" │  Engineering"
        │                │              │
        ├─ Assessment    ├─ Assessment  ├─ Assessment
        │ History: 12    │ History: 8   │ History: 15
        │                │              │
        └─ Storage Key:  └─ Storage Key:└─ Storage Key:
          custom_         custom_        custom_
          framework       framework      framework


┌─────────────────────────────────────────────────────┐
│    MULTIPLE ORGANIZATIONS (Future)                  │
└─────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
    Org A:          Org B:           Org C:
    HealthTech      FinTech          E-Commerce
        │               │               │
        ├─ Framework:    ├─ Framework:  ├─ Framework:
        │ "Compliance    │ "Security    │ "Scalability
        │  & Quality"    │  & Risk"     │  & Performance"
        │                │              │
        └─ Products...   └─ Products... └─ Products...

Note: Current MVP only supports single org (via Spira)
      Per-product custom_framework key handles differentiation
      Future enhancement: org-level framework templates
```

---

## 8. State Machine: Widget Lifecycle

```
                    ┌─────────────┐
                    │   LOADING   │ (initDmmWidget called)
                    └──────┬──────┘
                           │
                           ▼
            ┌──────────────────────────────┐
            │  loadCustomFramework()       │
            │  (Check storage)             │
            └──────────────┬───────────────┘
                           │
            ┌──────────────┴──────────────┐
            │                             │
            ▼                             ▼
    ┌────────────────┐          ┌────────────────┐
    │  READY: NO     │          │  READY: YES    │
    │  CUSTOM FOUND  │          │  CUSTOM FOUND  │
    │                │          │                │
    │ Will use:      │          │ Will use:      │
    │ DMM_QUESTIONS  │          │ Custom JSON    │
    └────────┬───────┘          └────────┬───────┘
             │                           │
             └───────────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  SHOWING SUMMARY     │
                  │                      │
                  │ - Latest score (if)  │
                  │ - "Start" button     │
                  └──────────┬───────────┘
                             │
                    ┌────────┘
                    │ User clicks "Start Assessment"
                    │
                    ▼
        ┌───────────────────────────────┐
        │  SHOWING FORM                 │
        │                               │
        │ - All questions with options  │
        │ - Submit button               │
        │ - Cancel button               │
        └──────────┬────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
    ┌──────────────┐   ┌──────────────┐
    │  User clicks │   │  User clicks │
    │  Cancel      │   │  Submit      │
    └──────┬───────┘   └──────┬───────┘
           │                  │
           │                  ▼
           │          ┌──────────────────┐
           │          │  CALCULATING     │
           │          │  Scores          │
           │          └──────┬───────────┘
           │                 │
           │                 ▼
           │          ┌──────────────────┐
           │          │  SAVING RESULTS  │
           │          │  to storage      │
           │          └──────┬───────────┘
           │                 │
           │                 ▼
           │          ┌──────────────────┐
           │          │  SHOWING RESULTS │
           │          │                  │
           │          │ - Overall score  │
           │          │ - Level badge    │
           │          │ - Domain scores  │
           │          │ - Back button    │
           │          └──────┬───────────┘
           │                 │
           ▼                 ▼
        ┌──────────────────────────────┐
        │  Reload Summary              │
        │  (go back to SHOWING SUMMARY)│
        └──────────────────────────────┘
                     │
                     ▼
            ┌─────────────────────┐
            │  History now shows: │
            │  - 2 assessments    │
            │  - Latest score     │
            │  - Previous scores  │
            └─────────────────────┘
```

---

## 9. Error Handling Flow

```
┌──────────────────────────────────┐
│    STORAGE API ERROR             │
│    (storageGetProduct fails)      │
└──────────────────────────────────┘
            │
            ▼
    Error Callback Triggered
            │
            ├─ Expected on first run: "Key not found" 500
            │                         → Render empty state
            │
            ├─ Unexpected: Network error
            │              → Log to dmmLog()
            │              → Display generic message
            │              → Offer retry
            │
            └─ Invalid JSON stored: Parse error
                                   → Log to dmmLog()
                                   → Render empty state
                                   → Suggest admin fix



┌──────────────────────────────────┐
│    FORM VALIDATION ERROR         │
│    (User didn't answer all)      │
└──────────────────────────────────┘
            │
            ▼
    handleSubmit() checks: allAnswered
            │
            ├─ false: Show message "Please answer all questions"
            │         Disable submit button
            │         User can continue answering
            │
            └─ true: Continue to scoring



┌──────────────────────────────────┐
│    CUSTOM FRAMEWORK VALIDATION    │
│    ERROR (settings.js)            │
└──────────────────────────────────┘
            │
            ▼
    validateFramework() returns {valid: false, errors: [...]}
            │
            ├─ Show error list:
            │  ├─ "Missing framework name (meta.name)"
            │  ├─ "Domain 'X' has no questions"
            │  ├─ "Domain weights should sum to 1.0"
            │  └─ "Question 'Y' missing 'text'"
            │
            ├─ Highlight: Still show preview option
            │              (Admin can see what didn't pass)
            │
            └─ Action: Fix JSON file, re-upload



┌──────────────────────────────────┐
│    FRAMEWORK UPLOAD ERROR         │
│    (File not JSON)                │
└──────────────────────────────────┘
            │
            ▼
    processFile() checks: filename.endsWith('.json')
            │
            ├─ false: Show "Please select a JSON file (.json extension)"
            │
            └─ true: Attempt JSON.parse()
                     ├─ Success → Validate
                     └─ Error → Show "Invalid JSON file: [error message]"
```

---

## 10. Network & Offline Considerations

```
┌────────────────────────────────────────┐
│     APPROACH A: OFFLINE-CAPABLE        │
│     (Current MVP)                      │
└────────────────────────────────────────┘

            Internet Available
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
    ✅ Works                ✅ Works
    • Upload framework      • Take assessment
    • Save assessment       • View results
    • All normal ops        • Load history


            Internet NOT Available
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
    ✅ Works                ✅ Works
    • Take assessment       • View results
    • (cached framework)    • (cached history)
    • Offline scoring       • All features


Result: Full offline capability
        No backend required


┌────────────────────────────────────────┐
│     APPROACH B: BACKEND-DEPENDENT      │
│     (If implemented)                   │
└────────────────────────────────────────┘

            Internet Available
                    │
                    ▼
            ✅ All Features
            • Fetch frameworks
            • Dynamic selection
            • Real-time sync

            Internet NOT Available
                    │
                    ▼
            ⚠️  Degraded Mode
            • Use cached framework
            • Take assessment offline
            • Sync on reconnect

Mitigation: Cache framework on first load
            Implement service worker for offline


┌────────────────────────────────────────┐
│     APPROACH C: HYBRID (RECOMMENDED)   │
│     (Best of both)                     │
└────────────────────────────────────────┘

            Internet Available
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
    ✅ Full Features        ✅ Full Features
    • Upload local          • Fetch backend
    • Select backend        • Real-time sync
    • All options           • Admin control


            Internet NOT Available
                    │
                    ▼
            ✅ Graceful Fallback
            • Use cached local framework
            • Use cached backend framework
            • Fall back to default
            • Complete offline assessment

Result: Maximum flexibility + offline capability
```

---

This completes the architecture diagram suite. These diagrams show the complete flow of how assessments work, how data persists, and how different approaches could be implemented.

