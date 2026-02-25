# Research: Configurable Project-Specific Assessments in SpiraApp MVP

## Executive Summary

The SpiraApp MVP currently implements assessments as **embedded static JavaScript** with hardcoded questions. This document provides a detailed analysis of the current architecture and explores approaches to make assessments configurable and project-specific within SpiraApp's constraints.

**Key Finding**: SpiraApp is a **pure client-side widget framework** with significant limitations on customization. Assessments can be made project-specific, but it requires careful architecture to work within SpiraApp's storage and rendering constraints.

---

## 1. Current Assessment Code Location & Structure

### 1.1 SpiraApp-MVP Directory: `/home/jim/projects/devops-maturity-model/src/spiraapp-mvp/`

| File | Purpose | Size | Key Content |
|------|---------|------|-------------|
| **manifest.yaml** | SpiraApp configuration & metadata | 33 lines | App GUID, dashboard widget registration, storage keys |
| **widget.js** | Main application logic (IIFE wrapped) | 988 lines | Questions, templates, scoring, storage APIs, state management |
| **settings.js** | Product admin settings page | 603 lines | Custom framework upload/validation/management UI |
| **settings.css** | Settings page styling | ~80 lines | Form and upload area styles |
| **assessment-template.json** | Template for custom frameworks | 60 lines | JSON schema for custom assessments |
| **widget.css** | Widget styling (embedded in widget.js) | ~100 lines | Dashboard widget appearance |
| **README.md** | Build & deployment guide | 36 lines | Instructions for packaging and installation |

### 1.2 How Assessments Are Currently Embedded

```javascript
// widget.js structure (lines 92-308)
const DMM_QUESTIONS = [
    { id: "Q1", domain: "domain1", text: "...", options: [...] },
    { id: "Q2", domain: "domain1", text: "...", options: [...] },
    // ... 20 total questions across 3 domains
];

const DOMAIN_WEIGHTS = {
    "domain1": 0.35,  // Source Control
    "domain2": 0.30,  // Security
    "domain3": 0.35   // CI/CD
};
```

**Assessment Flow**:
1. Widget loads on SpiraApp dashboard widget
2. `initDmmWidget()` checks for custom framework in storage (line 423)
3. If custom framework exists → use that; else → use DMM_QUESTIONS
4. Render form with active questions
5. Collect responses → Calculate scores → Save to storage

### 1.3 Data Source & Loading Pattern

```
Custom Framework (SpiraApp Storage)
    ↓
    [loadCustomFramework() - line 429]
    ↓
activeFramework variable (JSON object)
    ↓
    [renderAssessmentForm() - line 631 uses activeFramework.domains]
    ↓
Default DMM_QUESTIONS (fallback)
```

**Current Implementation**:
- **Line 642-660**: If `activeFramework` exists, iterate through custom domains
- **Line 662-680**: Otherwise, build domains from hardcoded `DMM_QUESTIONS` array
- **Line 719-736**: Helper `getActiveQuestions()` returns active set (custom or default)

---

## 2. DevOps Maturity Model Implementation (Backend)

### 2.1 Backend Framework Structure

Located: `/home/jim/projects/devops-maturity-model/backend/app/`

**Database Models** (`models.py`, lines 77-148):

```
Framework (name, description, version)
    ├── FrameworkDomain (name, weight, order)
    │   ├── FrameworkGate (name, description, order)
    │   │   └── FrameworkQuestion (text, guidance, order)
    │   └── DomainScore (score, percentage)
    └── Assessment (team_name, status, framework_id)
        ├── GateResponse (question_id, score)
        └── DomainScore
```

### 2.2 Current Framework Implementations

**1. DevOps Maturity MVP** (`seed_frameworks.py`):
- **5 Domains** with weights: 0.15, 0.25, 0.25, 0.20, 0.15
- **Domain Names**: Source Control, Security, CI/CD, Infrastructure, Observability
- **Question Structure**: Gates → Questions (2 questions per gate per domain)
- **Storage**: PostgreSQL via SQLAlchemy models

**2. DORA Metrics Framework** (`seed_dora_framework.py`):
- **5 Domains**: Deployment Frequency (25%), Lead Time (25%), Change Failure Rate (20%), MTTR (20%), Enabling Practices (10%)
- **25 Questions Total**: 5+5+4+5+6 across domains
- **Scoring**: 0-5 scale with detailed guidance for each level
- **Estimated Duration**: 75 minutes

**3. CALMS Framework** (`seed_calms_framework.py`):
- Referenced but not fully explored in provided files

### 2.3 Backend API for Frameworks

