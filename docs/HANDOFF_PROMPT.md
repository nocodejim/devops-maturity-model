# SpiraApp Widget Bug - Handoff Prompt for Next Session

## Context
I'm working on a DevOps Maturity Model SpiraApp widget located at:
- **Widget code**: `~/projects/devops-maturity-model/src/spiraapp-mvp/widget.js`
- **Manifest**: `~/projects/devops-maturity-model/src/spiraapp-mvp/manifest.yaml`
- **Lessons learned**: `~/projects/devops-maturity-model/docs/spiraapp-lessons-learned.md`
- **Build script**: `./build_spiraapp.sh` (from repo root)
- **Output**: `dist/4B8D9721-6A99-4786-903D-9346739A0673.spiraapp`

## Current State
✅ Widget loads without logout
✅ Container element found (using lowercase GUID)
✅ Initial render works - "Start Assessment" button appears
✅ **Fix Applied**: `renderAssessmentForm` and `renderResults` now use the known working `window.DMM_CONTAINER_ID`.

## Ready for Verification
The error `Uncaught TypeError: Cannot set properties of null` should be resolved.
Steps to verify:
1. Reload dashboard
2. Click "Start Assessment"
3. Verify form appears (no console errors)
4. Submit assessment
5. Verify results appear

## Previous Error Context (Resolved)
```
Uncaught TypeError: Cannot set properties of null (setting 'innerHTML')
```
This occurred because `renderAssessmentForm()` was using the uppercase GUID, while Spira rendered the container with a lowercase GUID. The fix ensures we use the ID discovered during the initial load.

## Root Cause
The function `renderAssessmentForm()` uses `APP_GUID + "_content"` (uppercase) to find the container, but Spira creates the element with a **lowercase** GUID: `4b8d9721-6a99-4786-903d-9346739a0673_content`.

The previous session fixed this in `loadDmmHistory()` and `renderSummary()` by storing the discovered ID in `window.DMM_CONTAINER_ID`, but `renderAssessmentForm()` wasn't updated.

## Fix Needed
Update `renderAssessmentForm()` (and any other render functions) to use `window.DMM_CONTAINER_ID` instead of `APP_GUID + "_content"`.

Search for all uses of `APP_GUID + "_content"` in widget.js and replace with the discovered ID pattern.

## Key Lessons (from spiraapp-lessons-learned.md)
1. **API Signature**: Must use 6-param signature with `pluginName` or you get logout
2. **Container ID**: Spira uses **lowercase** GUID for element IDs
3. **First run error**: "key not found" 500 is expected - handle gracefully

## Build & Deploy
```bash
cd ~/projects/devops-maturity-model
./build_spiraapp.sh
# Deploy dist/*.spiraapp to Spira
```
