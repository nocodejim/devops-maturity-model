# SpiraPlan Testing Agent: Test Strategy Guide

When assigned to test a **new** SpiraApp, use this guide to analyze the `manifest.yaml` and source code to generate a Test Plan.

## 1. Manifest Analysis
Read the `manifest.yaml` to understand the app's identity and generic capabilities.

*   **`guid`**: Critical for DOM ID lookups.
    *   *Test:* Verify the container ID in the DOM matches this GUID (check for case-sensitivity issues).
*   **`settings`**: Does the app require Admin setup?
    *   *Test:* Verify that required settings (e.g., API Keys, URLs) are populated before testing.
*   **`menus`**: function `registerEvent_menuEntryClick`.
    *   *Test:* Click the menu item and verify the registered handler fires.

## 2. Widget Logic Analysis
Read the `widget.js` (or primary code file) to identify the "Happy Path".

*   **Inputs**: usage of `document.getElementById`, `querySelector('input')`.
    *   *Test:* Map out every input field that needs data.
*   **Outputs**: usage of `spiraAppManager.displaySuccessMessage`, `innerHTML` updates.
    *   *Test:* These are your "Success Criteria".
*   **Storage**: usage of `storageInsertProduct`, `storageGetValue`.
    *   *Test:* If the app saves data, RELOAD the page after saving. Does the data persist? (e.g., "History" table is populated).

## 3. Common Failure Modes to Probe
*   **Missing Form Tags**: Does the code look for `<form>`? If so, does the HTML generator actually output a `<form>`?
*   **Scope Pollution**: Does the code use global variables?
    *   *Test:* Refresh the dashboard **twice** without a hard reload. If it breaks the second time, variables are leaking.
*   **Container ID Mismatch**:
    *   *Test:* Inspect the `div` ID. Is it Lowercase? Is the manifest Uppercase?

## 4. Test Plan Template
Create a specific file for the app (e.g., `TEST_PLAN_DEVOPS_MATURITY.md`):

```markdown
# Test Plan: [App Name]

## Configuration
- URL: [...]
- User: [...]

## Test Cases
| ID | Description | Input Data | Expected Output |
| :--- | :--- | :--- | :--- |
| TC-01 | Widget Load | N/A | "Start" button visible |
| TC-02 | Form Validation | Empty Form + Click Submit | Error "Required fields missing" |
| TC-03 | Happy Path | All Fields Valid | Success Message + Score Displayed |
| TC-04 | Persistence | Reload Page | Previous Result shown in History |
```