**Endpoint**: `/api/frameworks/` (`api/frameworks.py`):

```python
GET /frameworks/                    # List all frameworks
GET /frameworks/{framework_id}       # Get framework details
GET /frameworks/{framework_id}/structure  # Get full hierarchy (domains→gates→questions)
```

**Response Structure**:
```json
{
  "framework": {"id": "uuid", "name": "...", "version": "..."},
  "domains": [
    {
      "id": "uuid",
      "name": "...",
      "weight": 0.25,
      "gates": [
        {
          "id": "uuid",
          "name": "...",
          "questions": [
            {"id": "uuid", "text": "...", "guidance": "..."}
          ]
        }
      ]
    }
  ]
}
```

---

## 3. SpiraApp Capabilities & Limitations

### 3.1 Storage Capabilities (From `manifest.yaml` & lessons-learned)

**Storage Configuration**:
```yaml
storage:
  - key: custom_framework
    value: ""
    isSecure: false
```

**SpiraApp Manager Storage Functions** (6 critical parameters required):

| Function | Signature | Use Case |
|----------|-----------|----------|
| `storageGetProduct(appGuid, appName, key, productId, success, error)` | 6-param | Fetch per-product data |
| `storageUpdateProduct(appGuid, appName, key, value, productId, success, error)` | 6-param | Update existing data |
| `storageInsertProduct(appGuid, appName, key, value, productId, isSecure, success, error)` | 8-param | Insert new data |

**Lessons Learned** (`spiraapp-lessons-learned.md`):
1. **Critical**: Must include `pluginName` as second parameter (5-param signature causes logout)
2. **Container ID**: GUID in storage key is **lowercase** (case-sensitivity issue resolved via lookup)
3. **Scope**: IIFE wrapping prevents variable collision on dashboard refresh
4. **Expected Behavior**: "Key not found" 500 error on first run is expected; handle gracefully in error callback

### 3.2 Data Constraints & Design Patterns

**What SpiraApp CAN Do**:
- ✅ Store arbitrary JSON blobs per product (key/value pairs)
- ✅ Access product/user IDs via `spiraAppManager.projectId`, `userId`
- ✅ Render Mustache templates client-side (built-in to SpiraApp)
- ✅ Make internal API calls to Spira via `spiraAppManager.executeApi()`
- ✅ Store multiple frameworks per product (separate keys)
- ✅ Validate JSON before saving (done in settings.js)

**What SpiraApp CANNOT Do**:
- ❌ Direct backend API calls (CORS restrictions - must use `executeRest`)
- ❌ External imports or dependencies (no npm modules, no CDN links)
- ❌ System-level settings for SpiraApp configuration
- ❌ Direct database access
- ❌ WebSockets or WebAssembly
- ❌ Multiple CSS/JS files per page (one JS, one CSS per page)

**Critical Design Pattern**:
```
SpiraApp ← JSON Storage ← Custom Framework JSON
          ↓ (per-product)
          [no external API calls]
```

### 3.3 Configuration Hierarchy in SpiraApp

**System Admin Level** (pageId 21: SpiraAppProductAdmin):
- Can configure settings for the entire app
- Example: Enable/disable features

**Product Admin Level** (pageId 21: accessed per-product):
- Can upload custom framework JSON for each product
- Storage is per-product, per-key
- settings.js handles UI for this (currently using Product Admin page)

**User Level** (Dashboard widget):
- Runs assessment using whatever framework is configured
- No per-user configuration

---

## 4. Frontend Integration (Current State)

### 4.1 Frontend Code Location

**Frontend**: `/home/jim/projects/devops-maturity-model/frontend/` (React/TypeScript)
- Separate from SpiraApp MVP
- Uses backend APIs for full-featured platform
- **Not** used by SpiraApp widget (which is pure client-side JS)

### 4.2 Data Flow Architecture

```
┌─────────────────────────────────────────────┐
│         SpiraApp Environment                 │
│  (SpiraPlan, SpiraTeam, or SpiraTest)       │
├─────────────────────────────────────────────┤
│                                               │
│  Dashboard Widget (widget.js)                │
│  ├─ activeFramework (loaded from storage)   │
│  ├─ DMM_QUESTIONS (hardcoded fallback)      │
│  ├─ Render form (Mustache templates)        │
│  ├─ Collect responses → Calculate scores    │
│  └─ Save history to SpiraApp Storage        │
│                                               │
│  Product Admin Settings (settings.js)       │
│  ├─ Upload custom framework JSON            │
│  ├─ Validate against schema                 │
│  └─ Save to custom_framework key            │
│                                               │
│  SpiraApp Storage (per-product key/value)   │
│  ├─ dmm_assessments_history → JSON array    │
│  └─ custom_framework → JSON object          │
│                                               │
└─────────────────────────────────────────────┘
         ↓ (separate from widget)
┌─────────────────────────────────────────────┐
│   FastAPI Backend (Optional)                │
│   ├─ /frameworks → List frameworks          │
│   ├─ /assessments → Store assessments       │
│   └─ Database models (if needed)            │
└─────────────────────────────────────────────┘
```

