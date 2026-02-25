# SpiraApp Development Lessons Learned

A collection of gotchas, fixes, and best practices discovered during the development of the DevOps Maturity Model SpiraApp.

## 1. Manifest Configuration
### Version Format
- **Issue**: Using Semantic Versioning (e.g., `1.0.0`) in `manifest.yaml` causes a generic "SpiraApp package is not correctly formed" error (500).
- **Solution**: Use simple decimal versioning (e.g., `1.0`, `1.1`).
- **Lesson**: `version` must be a `decimal`.

### Name Format
- **Rule**: `name` must be camelCase with no spaces (e.g., `DevOpsMaturityAssessment`). Use `caption` for the user-facing title.
- **Binding**: Changing the name may require reinstalling the app if Spira binds storage to the install-time name.

## 2. Storage API (`spiraAppManager`)
### Function Signatures
All storage functions require both `pluginGuid` AND `pluginName` as the first two arguments:

- **storageGetProduct**: `(pluginGuid, pluginName, key, productId, successFunction, failureFunction)`
- **storageUpdateProduct**: `(pluginGuid, pluginName, key, value, productId, successFunction, failureFunction)`
- **storageInsertProduct**: `(pluginGuid, pluginName, key, value, productId, isSecure, successFunction, failureFunction)`

### Critical: API Signature Behavior
| Signature | Logout? | Behavior |
|-----------|---------|----------|
| 5-param (without pluginName) | YES | 500 error + session invalidation |
| 6-param (with pluginName) | NO | Works correctly |

- **Issue**: Omitting `pluginName` causes 500 errors and logout.
- **Solution**: Always include pluginName as the second argument (must match manifest `name`).
- **Note**: The "key not found" 500 error on first run is **expected** -- render empty state in error callback.

### Update-then-Insert Pattern
For saving data, always try `storageUpdateProduct` first, then fall back to `storageInsertProduct` on failure. This handles both first-run (no key exists) and subsequent saves.

## 3. Container Element
### WIDGET_ELEMENT (v1.0+)
- **Best practice**: Use the runtime-provided `WIDGET_ELEMENT` global instead of scanning the DOM.
- **Fallback**: For older Spira versions, try `APP_GUID.toLowerCase() + "_content"` (Spira lowercases the GUID in container IDs).

### Legacy: Case Sensitivity Issue
- **Issue**: The widget container ID uses **lowercase** GUID, not the uppercase format from the manifest.
- **Solution in v0.x**: DOM scanning with `window.DMM_CONTAINER_ID`. Removed in v1.0 in favor of `WIDGET_ELEMENT`.

## 4. JavaScript Scoping
### "Identifier has already been declared"
- **Issue**: Defining constants at top level causes `SyntaxError` on dashboard refresh.
- **Solution**: Wrap entire widget in an **IIFE** with `'use strict'`.

## 5. Package Generator `file://` References

### Regex Matching (CRITICAL)
- **Issue**: The generator uses a naive regex (`/file:\/\/[^/\\]+?\.\w+/g`) that matches ALL `file://` occurrences in code, not just assignment values.
- **Example**: `if (STYLES.indexOf('file://') === 0)` will be matched and the generator tries to open `') === 0)` as a filename.
- **Solution**: Never use the literal string `file://` anywhere in JS code except for the actual file reference assignment. To detect an unprocessed reference, use `STYLES.length < 50` instead.

### CSS Base64 Encoding (CRITICAL)
- **Issue**: When a CSS file is embedded in a JS file via `file://widget.css`, the generator base64-encodes the CSS content. The `doNotEncodeList` in the generator only includes `["js", "json", "html", "txt", "md"]` -- CSS is NOT in the list.
- **Symptom**: Widget renders HTML correctly (Mustache works) but has zero styling -- all questions visible at once, no tabs, no colors.
- **Solution**: Decode with `atob()` at runtime:
```javascript
var WIDGET_STYLES = 'file://widget.css';

function injectStyles() {
    if (document.getElementById('dmm-styles')) return;
    if (WIDGET_STYLES.length < 50) return; // Demo mode: CSS loaded via <link>
    var s = document.createElement('style');
    s.id = 'dmm-styles';
    try { s.textContent = atob(WIDGET_STYLES); } catch (e) { s.textContent = WIDGET_STYLES; }
    document.head.appendChild(s);
}
```

## 6. REST API via `executeApi()`

### Function Signature
```javascript
spiraAppManager.executeApi(pluginName, apiVersion, method, url, body, successFn, errorFn)
```

- `body` must be `JSON.stringify()`'d for POST requests
- `url` is relative from the API version (e.g., `projects/1/documents/file`)
- Uses current user's permissions automatically

### Creating Documents
- **Endpoint**: `POST projects/{projectId}/documents/file`
- **Binary data**: Must be base64-encoded via `btoa()`. For Unicode-safe encoding, use `btoa(unescape(encodeURIComponent(content)))`.
- **Custom properties**: Use `CustomPropertyFieldName` (e.g., `Custom_01`), `CustomPropertyTypeId` (1=Text, 2=Integer), and the value field (`StringValue`, `IntegerValue`, etc.).

### Permission Check
```javascript
if (spiraAppManager.canCreateArtifactType(13)) { /* 13 = Document */ }
```

## 7. Mustache Availability
- **Dashboard widgets**: Mustache IS available as a global
- **Settings pages (pageContents)**: Mustache is NOT available. Use a simple regex-based template renderer:
```javascript
function renderTemplate(template, data) {
    var result = template;
    for (var key in data) {
        result = result.replace(new RegExp('\\{\\{' + key + '\\}\\}', 'g'), data[key] || '');
    }
    return result;
}
```

## 8. Development Workflow
- **Demo mode**: `demo.html` with mock `spiraAppManager` backed by localStorage. Run via `python3 -m http.server` from `src/spiraapp-mvp/`.
- **Build**: `./build_spiraapp.sh` from project root produces `.spiraapp` in `dist/`.
- **Deploy**: Upload to System Admin > SpiraApps, enable system-wide, then per-product.
- **Iterate**: Each upload replaces the previous version. No need to uninstall/reinstall unless the manifest `name` changed.
