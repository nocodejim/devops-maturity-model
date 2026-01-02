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

- **Issue**: Omitting `pluginName` causes the API to misinterpret subsequent arguments (e.g., treating the Key as the ProductId), leading to 500 errors and security disconnects/logout.
- **Solution**: Always include pluginName as the second argument.
    - **Incorrect**: `storageGetProduct(GUID, "Key", productId, ...)`
    - **Correct**: `storageGetProduct(GUID, "DMM_App", "Key", productId, ...)`

## 3. JavaScript Scoping
### "Identifier has already been declared"
- **Issue**: Defining constants (`const APP_GUID = ...`) at the top level of `widget.js` causes a `SyntaxError` if the widget logic is loaded multiple times (e.g., refreshing the dashboard or navigating between pages without a full reload).
- **Solution**: Wrap the entire widget logic in an **IIFE** (Immediately Invoked Function Expression) to create a private scope.
```javascript
(function() {
    const APP_GUID = "...";
    // ... widget logic ...
})();
```

## 4. Debugging
- **Console Logs**: SpiraApp errors often manifest as generic 500s in the console. Always check the `Network` tab response body for specific exception messages (e.g., `PluginRestException`).
- **Feedback**: Since SpiraApps run client-side, visual feedback (like changing button text to "Saving...") is critical for async operations that don't trigger a page reload.