**Key Insight**: SpiraApp widget is **fully self-contained**. It doesn't call the backend API. The backend is separate for a full-featured web platform.

---

## 5. Current Framework Import Pattern (Backend)

### 5.1 How Frameworks Are Managed in Backend

**Database Seeding Scripts** (`backend/app/scripts/`):

1. **seed_frameworks.py**:
   - Creates Framework → Domains → Gates → Questions
   - Uses `GATES_DEFINITION` from `core/gates.py`
   - Populates all relationships
   - One-time seed on app startup

2. **seed_dora_framework.py**:
   - Standalone, creates DORA-specific framework
   - Detailed questions with guidance for each level

3. **seed_calms_framework.py**:
   - CALMS assessment framework

**Import Pattern**:
```python
from app.core.gates import GATES_DEFINITION

# gates.py defines:
GATES_DEFINITION = {
    "gate_1_1": {
        "name": "Version Control & Branching",
        "domain": DomainType.DOMAIN1,
        "questions": [{id, text, guidance}, ...]
    },
    ...
}
```

**Backend Limitation**: Framework definitions are **hardcoded in Python enums/dicts**, not dynamic. To add a new framework, you must:
1. Add questions to `GATES_DEFINITION` in `gates.py`
2. Run seeding script to populate database

### 5.2 Backend API Response Format

Backend returns frameworks via REST API with full hierarchy:

```json
{
  "framework": {
    "id": "...",
    "name": "DORA Metrics Framework",
    "description": "...",
    "version": "1.0"
  },
  "domains": [
    {
      "id": "...",
      "name": "Deployment Frequency",
      "weight": 0.25,
      "order": 1,
      "gates": [
        {
          "id": "...",
          "name": "Deployment Frequency Assessment",
          "description": "...",
          "order": 1,
          "questions": [
            {
              "id": "...",
              "text": "How often does your team deploy code to production?",
              "guidance": "Score 0 = Unknown... Score 5 = Elite performer",
              "order": 1
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 6. Assessment Template & Schema Validation

### 6.1 Custom Framework JSON Schema

**File**: `assessment-template.json` (lines 1-60)

```json
{
  "meta": {
    "name": "My Custom Assessment",
    "description": "Description of your assessment purpose",
    "version": "1.0"
  },
  "domains": [
    {
      "id": "domain1",
      "name": "First Domain",
      "description": "What this domain measures",
      "weight": 0.35,
      "order": 1,
      "questions": [
        {
          "id": "Q1",
          "text": "Your first question here?",
          "guidance": "Score 0 = ... | Score 5 = ...",
          "order": 1
        }
      ]
    }
  ]
}
```

### 6.2 Validation Rules (settings.js, lines 362-419)

**Enforced Validation**:
```javascript
✓ meta.name (required, non-empty)
✓ domains (array, non-empty)
✓ Each domain: id, name, weight (number), questions (non-empty array)
✓ Each question: id, text (both required)
✓ Weight sum should be ~1.0 (warns if off by >0.01)
```

**Error Messages**:
- "Missing framework name"
- "At least one domain is required"
- "Domain weights should sum to 1.0"

### 6.3 Question Options/Scoring

**Default Options** (widget.js, lines 707-716):
```javascript
if no options provided in custom framework:
  [
    { score: 0, text: "Level 0 - None/Unknown" },
    { score: 1, text: "Level 1 - Initial" },
    { score: 2, text: "Level 2 - Developing" },
    { score: 3, text: "Level 3 - Defined" },
    { score: 4, text: "Level 4 - Managed" },
    { score: 5, text: "Level 5 - Optimizing" }
  ]
```

**Current Score Range**: 0-5 per question (hardcoded in scoring logic, line 848: `domainTotals[r.domain].max += 5`)

---

## 7. Scoring & Results Calculation

### 7.1 Scoring Algorithm (widget.js, lines 825-893)

**Process**:
1. **Collect Responses**: For each question, get selected score (0-5)
2. **Domain Totals**: Sum scores per domain, divide by max possible (5 × question count)
3. **Overall Score**: Weighted average of domain scores using `DOMAIN_WEIGHTS`
4. **Maturity Level**: Map 0-100% to 5 levels (Initial, Developing, Defined, Managed, Optimizing)

**Key Code**:
```javascript
// Domain percentage = (current_score / max_possible) * 100
domainScores[domainId] = (total.current / total.max) * 100;

