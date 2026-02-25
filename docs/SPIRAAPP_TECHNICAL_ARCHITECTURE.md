# SpiraApp Technical Architecture Guide
## DevOps Maturity Assessment Widget

This document explains how the DevOps Maturity Assessment SpiraApp works, including data structures, storage mechanisms, and the complete assessment flow. It uses official SpiraApp terminology from Inflectra's documentation.

---

## Table of Contents

1. [SpiraApp Overview](#1-spiraapp-overview)
2. [Architecture Components](#2-architecture-components)
3. [Data Structures](#3-data-structures)
4. [Storage Mechanisms](#4-storage-mechanisms)
5. [Assessment Flow](#5-assessment-flow)
6. [Scoring Logic](#6-scoring-logic)
7. [Survey Implementation Guide](#7-survey-implementation-guide)
8. [API Reference](#8-api-reference)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. SpiraApp Overview

### What is a SpiraApp?

According to Inflectra's documentation, a SpiraApp is:

- A small piece of **client-side code** (JavaScript, CSS, HTML)
- Runs on specific pages in Spira (dashboards, list pages, details pages)
- Configurable at **system** or **product** level by admins
- Portable and secure `.spiraapp` files stored in the Spira database
- Uses dedicated helper classes (`spiraAppManager`) to interact with Spira

### This SpiraApp's Purpose

The **DevOps Maturity Assessment** SpiraApp provides:

| Feature | Description |
|---------|-------------|
| **Dashboard Widget** | Displays on Product Home Page (Dashboard Type ID: 1) |
| **Settings Page** | Configurable via Product Admin > SpiraApp Settings (Page ID: 21) |
| **Custom Frameworks** | Upload custom assessment frameworks (CALMS, DORA, etc.) |
| **Assessment History** | Stores multiple assessment results per product |

### Key Identifiers

```javascript
const APP_GUID = "4B8D9721-6A99-4786-903D-9346739A0673";  // Unique SpiraApp identifier
const APP_NAME = "DevOpsMaturityAssessment";              // Must match manifest.yaml name
```

These identifiers are used throughout the SpiraApp for:
- Accessing `SpiraAppSettings[APP_GUID]` for configuration
- Scoping storage operations to this SpiraApp
- Identifying the widget container element (`APP_GUID + "_content"`)

---

## 2. Architecture Components

### 2.1 File Structure

```
src/spiraapp-mvp/
├── manifest.yaml      # SpiraApp configuration (required)
├── widget.js          # Dashboard widget code (dashboardTypeId: 1)
├── widget.css         # Widget styles (optional, can be embedded)
├── settings.js        # Settings page code (pageId: 21)
├── settings.css       # Settings page styles
└── *.json             # Custom framework files for upload
```

### 2.2 Manifest Configuration

The `manifest.yaml` defines where and how the SpiraApp runs:

```yaml
# Metadata (required)
guid: 4B8D9721-6A99-4786-903D-9346739A0673
name: DevOpsMaturityAssessment
caption: DevOps Maturity Assessment

# Dashboard Widget (Product Home Page)
dashboards:
  - dashboardTypeId: 1        # ProductHome
    name: DevOps Maturity
    isActive: true
    code: file://widget.js

# Settings Page Code
pageContents:
  - pageId: 21                # SpiraAppProductAdmin
    name: settingsPageCode
    code: file://settings.js
    css: file://settings.css
```

### 2.3 SpiraApp Manager

The `spiraAppManager` is Inflectra's helper class providing:

| Category | Functions |
|----------|-----------|
| **IDs** | `userId`, `projectId`, `artifactId`, `pageId` |
| **Properties** | `baseUrl`, `currentCulture`, `currentTheme` |
| **Storage** | `storageGetProduct()`, `storageInsertProduct()`, `storageUpdateProduct()` |
| **Events** | `registerEvent_windowLoad()`, `registerEvent_dashboardUpdated()` |
| **Notifications** | `displaySuccessMessage()`, `displayErrorMessage()` |
| **Formatting** | `formatDate()`, `formatDateTime()` |

---

## 3. Data Structures

### 3.1 Custom Framework JSON Schema

When you upload a custom framework via the settings page, it must follow this structure:

```json
{
  "meta": {
    "name": "CALMS DevOps Framework",
    "description": "Organizational readiness assessment for DevOps transformation",
    "version": "1.0",
    "estimatedDuration": "90 minutes"
  },
  "domains": [
    {
      "id": "culture",
      "name": "Culture",
      "description": "Collaboration, blameless culture, and organizational mindset",
      "weight": 0.25,
      "order": 1,
      "questions": [
        {
          "id": "Q1",
          "text": "When a production issue occurs, how is it handled?",
          "guidance": "Score 0 = Operations fixes alone | ... | Score 5 = Cross-functional team swarms",
          "order": 1,
          "options": [
            { "score": 0, "text": "Operations fixes it alone" },
            { "score": 1, "text": "Dev notified after resolution" },
            { "score": 2, "text": "Dev notified during incident" },
            { "score": 3, "text": "Dev and Ops coordinate via tickets" },
            { "score": 4, "text": "Dev and Ops coordinate in real-time" },
            { "score": 5, "text": "Cross-functional team swarms together" }
          ]
        }
      ]
    }
  ]
}
```

#### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `meta.name` | string | Yes | Display name for the framework |
| `meta.description` | string | No | Longer description shown in preview |
| `meta.version` | string | No | Version identifier |
| `meta.estimatedDuration` | string | No | Expected completion time |
| `domains` | array | Yes | Collection of assessment domains |
| `domains[].id` | string | Yes | Unique identifier (e.g., "culture", "automation") |
| `domains[].name` | string | Yes | Display name (e.g., "Culture") |
| `domains[].weight` | number | Yes | Weight for scoring (0.0-1.0, must sum to 1.0) |
| `domains[].order` | number | No | Display order (1, 2, 3...) |
| `domains[].questions` | array | Yes | Questions within this domain |
| `questions[].id` | string | Yes | Unique question ID (e.g., "Q1", "Q2") |
| `questions[].text` | string | Yes | The question text displayed to user |
| `questions[].guidance` | string | No | Scoring guidance for each level |
| `questions[].options` | array | No | Custom answer options (defaults to 0-5 scale) |
| `options[].score` | number | Yes | Numeric score (0-5) |
| `options[].text` | string | Yes | Answer option text |

#### Default Options (When Not Specified)

If a question doesn't include `options`, the widget generates defaults:

```javascript
function generateDefaultOptions() {
    return [
        { score: 0, text: "Level 0 - None/Unknown" },
        { score: 1, text: "Level 1 - Initial" },
        { score: 2, text: "Level 2 - Developing" },
        { score: 3, text: "Level 3 - Defined" },
        { score: 4, text: "Level 4 - Managed" },
        { score: 5, text: "Level 5 - Optimizing" }
    ];
}
```

### 3.2 Assessment Result Object

When an assessment is completed, results are stored in this format:

```json
{
  "date": "2026-01-17T15:30:00.000Z",
  "overallScore": 72.45,
  "maturityLevel": "Managed",
  "maturityLevelInt": 4,
  "frameworkName": "CALMS DevOps Framework",
  "domainScores": {
    "culture": 75.0,
    "automation": 68.33,
    "lean": 72.0,
    "measurement": 70.0,
    "sharing": 65.0
  },
  "responses": {
    "Q1": { "domain": "culture", "score": 4 },
    "Q2": { "domain": "culture", "score": 3 },
    "Q3": { "domain": "culture", "score": 5 }
  }
}
```

#### Field Definitions

| Field | Type | Description |
|-------|------|-------------|
| `date` | ISO 8601 string | When assessment was completed |
| `overallScore` | number | Weighted overall percentage (0-100) |
| `maturityLevel` | string | Human-readable level name |
| `maturityLevelInt` | number | Numeric level (1-5) |
| `frameworkName` | string | Which framework was used |
| `domainScores` | object | Individual domain percentages |
| `responses` | object | Raw answers keyed by question ID |

### 3.3 Assessment History Array

Multiple assessments are stored as an array:

```json
[
  {
    "date": "2026-01-17T15:30:00.000Z",
    "overallScore": 72.45,
    "maturityLevel": "Managed",
    ...
  },
  {
    "date": "2026-01-10T10:00:00.000Z",
    "overallScore": 65.20,
    "maturityLevel": "Defined",
    ...
  }
]
```

History is sorted by date (newest first) when displayed.

---

## 4. Storage Mechanisms

### 4.1 SpiraApp Storage Overview

SpiraApps can store data using `spiraAppManager.storage*` functions. Storage is:

- **Scoped to the SpiraApp** (by `APP_GUID`)
- **Keyed by string** (max 128 characters)
- **Stored as string values** (JSON must be stringified)
- **Persisted in Spira database** (not browser localStorage)

### 4.2 Storage Dimensions

SpiraApp storage supports 4 dimensions:

| Dimension | Function | Use Case |
|-----------|----------|----------|
| **System** | `storageGetSystem()` | Global settings across all products |
| **User** | `storageGetUser()` | User preferences (not tied to product) |
| **Product** | `storageGetProduct()` | Product-specific data (our primary use) |
| **Product+User** | `storageGetProductUser()` | Per-user, per-product data |

### 4.3 Our Storage Keys

The DevOps Maturity Assessment uses **Product-level storage**:

| Key | Purpose | Data Type |
|-----|---------|-----------|
| `dmm_assessments_history` | Assessment results history | JSON array |
| `custom_framework` | Uploaded custom framework | JSON object |

### 4.4 Storage Function Signatures

#### Reading Data

```javascript
spiraAppManager.storageGetProduct(
    APP_GUID,           // SpiraApp identifier
    APP_NAME,           // SpiraApp name (for logging)
    "storage_key",      // The key to retrieve
    productId,          // Current product ID
    successCallback,    // function(data) - data is the stored string
    errorCallback       // function(error) - called if key doesn't exist
);
```

**Example: Loading Assessment History**

```javascript
function loadDmmHistory() {
    const productId = spiraAppManager.projectId;

    spiraAppManager.storageGetProduct(
        APP_GUID,
        APP_NAME,
        "dmm_assessments_history",
        productId,
        function(data) {
            // Success - parse the JSON string
            const history = data ? JSON.parse(data) : [];
            renderSummary(history);
        },
        function(err) {
            // Key doesn't exist yet (first run)
            renderSummary([]);
        }
    );
}
```

#### Writing Data (Insert)

```javascript
spiraAppManager.storageInsertProduct(
    APP_GUID,
    APP_NAME,
    "storage_key",
    JSON.stringify(data),  // Must be a string!
    productId,
    false,                 // isSecure (false for non-sensitive data)
    successCallback,
    errorCallback
);
```

#### Writing Data (Update)

```javascript
spiraAppManager.storageUpdateProduct(
    APP_GUID,
    APP_NAME,
    "storage_key",
    JSON.stringify(data),  // New value as string
    productId,
    successCallback,
    errorCallback
);
```

### 4.5 Insert vs Update Pattern

Storage items must be **inserted first**, then **updated**. Common pattern:

```javascript
function saveData(key, data) {
    const productId = spiraAppManager.projectId;
    const jsonString = JSON.stringify(data);

    // Try update first (item may already exist)
    spiraAppManager.storageUpdateProduct(
        APP_GUID, APP_NAME, key, jsonString, productId,
        function() {
            // Update succeeded
            console.log("Data updated successfully");
        },
        function(err) {
            // Update failed - item doesn't exist, try insert
            spiraAppManager.storageInsertProduct(
                APP_GUID, APP_NAME, key, jsonString, productId, false,
                function() {
                    console.log("Data inserted successfully");
                },
                function(insertErr) {
                    console.error("Failed to save:", insertErr);
                }
            );
        }
    );
}
```

### 4.6 Storage Location in Spira

Data is stored in Spira's database, accessible via:
- **PluginService.svc** REST endpoint
- Scoped by: SpiraApp GUID + Key + ProductId (for product storage)

The 500 error you see on first load is **expected** - it means the storage key doesn't exist yet:

```
POST https://your-spira.com/Services/Ajax/PluginService.svc/PluginStorage_Retrieve 500
[DMM-Settings] storageGetProduct ERROR (expected on first use): Cannot find a storage item...
```

---

## 5. Assessment Flow

### 5.1 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         WIDGET LIFECYCLE                            │
└─────────────────────────────────────────────────────────────────────┘

1. PAGE LOAD
   │
   ├── spiraAppManager.registerEvent_windowLoad(initDmmWidget)
   │
   ▼
2. INITIALIZE WIDGET
   │
   ├── injectStyles()           → Add CSS to page
   ├── loadCustomFramework()    → Check for uploaded framework
   │   │
   │   ├── storageGetProduct(CUSTOM_FRAMEWORK_KEY)
   │   │   │
   │   │   ├── SUCCESS: Parse JSON, set activeFramework
   │   │   └── ERROR: Use default questions
   │   │
   │   ▼
   └── loadDmmHistory()         → Load assessment history
       │
       ├── storageGetProduct(DMM_STORAGE_KEY)
       │   │
       │   ├── SUCCESS: Parse JSON array of results
       │   └── ERROR: Empty history (first run)
       │
       ▼
3. RENDER SUMMARY
   │
   ├── If history exists:
   │   └── Show latest score, maturity level, date
   │       └── Button: "Start New Assessment"
   │
   └── If no history:
       └── Show welcome message
           └── Button: "Start Assessment"

       USER CLICKS "START ASSESSMENT"
                    │
                    ▼
4. RENDER ASSESSMENT FORM
   │
   ├── Build domains from:
   │   ├── activeFramework (if custom uploaded)
   │   └── DMM_QUESTIONS (default fallback)
   │
   ├── Generate HTML form with:
   │   ├── Domain sections
   │   ├── Question cards
   │   ├── Radio button options (score 0-5)
   │   └── Guidance text (if provided)
   │
   └── Buttons: "Cancel" | "Submit Assessment"

       USER ANSWERS ALL QUESTIONS
       USER CLICKS "SUBMIT"
                    │
                    ▼
5. HANDLE SUBMIT
   │
   ├── Collect responses from radio buttons
   │   └── responses = { Q1: {domain, score}, Q2: {...}, ... }
   │
   ├── Validate: All questions answered?
   │   └── NO: Show error, return
   │
   ├── calculateScores(responses)
   │   ├── Sum scores per domain
   │   ├── Calculate domain percentages
   │   ├── Apply domain weights
   │   ├── Calculate overall score
   │   └── Determine maturity level (1-5)
   │
   └── saveAssessmentResults(resultObj)
       │
       ▼
6. SAVE RESULTS
   │
   ├── Load existing history
   ├── Append new result
   ├── storageUpdateProduct() or storageInsertProduct()
   │
   └── On success:
       └── renderResults(resultObj)
           │
           ▼
7. SHOW RESULTS
   │
   ├── Display overall score
   ├── Display maturity level badge
   ├── Display domain breakdown
   │
   └── Buttons: "View History" | "Take Again"

```

### 5.2 Event Registration

The widget registers for these SpiraApp events:

```javascript
// Called when page fully loads
spiraAppManager.registerEvent_windowLoad(initDmmWidget);

// Called when dashboard release filter changes
spiraAppManager.registerEvent_dashboardUpdated(initDmmWidget);
```

### 5.3 Container Element

The widget renders into a DOM element provided by Spira:

```javascript
const elementId = APP_GUID + "_content";
// Results in: "4B8D9721-6A99-4786-903D-9346739A0673_content"

const container = document.getElementById(elementId);
container.innerHTML = Mustache.render(template, data);
```

---

## 6. Scoring Logic

### 6.1 Domain Score Calculation

For each domain:

```
Domain Score = (Sum of Question Scores / Maximum Possible Score) × 100
```

**Example: Culture Domain (6 questions)**
- User scores: Q1=4, Q2=3, Q3=5, Q4=4, Q5=3, Q6=4 = 23
- Max possible: 6 × 5 = 30
- Domain Score: (23/30) × 100 = 76.67%

### 6.2 Overall Score Calculation

Overall score is the **weighted average** of domain scores:

```
Overall = Σ (Domain Score × Domain Weight)
```

**Example: CALMS Framework**
```
Overall = (Culture × 0.25) + (Automation × 0.25) + (Lean × 0.15)
        + (Measurement × 0.20) + (Sharing × 0.15)

       = (76.67 × 0.25) + (68.33 × 0.25) + (72.0 × 0.15)
         + (70.0 × 0.20) + (65.0 × 0.15)

       = 19.17 + 17.08 + 10.8 + 14.0 + 9.75

       = 70.8%
```

### 6.3 Maturity Level Mapping

```javascript
let level = 1;
let levelName = "Initial";

if (overall > 20) { level = 2; levelName = "Developing"; }
if (overall > 40) { level = 3; levelName = "Defined"; }
if (overall > 60) { level = 4; levelName = "Managed"; }
if (overall > 80) { level = 5; levelName = "Optimizing"; }
```

| Score Range | Level | Name |
|-------------|-------|------|
| 0-20% | 1 | Initial |
| 21-40% | 2 | Developing |
| 41-60% | 3 | Defined |
| 61-80% | 4 | Managed |
| 81-100% | 5 | Optimizing |

### 6.4 Weight Validation

**Important**: Domain weights must sum to 1.0 (or very close):

```javascript
// CALMS weights
const weights = {
    "culture": 0.25,      // 25%
    "automation": 0.25,   // 25%
    "lean": 0.15,         // 15%
    "measurement": 0.20,  // 20%
    "sharing": 0.15       // 15%
};
// Sum: 0.25 + 0.25 + 0.15 + 0.20 + 0.15 = 1.00 ✓
```

---

## 7. Survey Implementation Guide

This section explains how to create your own assessment survey that users can fill out.

### 7.1 Creating a Custom Framework

#### Step 1: Define Your Domains

Identify 3-7 assessment domains with weights:

```json
{
  "domains": [
    { "id": "security", "name": "Security", "weight": 0.30 },
    { "id": "reliability", "name": "Reliability", "weight": 0.25 },
    { "id": "performance", "name": "Performance", "weight": 0.25 },
    { "id": "observability", "name": "Observability", "weight": 0.20 }
  ]
}
```

**Weight Guidelines:**
- More important domains get higher weights
- All weights must sum to 1.0
- Typical range: 0.10 - 0.35 per domain

#### Step 2: Create Questions

For each domain, create 3-10 questions:

```json
{
  "id": "S1",
  "text": "How do you manage application secrets?",
  "guidance": "Score 0 = Hardcoded in source | Score 1 = Environment variables | Score 2 = Encrypted files | Score 3 = Secrets manager | Score 4 = Vault with rotation | Score 5 = Zero-trust with just-in-time access",
  "order": 1
}
```

**Question Best Practices:**

| Aspect | Recommendation |
|--------|----------------|
| **Question IDs** | Use unique prefixes per domain (S1, S2 for Security; R1, R2 for Reliability) |
| **Question Text** | Clear, specific, measurable |
| **Guidance** | Describe what each score level means |
| **Order** | Start with foundational questions, progress to advanced |

#### Step 3: Define Answer Options

Two approaches:

**Approach A: Use Default 0-5 Scale (Recommended)**

Don't include `options` array - widget generates defaults:

```json
{
  "id": "S1",
  "text": "How do you manage secrets?",
  "guidance": "Score 0 = Hardcoded | ... | Score 5 = Zero-trust"
}
// Widget generates: Level 0 - None/Unknown, Level 1 - Initial, etc.
```

**Approach B: Custom Options**

Include explicit options for domain-specific language:

```json
{
  "id": "S1",
  "text": "How do you manage secrets?",
  "options": [
    { "score": 0, "text": "Hardcoded in source code" },
    { "score": 1, "text": "Environment variables only" },
    { "score": 2, "text": "Encrypted configuration files" },
    { "score": 3, "text": "Centralized secrets manager" },
    { "score": 4, "text": "Vault with automatic rotation" },
    { "score": 5, "text": "Zero-trust with JIT access" }
  ]
}
```

### 7.2 Complete Framework Template

```json
{
  "meta": {
    "name": "Your Assessment Name",
    "description": "Brief description of what this assesses",
    "version": "1.0",
    "estimatedDuration": "45 minutes"
  },
  "domains": [
    {
      "id": "domain1",
      "name": "First Domain",
      "description": "What this domain covers",
      "weight": 0.40,
      "order": 1,
      "questions": [
        {
          "id": "D1Q1",
          "text": "First question in domain 1?",
          "guidance": "Score 0 = lowest | ... | Score 5 = highest",
          "order": 1
        },
        {
          "id": "D1Q2",
          "text": "Second question in domain 1?",
          "guidance": "Score 0 = lowest | ... | Score 5 = highest",
          "order": 2
        }
      ]
    },
    {
      "id": "domain2",
      "name": "Second Domain",
      "description": "What this domain covers",
      "weight": 0.30,
      "order": 2,
      "questions": [
        {
          "id": "D2Q1",
          "text": "First question in domain 2?",
          "guidance": "Score 0 = lowest | ... | Score 5 = highest",
          "order": 1
        }
      ]
    },
    {
      "id": "domain3",
      "name": "Third Domain",
      "description": "What this domain covers",
      "weight": 0.30,
      "order": 3,
      "questions": [
        {
          "id": "D3Q1",
          "text": "First question in domain 3?",
          "guidance": "Score 0 = lowest | ... | Score 5 = highest",
          "order": 1
        }
      ]
    }
  ]
}
```

### 7.3 Uploading Your Framework

1. **Navigate to Settings**
   - Product Admin → SpiraApp Settings
   - Find "DevOps Maturity Assessment"

2. **Upload JSON File**
   - Click "Upload Custom Framework"
   - Select your `.json` file
   - Preview validates structure

3. **Save Framework**
   - Click "Save Framework"
   - Framework stored in Spira database
   - Available for all users in this product

### 7.4 Framework Validation Rules

The settings page validates:

| Check | Requirement |
|-------|-------------|
| `meta.name` | Must exist and be non-empty |
| `domains` | Must be an array with at least 1 domain |
| `domains[].id` | Must exist for each domain |
| `domains[].name` | Must exist for each domain |
| `domains[].weight` | Should be between 0 and 1 |
| `domains[].questions` | Must be an array with at least 1 question |
| `questions[].id` | Must exist for each question |
| `questions[].text` | Must exist for each question |
| Weights sum | Should equal approximately 1.0 |

### 7.5 Tips for Effective Surveys

#### Question Design

1. **Be Specific**: "How often do you deploy?" > "How is your deployment?"
2. **Avoid Ambiguity**: Each score level should be clearly distinct
3. **Use Measurable Criteria**: Include specific thresholds where possible
4. **Progress Logically**: Score 0 = nothing, Score 5 = best practice

#### Domain Design

1. **3-7 Domains**: Fewer is better for focus
2. **Balanced Questions**: Similar number per domain (4-8)
3. **Weight by Importance**: Higher weight = more impact on overall score
4. **Clear Boundaries**: Avoid overlapping domain definitions

#### Guidance Best Practices

```
Good: "Score 0 = No automated tests | Score 1 = <20% coverage |
       Score 2 = 20-40% coverage | Score 3 = 40-60% coverage |
       Score 4 = 60-80% coverage | Score 5 = >80% with integration tests"

Bad:  "Score 0 = Bad | Score 5 = Good"
```

---

## 8. API Reference

### 8.1 SpiraAppManager Functions Used

#### Storage Functions

```javascript
// Get product-level storage
spiraAppManager.storageGetProduct(
    appGuid, appName, key, productId, successFn, errorFn
)

// Insert new product-level storage
spiraAppManager.storageInsertProduct(
    appGuid, appName, key, value, productId, isSecure, successFn, errorFn
)

// Update existing product-level storage
spiraAppManager.storageUpdateProduct(
    appGuid, appName, key, value, productId, successFn, errorFn
)
```

#### Event Registration

```javascript
// Run on page load
spiraAppManager.registerEvent_windowLoad(handler)

// Run when dashboard release filter changes
spiraAppManager.registerEvent_dashboardUpdated(handler)
```

#### Properties

```javascript
spiraAppManager.projectId       // Current product ID (integer)
spiraAppManager.userId          // Current user ID (integer)
spiraAppManager.pageId          // Current page identifier (string)
```

#### Notifications

```javascript
spiraAppManager.displaySuccessMessage("Success text")
spiraAppManager.displayErrorMessage("Error text")
spiraAppManager.displayWarningMessage("Warning text")
```

#### Formatting

```javascript
spiraAppManager.formatDate("2026-01-17T15:30:00Z")
// Returns: "1/17/2026" (based on user's culture)

spiraAppManager.formatDateTime("2026-01-17T15:30:00Z")
// Returns: "1/17/2026 3:30:00 PM" (based on user's culture)
```

### 8.2 Available Libraries

Per SpiraApp documentation, these are available:

| Library | Version | Notes |
|---------|---------|-------|
| **Mustache** | Built-in | Template rendering (dashboard widgets only) |
| **React** | 16.14 | Component-based UI |
| **FontAwesome 6 Pro** | Built-in | Icons via CSS classes |

**Note**: Mustache is NOT available on settings pages (pageId: 21). Use plain JavaScript string templates instead.

---

## 9. Troubleshooting

### 9.1 Common Console Messages

| Message | Meaning | Action |
|---------|---------|--------|
| `storageGetProduct ERROR (expected on first use)` | Storage key doesn't exist yet | Normal - first run |
| `Mustache is not defined` | Using Mustache on settings page | Replace with `renderTemplate()` |
| `Container not found` | Widget element missing | Ensure widget added to dashboard |
| `Validation failed: Not all questions answered` | User skipped questions | User must answer all |

### 9.2 Debugging Tools

#### Console Logging

The widget uses extensive logging with `[DMM-Settings]` or `DMM DEBUG` prefixes:

```javascript
console.log("[DMM-Settings] Loading framework...", { productId: 29 });
```

#### Persistent Debug Log

Widget stores debug log in localStorage:

```javascript
// View debug log
localStorage.getItem('dmm_debug_log');

// Clear log
localStorage.removeItem('dmm_debug_log');
```

#### Browser DevTools

1. **Console**: Filter by "DMM" to see widget logs
2. **Network**: Filter by "PluginStorage" to see storage API calls
3. **Application → Storage**: View localStorage entries

### 9.3 Common Issues

#### Framework Not Loading

**Symptom**: Default questions appear despite uploading custom framework

**Causes**:
1. JSON parse error in framework file
2. Framework not saved to storage
3. Storage key mismatch

**Solution**:
1. Validate JSON: `python -m json.tool framework.json`
2. Check console for storage errors
3. Clear and re-upload framework

#### Scores Not Calculating

**Symptom**: Submit button does nothing

**Causes**:
1. Not all questions answered
2. Radio button name mismatch
3. JavaScript error in handler

**Solution**:
1. Answer all questions
2. Check console for errors
3. Verify question IDs match form inputs

#### Widget Not Appearing

**Symptom**: Empty space on dashboard

**Causes**:
1. Widget not added to dashboard
2. SpiraApp not enabled for product
3. JavaScript error on load

**Solution**:
1. Dashboard → Add/Remove Items → Add widget
2. Product Admin → SpiraApps → Enable
3. Check console for errors

---

## 10. Quick Reference

### Storage Keys

| Key | Storage Level | Content |
|-----|---------------|---------|
| `dmm_assessments_history` | Product | JSON array of assessment results |
| `custom_framework` | Product | JSON object of custom framework |

### Key Constants

```javascript
const APP_GUID = "4B8D9721-6A99-4786-903D-9346739A0673";
const APP_NAME = "DevOpsMaturityAssessment";
const DMM_STORAGE_KEY = "dmm_assessments_history";
const CUSTOM_FRAMEWORK_KEY = "custom_framework";
```

### Maturity Levels

| Level | Name | Score Range |
|-------|------|-------------|
| 1 | Initial | 0-20% |
| 2 | Developing | 21-40% |
| 3 | Defined | 41-60% |
| 4 | Managed | 61-80% |
| 5 | Optimizing | 81-100% |

### File Locations

```
src/spiraapp-mvp/
├── manifest.yaml          # SpiraApp configuration
├── widget.js              # Dashboard widget
├── settings.js            # Settings page
├── calms-framework.json   # Sample CALMS framework
└── assessment-template.json  # Blank template
```

---

## Document Information

**Created**: January 17, 2026
**Version**: 1.0
**Author**: Claude Code
**Based on**: Inflectra SpiraApp Developer Documentation

**Related Documents**:
- `CALMS_FRAMEWORK_TESTING_GUIDE.md` - Testing procedures
- `CALMS_QUICK_REFERENCE.txt` - Quick reference card
- `docs/SpiraApp_Information/` - Official SpiraApp docs
