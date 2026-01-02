# SpiraApp Development Lessons Learned

A collection of gotchas, fixes, and best practices discovered during the development of the DevOps Maturity Model MVP.

## 1. Manifest Configuration
### Version Format
- **Issue**: Using Semantic Versioning (e.g., `1.0.0`) in `manifest.yaml` causes a generic "SpiraApp package is not correctly formed" error (500).
- **Solution**: Use simple decimal versioning (e.g., `1.0`, `1.1`).
- **Lesson**: `version` must be a `decimal`.

## 2. Storage API (`spiraAppManager`)
### Function Signatures
Per the [official SpiraApps documentation](docs/SpiraApp_Information/SpiraApps-Manager.md), all storage functions require both `pluginGuid` AND `pluginName` as the first two arguments:

- **storageGetProduct**: `(pluginGuid, pluginName, key, productId, successFunction, failureFunction)`
- **storageUpdateProduct**: `(pluginGuid, pluginName, key, value, productId, successFunction, failureFunction)`
- **storageInsertProduct**: `(pluginGuid, pluginName, key, value, productId, isSecure, successFunction, failureFunction)`

### Critical: API Signature Behavior
| Signature | Logout? | Behavior |
|-----------|---------|----------|
| 5-param (without pluginName) | YES | 500 error + session invalidation |
| 6-param (with pluginName) | NO | Works, but API uses pluginName for debugging only |

- **Issue**: Omitting `pluginName` causes 500 errors and logout.
- **Solution**: Always include pluginName as the second argument (can match manifest `name`).
- **Note**: The "key not found" 500 error on first run is **expected** - just render empty state in error callback.

## 3. Container Element ID
### Case Sensitivity Issue (CRITICAL)
- **Issue**: The widget container ID uses **lowercase** GUID, not the uppercase format from the manifest.
- **Expected ID**: `4B8D9721-6A99-4786-903D-9346739A0673_content`
- **Actual ID**: `4b8d9721-6a99-4786-903d-9346739a0673_content`
- **Solution**: Use case-insensitive lookup OR store discovered ID in `window.DMM_CONTAINER_ID`:
```javascript
const alternatives = [
    APP_GUID.toLowerCase() + "_content",
    // ... other formats
];
```

## 4. JavaScript Scoping
### "Identifier has already been declared"
- **Issue**: Defining constants at top level causes `SyntaxError` on dashboard refresh.
- **Solution**: Wrap entire widget in an **IIFE**:
```javascript
(function() {
    const APP_GUID = "...";
    // ... widget logic ...
})();
```

## 5. Resolved Bug: renderAssessmentForm Null Error
### Issue
- **Error**: `Uncaught TypeError: Cannot set properties of null (setting 'innerHTML')` in `renderAssessmentForm()`
- **Cause**: The function used `APP_GUID + "_content"` (uppercase), traversing a DOM where the container ID was actually lowercase.
- **Fix**: Updated `renderAssessmentForm()` and `renderResults()` to use `window.DMM_CONTAINER_ID` (populated during `loadDmmHistory` scan), with the original ID construction as a fallback. Added logging to trace resolution.

## 6. Debugging
- **Console Logs**: Use `dmmLog()` helper that writes to both console and localStorage for persistent debugging
- **localStorage**: Check `localStorage.getItem('dmm_debug_log')` after errors
- **Network Tab**: Check response body for `PluginRestException` details
## 7. Manifest & Data Saving Pitfalls
- **Issue: Manifest Name Spaces**: Analyzed working examples (`AWSBedrock`, `AzureOpenAI`) and confirmed that `manifest.yaml` `name` **MUST NOT** contain spaces (e.g., `awsBedrock`, `azureOpenAI`).
- **Correction**: My previous attempt to change the name was correct in principle, but failed due to an accidental code deletion (user error).
- **Rule**: Keep `name` code-friendly (camelCase) and use `caption` for the user-facing title (spaces allowed).
- **Binding**: Changing the name might still require reinstalling the app if Spira binds storage to the install-time name.
- **Process Warning**: When refactoring large files like `widget.js`, verify the diff carefully to ensure huge chunks (like question arrays or templates) aren't accidentally deleted.