// Overall = weighted sum
overall += score * weights[domainId];

// Level mapping
if (overall > 20)  → Level 2 (Developing)
if (overall > 40)  → Level 3 (Defined)
if (overall > 60)  → Level 4 (Managed)
if (overall > 80)  → Level 5 (Optimizing)
```

### 7.2 Results Storage

**Saved Structure** (lines 876-889):
```javascript
{
  date: "ISO timestamp",
  overallScore: 72.45,
  maturityLevel: "Managed",
  maturityLevelInt: 4,
  domainScores: { domain1: 75, domain2: 68, domain3: 74 },
  responses: { Q1: {domain: "domain1", score: 4}, ... },
  frameworkName: "Custom or Default"
}
```

**Storage Key**: `dmm_assessments_history` (per product, appends to array)

---

## 8. Potential Approaches for Project-Specific Assessments

### 8.1 Approach A: Custom Framework Upload (Current MVP - Partially Implemented)

**Status**: ✅ Partially implemented in widget.js and settings.js

**How It Works**:
1. Product admin uploads JSON file via settings page
2. `validateFramework()` checks structure (settings.js:362)
3. Save to `custom_framework` storage key (per product)
4. Widget loads it on init and uses instead of DMM_QUESTIONS

**Implementation Status**:
- ✅ Upload UI (settings.js: file input, drag-drop)
- ✅ Validation logic (settings.js: 362-419)
- ✅ Storage (manifest.yaml: custom_framework key)
- ✅ Widget loading (widget.js: 429-463)
- ✅ Form rendering from custom (widget.js: 642-660)
- ✅ Scoring with custom weights (widget.js: 739-748)

**Limitations**:
- ❌ Cannot dynamically load from backend API (no executeRest in widget loading)
- ❌ Manual upload per product (not ideal for multi-product setups)
- ❌ No version control/rollback of frameworks

**Pros**:
- Works entirely within SpiraApp constraints
- Per-product configuration
- No backend dependency
- Product admins can manage their own assessments

**Cons**:
- Manual JSON editing/uploading required
- No UI for question editing (must write JSON)
- No framework sharing across products (must re-upload)

---

### 8.2 Approach B: Backend-Driven Framework Selection (Hybrid)

**Concept**: Extend SpiraApp to fetch framework from backend API

**Architecture**:
```
SpiraApp Settings Page
  ├─ Add dropdown: "Select Framework"
  ├─ Fetch /api/frameworks → List all
  ├─ On selection: Save framework_id to custom_framework key
  └─ Store as: { framework_id: "uuid", selected_at: "..." }

SpiraApp Dashboard Widget
  ├─ Load custom_framework storage → Get framework_id
  ├─ Fetch /api/frameworks/{id}/structure → Get full hierarchy
  ├─ Render form & run assessment
  └─ Save results (locally only)
```

**Implementation Requirements**:
1. Modify settings.js to fetch frameworks from `/api/frameworks/`
2. Modify widget.js to fetch framework structure on init
3. Add Product Admin setting: "Select Framework" (dropdown, settingTypeId: 3)
4. Handle network errors gracefully (fallback to DMM_QUESTIONS)

**Pros**:
- Centralized framework management on backend
- Support multiple frameworks without re-uploading
- Easy to add new frameworks (just seed database)
- Supports multiple projects/organizations
- Aligns with backend architecture

**Cons**:
- Requires backend API always available (internet dependency)
- More complex deployment
- Frontend → Backend coupling
- CORS/security considerations for internal API

---

### 8.3 Approach C: Hybrid: Local Override + Backend Default

**Concept**: Best of both worlds

**Logic Flow**:
```
On widget init:
  1. Check for custom_framework in storage (local override)
     - If found & valid → use it
     - Else → continue to step 2
  2. Check for framework_id in storage (backend reference)
     - If found → fetch from backend API
     - Else → continue to step 3
  3. Use hardcoded DMM_QUESTIONS as final fallback
```

**Storage Structure**:
```javascript
// Option 1: Local override
custom_framework_override: { /* full framework JSON */ }

