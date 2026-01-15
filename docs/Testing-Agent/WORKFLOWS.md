# SpiraPlan Testing Agent: Workflows

This document defines the standard operating procedures (workflows) for the Testing Agent.

## Workflow 1: Smoke Test (Health Check)
**Goal:** Verify that the SpiraApp loads without crashing the dashboard.
**Trigger:** After any deployment or code update.

1.  **Login**: Access SpiraService.
2.  **Navigate**: Go to the Project Dashboard.
3.  **Inspect**:
    *   Confirm the Widget Container exists.
    *   Confirm the "Loading..." state transitions to the "Ready" state.
    *   **Check Console:** Ensure no `Uncaught SyntaxError` or `ReferenceError` appears immediately (common with IIFE/Scope issues).

## Workflow 2: Full Regression (E2E)
**Goal:** Verify the core functionality and data saving.
**Trigger:** Before "Handoff" or release.

1.  **Setup**: ensure the browser console capture is active.
2.  **Start**: Click the primary entry button (e.g., "Start Assessment").
3.  **Fill**:
    *   Identify all inputs (`input`, `select`, `textarea`).
    *   Fill them with valid test data.
    *   *Edge Case:* If radio buttons are used, ensure one is selected per name group.
4.  **Submit**: Click the Submit action.
5.  **Verify UI**:
    *   Wait for visual confirmation (Spinner -> Success Message).
    *   fail if the button remains stuck (e.g., on "Calculating...").
6.  **Verify Logs**:
    *   Check for `500` network errors *during* submission.
    *   Check for `TypeError` or `DOM Exception`.

## Workflow 3: Manual App Upload (Agent Assisted)
**Goal:** Update the SpiraApp code on the server.
**Note:** There is no API for this. The agent must do this via UI automation if permissions allow.

1.  **Navigate**: Go to ` Administration > System > SpiraApps` (requires Admin access).
2.  **Search**: Find the target app (e.g., "DevOps Maturity Model").
3.  **Edit**: Click "Edit".
4.  **Upload**:
    *   Locate the `manifest.yaml` upload field? (Or typically, paste the Code?).
    *   *Correction:* SpiraApps are usually uploaded as `.spiraapp` packages or pasted into a "Script" field depending on the version.
    *   If "Script" field exists: Copy content of `widget.js` and paste it.
5.  **Save**: Click Save.
6.  **Verify**: Navigate back to the Dashboard to confirm the new version is active.