// Option 2: Backend reference
selected_framework: {
  framework_id: "uuid",
  name: "DORA Metrics",
  loaded_at: "ISO timestamp"
}
```

**Implementation**:
```javascript
// widget.js loadCustomFramework() modified:
1. Try to get custom_framework (current)
2. If not → Try to get selected_framework.id
3. If yes → Call spiraAppManager.executeApi() to fetch
4. If error/not found → Use DMM_QUESTIONS
```

**Pros**:
- Maximum flexibility
- Supports both local uploads and backend-driven selection
- Graceful fallback chain
- Works without backend if needed

**Cons**:
- More complex logic
- Multiple code paths to test
- Potential confusion about which framework is active

---

### 8.4 Approach D: Organization-Level Framework Configuration

**Concept**: Set framework at organization level (via system admin settings)

**Requirements**:
- Add system-level setting: "Default Assessment Framework"
- Define mapping: Organization → Framework
- Widget loads framework based on current org

**Implementation**:
```yaml
# manifest.yaml
settings:
  - settingTypeId: 3  # Custom Property Dropdown
    name: defaultFramework
    caption: Default Assessment Framework
    artifactTypeId: 1  # Organization/Product artifact
```

```javascript
// widget.js
const orgId = /* derive from spiraAppManager */;
const frameworkSetting = spiraAppManager.settings.defaultFramework;
```

**Limitations**:
- SpiraApp doesn't have built-in "organization" concept in settings
- Would require custom mapping table in backend
- More complex than per-product approach

---

## 9. Data Flow Architecture - Project-Specific Scenarios

### 9.1 Scenario 1: Single Organization, Multiple Products (Different Assessments per Product)

```
Organization
├─ Product A (uses Framework: "Security Focused")
│  └─ Storage: custom_framework = {domains: [...], meta: {name: "Security"}}
├─ Product B (uses Framework: "DevOps Maturity")
│  └─ Storage: custom_framework = {domains: [...], meta: {name: "DevOps"}}
└─ Product C (uses Default Framework)
   └─ Storage: custom_framework = null → falls back to DMM_QUESTIONS
```

**Implementation**: Approach A or C (local storage per product)

---

### 9.2 Scenario 2: Multiple Organizations, Centralized Framework Library

```
Backend Database (PostgreSQL)
├─ Organization A
│  ├─ Framework: "Platform Engineering" (shared by all A's products)
│  └─ Framework: "Security Compliance"
├─ Organization B
│  ├─ Framework: "Speed to Market"
│  └─ Framework: "Operational Excellence"
└─ Standard Frameworks (shared across all orgs)
   ├─ "DORA Metrics"
   ├─ "DevOps Maturity"
   └─ "CALMS"

SpiraApp Widget
├─ Load Organization ID (from Spira context)
├─ Fetch available frameworks for org
├─ Product admin selects framework
└─ Widget uses selected framework
```

**Implementation**: Approach B (backend-driven)

---

### 9.3 Scenario 3: Template-Based Frameworks (Org + Product Customization)

```
Backend
├─ Org-level Framework Template (base)
│  └─ Can be customized per product
└─ Product-level Overrides
   └─ Custom questions, weights, domains

Widget Init
├─ Load org template
├─ Apply product overrides
└─ Render combined assessment
```

**Implementation**: Approach B + custom merge logic

---

## 10. Technical Considerations & Constraints

### 10.1 SpiraApp API Limitations

| Capability | Status | Impact |
|-----------|--------|--------|
| Client-side storage (key/value) | ✅ Supported | Can store frameworks |
| JSON blob storage (up to limit) | ✅ Supported | Frameworks can be large |
| Internal Spira API calls | ✅ Supported | Can call REST endpoints |
| External API calls | ⚠️ Limited (via executeRest) | Must go through proxy |
| File uploads | ✅ Supported | Can accept JSON files |
| Settings per product | ✅ Supported | Can store framework selection |
| Settings per user | ❌ Not supported | Cannot customize per assessor |
| Multiple code files | ❌ Limited | Only 1 JS + 1 CSS per page |
| External libraries | ❌ Not allowed | No npm modules, no CDN |

### 10.2 Data Size Constraints

**SpiraApp Storage Limits** (not explicitly documented, but safe limits):
- **Per key**: Assume <1MB (typical for JSON objects)
- **Per product**: Assume <10MB total
- **Assessment history**: Array can grow with repeated assessments

**Optimization**: Could compress history or archive old assessments

### 10.3 Network Considerations

**No Internet Required** (with Approach A):
- Framework upload happens once during setup
- Widget works entirely offline
- Assessments saved locally

**Internet Required** (with Approach B):
- Widget must reach backend on load
- Need fallback mechanism for offline
- Consider caching framework for offline mode

### 10.4 Security Considerations

**Current Implementation**:
- ✅ No external API keys exposed
- ✅ Storage is per-product (org isolation)
- ✅ File upload validated before saving
- ✅ No direct database access

**Risks to Mitigate**:
- ❌ File upload could contain malicious JSON (mitigate: strict validation)
- ❌ Backend API could be compromised (mitigate: use internal API, not external)
- ❌ Product admins could break framework (mitigate: validation, versioning)

---

## 11. Scoring Logic for Custom Frameworks

### 11.1 Current Assumptions

**Assumption 1: Score Range**
- All questions use 0-5 scale
- Hardcoded: `domainTotals[r.domain].max += 5` (line 848)

**Problem**: Custom framework might want 0-3, 0-4, or 0-10 scale

**Solution**: Add optional `scoreRange` to custom framework metadata:
```json
{
  "meta": {
    "name": "Custom",
    "scoreRange": 5  // or 3, 4, 10, etc.
  },
  "domains": [...]
}
```

Modify scoring:
```javascript
const maxScore = activeFramework?.meta?.scoreRange || 5;
domainTotals[r.domain].max += maxScore;
```

### 11.2 Weighted Domains

**Current**: Uses framework-defined weights (already works)
```javascript
overall += score * weights[domainId];  // Line 863
```

**Flexibility**: Custom framework can set any weights that sum to 1.0

### 11.3 Level Thresholds

**Current**: Hardcoded thresholds (lines 869-872):
```javascript
if (overall > 20)  → Level 2
if (overall > 40)  → Level 3
if (overall > 60)  → Level 4
if (overall > 80)  → Level 5
```

**Problem**: Custom framework might want different thresholds (e.g., 0-25-50-75-100)

**Solution**: Add optional `levelThresholds` to metadata:
```json
{
  "meta": {
    "levelThresholds": [20, 40, 60, 80],
    "levelNames": ["Initial", "Developing", "Defined", "Managed", "Optimizing"]
  }
}
```

---

## 12. UI Considerations for Project-Specific Assessments

### 12.1 Settings Page Enhancements

**Current Settings Page** (settings.js):
- Upload JSON file
- Preview & validate
- Save/remove framework

**Proposed Enhancements**:

```html
<!-- Option 1: Manual Upload + Backend Selection -->
<div class="framework-selection">
  <h4>Assessment Framework</h4>

  <!-- Option A: Select from backend -->
  <div>
    <label>Available Frameworks:</label>
    <select id="framework-selector">
      <option value="">-- Use Default --</option>
      <option value="uuid-1">DORA Metrics Framework</option>
      <option value="uuid-2">DevOps Maturity Model</option>
      <option value="uuid-3">CALMS Framework</option>
    </select>
  </div>

  <!-- Option B: Upload custom -->
  <div>
    <label>Or Upload Custom Framework:</label>
    <input type="file" id="dmm-file-input" accept=".json" />
  </div>
</div>
```

### 12.2 Dashboard Widget Enhancements

**Current Widget**:
- Shows latest score & level
- "Start Assessment" button
- Shows assessment form

**Proposed Enhancements**:
```html
<!-- Show which framework is active -->
<p>Framework: <strong>{{frameworkName}}</strong></p>

<!-- Allow switching frameworks (if multiple available) -->
<button id="btn-change-framework">Change Framework</button>

<!-- Show framework description on hover -->
<span title="{{frameworkDescription}}">ℹ</span>
```

---

## 13. Implementation Roadmap

### Phase 1: Validate Current MVP (Week 1)
- [ ] Test custom framework upload with sample JSON
- [ ] Test framework switching on dashboard
- [ ] Verify scoring calculations work with custom weights
- [ ] Test offline functionality (no backend required)

### Phase 2: Enhance Validation (Week 2-3)
- [ ] Improve error messages for invalid frameworks
- [ ] Add dry-run/preview before saving
- [ ] Add import/export of completed assessments
- [ ] Support custom score ranges (0-3, 0-4, 0-10)

### Phase 3: Backend Integration (Week 4-5)
- [ ] Add product-level setting: "Select Framework" (dropdown)
- [ ] Modify widget.js to fetch from backend if available
- [ ] Implement graceful fallback chain
- [ ] Add framework caching for offline mode

### Phase 4: Advanced Features (Week 6-8)
- [ ] Organization-level framework templates
- [ ] Product-level customization (override questions)
- [ ] Assessment history export (CSV/PDF)
- [ ] Comparison dashboard (across projects)
- [ ] Framework versioning & rollback

---

## 14. Example: Creating a Project-Specific Assessment

### 14.1 Scenario: "Mobile App Development" Framework

**File**: `mobile-app-framework.json`

```json
{
  "meta": {
    "name": "Mobile App Development Maturity",
    "description": "Assessment for iOS/Android development practices",
    "version": "1.0",
    "scoreRange": 5,
    "levelThresholds": [20, 40, 60, 80],
    "levelNames": ["Initial", "Developing", "Defined", "Managed", "Optimizing"]
  },
  "domains": [
    {
      "id": "mobile-development",
      "name": "Mobile Development Practices",
      "description": "Code quality, testing, and development workflows",
      "weight": 0.40,
      "order": 1,
      "questions": [
        {
          "id": "Q1",
          "text": "What percentage of your code is covered by automated tests?",
          "guidance": "Score 0 = No automated tests | Score 3 = 50-70% coverage | Score 5 = 90%+ coverage with TDD",
          "order": 1
        },
        {
          "id": "Q2",
          "text": "How are you handling cross-platform code sharing?",
          "guidance": "Score 0 = Duplicate code | Score 3 = Shared libraries | Score 5 = Monorepo with optimization",
          "order": 2
        }
      ]
    },
    {
      "id": "mobile-deployment",
      "name": "App Store Deployment & Release",
      "description": "Release process, automation, and monitoring",
      "weight": 0.35,
      "order": 2,
      "questions": [
        {
          "id": "Q3",
          "text": "How automated is your app store deployment process?",
          "guidance": "Score 0 = Manual uploads | Score 3 = Partially automated | Score 5 = Fully automated",
          "order": 1
        },
        {
          "id": "Q4",
          "text": "How quickly can you roll back a problematic app release?",
          "guidance": "Score 0 = Cannot rollback | Score 3 = Manual rollback in hours | Score 5 = Automatic rollback in minutes",
          "order": 2
        }
      ]
    },
    {
      "id": "mobile-analytics",
      "name": "Analytics & User Monitoring",
      "description": "Observability and performance monitoring",
      "weight": 0.25,
      "order": 3,
      "questions": [
        {
          "id": "Q5",
          "text": "What mobile analytics and crash reporting do you have in place?",
          "guidance": "Score 0 = No monitoring | Score 3 = Basic analytics | Score 5 = Comprehensive with real user monitoring",
          "order": 1
        }
      ]
    }
  ]
}
```

**Upload Process**:
1. Product Admin goes to Product Settings → SpiraApps → DevOps Maturity
2. Click "Upload Custom Framework"
3. Select `mobile-app-framework.json`
4. Preview shows: "3 domains, 5 questions"
5. Click "Save Framework"
6. Widget now displays "Mobile App Development Maturity" assessment

---

## 15. Comparison: SpiraApp vs Backend Platform

### 15.1 Assessment Distribution

| Feature | SpiraApp MVP | Backend Platform |
|---------|--------------|------------------|
| **Deployment** | Within Spira (single package) | Standalone web app |
| **Framework Management** | Per-product JSON upload | Centralized database |
| **Storage** | SpiraApp storage (per-product key) | PostgreSQL database |
| **Offline Capability** | ✅ Yes (fully client-side) | ❌ No (requires internet) |
| **Multi-tenancy** | ✅ Product-level | ✅ Organization-level |
| **Customization** | ✅ Per-product JSON | ✅ Database-driven |
| **Ease of Setup** | ⭐⭐⭐⭐ (Just upload) | ⭐⭐⭐ (More complex) |

### 15.2 When to Use Each

**Use SpiraApp MVP When**:
- ✅ Assessment is Spira-centric (track in product)
- ✅ Need simple, offline-capable tool
- ✅ Multiple products with different assessments
- ✅ Low deployment complexity desired
- ✅ Quick project assessment needed

**Use Backend Platform When**:
- ✅ Need advanced analytics/reporting
- ✅ Organization-wide framework management
- ✅ Integration with external systems
- ✅ Complex scoring logic needed
- ✅ Historical trend analysis required

---

## 16. Recommendations

### 16.1 Short Term (MVP Enhancement)

1. **Complete Approach A Implementation**:
   - ✅ Already mostly done
   - Add form UI for editing custom frameworks (optional JSON fields)
   - Add framework import/export for backup & sharing
   - Document JSON schema clearly

2. **Enhance Validation**:
   - Better error messages for invalid JSON
   - Preview questions before save
   - Dry-run with sample scores

3. **Add Documentation**:
   - Guide for creating custom frameworks
   - Examples for common use cases
   - Troubleshooting guide

### 16.2 Medium Term (6 months)

1. **Implement Approach C (Hybrid)**:
   - Keep local upload working
   - Add optional backend framework selection
   - Implement graceful fallback chain
   - Add offline caching

2. **Backend-Driven Framework Library**:
   - Admin UI for creating frameworks (without coding)
   - Share frameworks across products
   - Version control for frameworks
   - Rollback capability

3. **Enhanced Reporting**:
   - Export assessment results
   - Compare assessments over time
   - Per-domain trend visualization

### 16.3 Long Term (12+ months)

1. **Multi-tenant Framework Management**:
   - Organization-level framework templates
   - Per-product customization
   - Role-based access control

2. **Advanced Features**:
   - AI-powered question suggestions
   - Benchmarking against industry standards
   - Automated improvement recommendations
   - Integration with external tools (GitHub, GitLab, Jenkins)

3. **Mobile App**:
   - Native app for assessments
   - Offline-first architecture
   - Push notifications for review cycles

---

## 17. Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Custom JSON is malformed** | Assessment breaks | Strict validation before save, better error UI |
| **Framework file is large** | Storage quota exceeded | Compress, archive old assessments, set size limit |
| **Backend API unavailable** | Widget cannot load framework | Fallback to DMM_QUESTIONS, cache on client |
| **Weights don't sum to 1.0** | Scoring is incorrect | Warn user, optionally auto-normalize |
| **Product admin breaks framework** | All assessments fail | Version control, rollback mechanism |
| **Question text too long** | Display issues | Truncate in form, show tooltip, set max length |
| **User confusion (which framework?)** | Wrong assessment taken | Show framework name prominently, add description |

---

## 18. Appendix: File Locations & References

### 18.1 Key Files

```
/home/jim/projects/devops-maturity-model/
├── src/spiraapp-mvp/
│   ├── manifest.yaml                 (Config: storage keys, dashboard widget)
│   ├── widget.js                     (Main: assessment logic, scoring)
│   ├── settings.js                   (Settings: framework upload/validation)
│   ├── assessment-template.json      (Template: custom framework schema)
│   └── README.md                     (Instructions)
├── backend/app/
│   ├── models.py                     (DB: Framework, FrameworkDomain, etc.)
│   ├── api/
│   │   ├── frameworks.py             (Endpoints: /frameworks/)
│   │   └── assessments.py            (Endpoints: /assessments/)
│   ├── scripts/
│   │   ├── seed_frameworks.py        (Seed: DevOps MVP)
│   │   ├── seed_dora_framework.py    (Seed: DORA Metrics)
│   │   └── seed_calms_framework.py   (Seed: CALMS)
│   └── core/
│       └── gates.py                  (Questions: GATES_DEFINITION)
├── docs/
│   ├── spiraapp-lessons-learned.md   (Gotchas: API, storage, GUID)
│   ├── SpiraApp_Information/
│   │   ├── SpiraApps-Overview.md     (Architecture: design patterns)
│   │   ├── SpiraApps-Manifest.md     (Config: all manifest options)
│   │   ├── SpiraApps-Reference.md    (Reference: IDs, types, limits)
│   │   ├── SpiraApps-Manager.md      (API: spiraAppManager functions)
│   │   └── SpiraRestAPI-v7.0-OpenAPI.json (REST: Spira API schema)
```

### 18.2 Key Code References

| Functionality | File | Lines |
|---------------|------|-------|
| Question hardcoding | widget.js | 92-308 |
| Custom framework load | widget.js | 429-463 |
| Form rendering | widget.js | 631-704 |
| Scoring calculation | widget.js | 825-893 |
| Settings page render | settings.js | 167-211 |
| Framework validation | settings.js | 362-419 |
| Storage API calls | widget.js | 535-561 |
| Manifest storage key | manifest.yaml | 22-25 |

### 18.3 Related Documentation

- SpiraApp Manager API: `docs/SpiraApp_Information/SpiraApps-Manager.md`
- Framework Reference: `backend/app/core/gates.py`
- Database Models: `backend/app/models.py`
- API Endpoints: `backend/app/api/frameworks.py`

---

## Conclusion

The SpiraApp MVP currently has the **foundation for configurable project-specific assessments** (Approach A), with custom framework upload and validation already implemented. The architecture is sound, but several enhancements can be made:

1. **Short term**: Complete Approach A with better UI and documentation
2. **Medium term**: Implement Approach C (hybrid local + backend)
3. **Long term**: Build multi-tenant framework library with advanced features

The key constraint is that SpiraApp is **pure client-side**, which simplifies deployment but requires frameworks to be either:
- Uploaded as JSON (Approach A), or
- Fetched from backend once and cached (Approach B/C)

All approaches are feasible within SpiraApp's current capabilities, with Approach A requiring no backend and Approaches B/C offering more centralized management at the cost of additional complexity.

