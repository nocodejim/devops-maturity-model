// DevOps Maturity Model SpiraApp Settings Page
// Allows product admins to upload custom assessment frameworks

(function () {

    // --- CONSTANTS ---
    const APP_GUID = "4B8D9721-6A99-4786-903D-9346739A0673";
    const APP_NAME = "DevOpsMaturityAssessment";
    const CUSTOM_FRAMEWORK_KEY = "custom_framework";

    // --- CSS STYLES ---
    const SETTINGS_STYLES = `
/* DevOps Maturity Model Settings Styles */
.dmm-settings {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #333;
    padding: 20px;
    max-width: 800px;
}
.dmm-settings h2 {
    color: #007bff;
    border-bottom: 2px solid #007bff;
    padding-bottom: 10px;
    margin-bottom: 20px;
}
.dmm-settings h3 {
    color: #495057;
    margin-top: 25px;
    margin-bottom: 15px;
}
.dmm-settings-section {
    background: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
}
.dmm-settings-section.success {
    border-color: #28a745;
    background: #e8f5e9;
}
.dmm-settings-section.error {
    border-color: #dc3545;
    background: #ffebee;
}
.dmm-info-box {
    background: #e3f2fd;
    border: 1px solid #90caf9;
    border-radius: 4px;
    padding: 15px;
    margin-bottom: 20px;
}
.dmm-info-box p {
    margin: 5px 0;
}
.dmm-textarea {
    width: 100%;
    min-height: 300px;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 12px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: vertical;
}
.dmm-textarea:focus {
    border-color: #007bff;
    outline: none;
}
.dmm-btn {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    margin-right: 10px;
    margin-top: 10px;
}
.dmm-btn:hover {
    background-color: #0056b3;
}
.dmm-btn-secondary {
    background-color: #6c757d;
}
.dmm-btn-secondary:hover {
    background-color: #5a6268;
}
.dmm-btn-danger {
    background-color: #dc3545;
}
.dmm-btn-danger:hover {
    background-color: #c82333;
}
.dmm-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}
.dmm-status {
    margin-top: 15px;
    padding: 10px;
    border-radius: 4px;
}
.dmm-status.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
}
.dmm-status.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}
.dmm-status.info {
    background: #d1ecf1;
    color: #0c5460;
    border: 1px solid #bee5eb;
}
.dmm-current-framework {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 15px;
    margin-top: 15px;
}
.dmm-current-framework h4 {
    margin-top: 0;
    color: #28a745;
}
.dmm-framework-meta {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 5px 15px;
}
.dmm-framework-meta dt {
    font-weight: bold;
    color: #666;
}
.dmm-framework-meta dd {
    margin: 0;
}
.dmm-validation-list {
    margin: 10px 0;
    padding-left: 20px;
}
.dmm-validation-list li {
    margin: 5px 0;
}
.dmm-validation-list .valid {
    color: #28a745;
}
.dmm-validation-list .invalid {
    color: #dc3545;
}
.dmm-file-input {
    margin: 10px 0;
}
`;

    // --- HELPER FUNCTIONS ---

    function settingsLog(msg, data) {
        const logKey = 'dmm_settings_log';
        let log = localStorage.getItem(logKey) || '';
        const timestamp = new Date().toISOString();
        const entry = `[${timestamp}] ${msg}: ${JSON.stringify(data)}\n`;
        localStorage.setItem(logKey, log + entry);
        console.log("[DMM Settings]", msg, data);
    }

    // Clear old logs on fresh load
    localStorage.setItem('dmm_settings_log', '--- DMM Settings Session Started ---\n');

    function injectStyles() {
        if (!document.getElementById("dmm-settings-styles")) {
            var style = document.createElement('style');
            style.id = "dmm-settings-styles";
            style.innerHTML = SETTINGS_STYLES;
            document.head.appendChild(style);
        }
    }

    // --- FRAMEWORK VALIDATION ---

    function validateFramework(framework) {
        const errors = [];
        const warnings = [];

        // Check meta
        if (!framework.meta) {
            errors.push("Missing 'meta' object");
        } else {
            if (!framework.meta.name || typeof framework.meta.name !== 'string' || framework.meta.name.trim() === '') {
                errors.push("meta.name is required and must be a non-empty string");
            }
            if (framework.meta.description && typeof framework.meta.description !== 'string') {
                errors.push("meta.description must be a string if provided");
            }
            if (framework.meta.version && typeof framework.meta.version !== 'string') {
                errors.push("meta.version must be a string if provided");
            }
        }

        // Check domains
        if (!framework.domains || !Array.isArray(framework.domains) || framework.domains.length === 0) {
            errors.push("'domains' must be a non-empty array");
        } else {
            let totalWeight = 0;
            const domainIds = new Set();
            const questionIds = new Set();

            framework.domains.forEach((domain, di) => {
                const prefix = `domains[${di}]`;

                if (!domain.id || typeof domain.id !== 'string') {
                    errors.push(`${prefix}.id is required and must be a string`);
                } else if (domainIds.has(domain.id)) {
                    errors.push(`${prefix}.id "${domain.id}" is duplicate`);
                } else {
                    domainIds.add(domain.id);
                }

                if (!domain.name || typeof domain.name !== 'string') {
                    errors.push(`${prefix}.name is required and must be a string`);
                }

                if (typeof domain.weight !== 'number') {
                    errors.push(`${prefix}.weight is required and must be a number`);
                } else {
                    totalWeight += domain.weight;
                }

                if (!domain.questions || !Array.isArray(domain.questions) || domain.questions.length === 0) {
                    errors.push(`${prefix}.questions must be a non-empty array`);
                } else {
                    domain.questions.forEach((q, qi) => {
                        const qprefix = `${prefix}.questions[${qi}]`;

                        if (!q.id || typeof q.id !== 'string') {
                            errors.push(`${qprefix}.id is required and must be a string`);
                        } else if (questionIds.has(q.id)) {
                            errors.push(`${qprefix}.id "${q.id}" is duplicate`);
                        } else {
                            questionIds.add(q.id);
                        }

                        if (!q.text || typeof q.text !== 'string') {
                            errors.push(`${qprefix}.text is required and must be a string`);
                        }

                        if (!q.options || !Array.isArray(q.options) || q.options.length < 2) {
                            errors.push(`${qprefix}.options must have at least 2 options`);
                        } else {
                            q.options.forEach((opt, oi) => {
                                if (typeof opt.score !== 'number') {
                                    errors.push(`${qprefix}.options[${oi}].score must be a number`);
                                }
                                if (!opt.text || typeof opt.text !== 'string') {
                                    errors.push(`${qprefix}.options[${oi}].text is required`);
                                }
                            });
                        }
                    });
                }
            });

            // Check weights sum
            if (Math.abs(totalWeight - 1.0) > 0.01) {
                warnings.push(`Domain weights sum to ${totalWeight.toFixed(3)}, expected ~1.0`);
            }
        }

        return { valid: errors.length === 0, errors, warnings };
    }

    // --- MAIN SETTINGS LOGIC ---

    // Entry point - register for settings page load
    spiraAppManager.registerEvent_windowLoad(initSettingsPage);

    function initSettingsPage() {
        injectStyles();
        settingsLog("initSettingsPage called", {});

        const productId = spiraAppManager.projectId;
        settingsLog("Product ID", { productId: productId });

        // Find our settings container (lowercase GUID)
        const containerId = APP_GUID.toLowerCase() + "_content";
        let container = document.getElementById(containerId);

        // Fallback: try uppercase
        if (!container) {
            container = document.getElementById(APP_GUID + "_content");
        }

        // Fallback: scan for any element with our GUID
        if (!container) {
            const allWithGuid = document.querySelectorAll('[id*="' + APP_GUID.toLowerCase() + '"]');
            if (allWithGuid.length > 0) {
                container = allWithGuid[0];
            }
        }

        settingsLog("Container lookup", { found: !!container, id: container ? container.id : null });

        if (!container) {
            settingsLog("ERROR: Settings container not found", {});
            return;
        }

        window.DMM_SETTINGS_CONTAINER_ID = container.id;

        renderSettingsPage(container, productId);
    }

    function renderSettingsPage(container, productId) {
        settingsLog("renderSettingsPage called", { productId: productId });

        const html = `
<div class="dmm-settings">
    <h2>DevOps Maturity Assessment Settings</h2>

    <div class="dmm-info-box">
        <p><strong>Custom Framework Configuration</strong></p>
        <p>Upload a custom assessment framework to replace the default DevOps Maturity Model questions.</p>
        <p>The framework must be valid JSON following the required schema.</p>
    </div>

    <div id="dmm-current-status" class="dmm-settings-section">
        <h3>Current Framework Status</h3>
        <div id="dmm-framework-status">Loading...</div>
    </div>

    <div class="dmm-settings-section">
        <h3>Upload Custom Framework</h3>
        <p>Paste your framework JSON below or load from a file:</p>

        <div class="dmm-file-input">
            <input type="file" id="dmm-file-input" accept=".json" />
        </div>

        <textarea id="dmm-framework-json" class="dmm-textarea" placeholder='{
    "meta": {
        "name": "My Custom Assessment",
        "description": "Custom assessment framework",
        "version": "1.0"
    },
    "domains": [
        {
            "id": "domain1",
            "name": "Domain Name",
            "weight": 1.0,
            "questions": [
                {
                    "id": "Q1",
                    "text": "Question text?",
                    "options": [
                        { "score": 0, "text": "Option 1" },
                        { "score": 1, "text": "Option 2" },
                        { "score": 2, "text": "Option 3" }
                    ]
                }
            ]
        }
    ]
}'></textarea>

        <div>
            <button id="dmm-btn-validate" class="dmm-btn dmm-btn-secondary">Validate JSON</button>
            <button id="dmm-btn-save" class="dmm-btn" disabled>Save Framework</button>
            <button id="dmm-btn-clear" class="dmm-btn dmm-btn-danger">Clear Custom Framework</button>
        </div>

        <div id="dmm-validation-status"></div>
    </div>
</div>
`;

        container.innerHTML = html;

        // Bind events
        bindSettingsEvents(productId);

        // Load current framework status
        loadCurrentFramework(productId);
    }

    function bindSettingsEvents(productId) {
        // File input
        const fileInput = document.getElementById('dmm-file-input');
        if (fileInput) {
            fileInput.addEventListener('change', function (e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (ev) {
                        document.getElementById('dmm-framework-json').value = ev.target.result;
                        settingsLog("File loaded", { filename: file.name });
                    };
                    reader.readAsText(file);
                }
            });
        }

        // Validate button
        const btnValidate = document.getElementById('dmm-btn-validate');
        if (btnValidate) {
            btnValidate.addEventListener('click', function () {
                validateCurrentInput();
            });
        }

        // Save button
        const btnSave = document.getElementById('dmm-btn-save');
        if (btnSave) {
            btnSave.addEventListener('click', function () {
                saveFramework(productId);
            });
        }

        // Clear button
        const btnClear = document.getElementById('dmm-btn-clear');
        if (btnClear) {
            btnClear.addEventListener('click', function () {
                clearFramework(productId);
            });
        }
    }

    function loadCurrentFramework(productId) {
        settingsLog("loadCurrentFramework called", { productId: productId });

        const statusDiv = document.getElementById('dmm-framework-status');

        // Use 6-param signature (include pluginName!)
        spiraAppManager.storageGetProduct(
            APP_GUID,
            APP_NAME,
            CUSTOM_FRAMEWORK_KEY,
            productId,
            function (data) {
                settingsLog("loadCurrentFramework SUCCESS", { hasData: !!data });

                if (data && data !== "") {
                    try {
                        const framework = JSON.parse(data);
                        displayCurrentFramework(framework);
                    } catch (e) {
                        settingsLog("Error parsing stored framework", { error: e.message });
                        statusDiv.innerHTML = '<p class="dmm-status error">Error parsing stored framework. You may need to clear and re-upload.</p>';
                    }
                } else {
                    displayNoFramework();
                }
            },
            function (err) {
                // Expected on first run - no custom framework saved yet
                settingsLog("loadCurrentFramework FAILED (expected if no custom framework)", { error: err });
                displayNoFramework();
            }
        );
    }

    function displayNoFramework() {
        const statusDiv = document.getElementById('dmm-framework-status');
        statusDiv.innerHTML = `
            <div class="dmm-status info">
                <strong>No custom framework configured.</strong><br>
                Using default DevOps Maturity Model (20 questions, 3 domains).
            </div>
        `;
    }

    function displayCurrentFramework(framework) {
        const statusDiv = document.getElementById('dmm-framework-status');
        const meta = framework.meta || {};
        const domains = framework.domains || [];

        let questionCount = 0;
        domains.forEach(d => {
            questionCount += (d.questions || []).length;
        });

        statusDiv.innerHTML = `
            <div class="dmm-current-framework">
                <h4>Custom Framework Active</h4>
                <dl class="dmm-framework-meta">
                    <dt>Name:</dt>
                    <dd>${escapeHtml(meta.name || 'Unnamed')}</dd>
                    <dt>Description:</dt>
                    <dd>${escapeHtml(meta.description || 'No description')}</dd>
                    <dt>Version:</dt>
                    <dd>${escapeHtml(meta.version || 'N/A')}</dd>
                    <dt>Domains:</dt>
                    <dd>${domains.length}</dd>
                    <dt>Questions:</dt>
                    <dd>${questionCount}</dd>
                </dl>
            </div>
        `;

        // Update section styling
        document.getElementById('dmm-current-status').classList.add('success');
    }

    function validateCurrentInput() {
        const textarea = document.getElementById('dmm-framework-json');
        const statusDiv = document.getElementById('dmm-validation-status');
        const btnSave = document.getElementById('dmm-btn-save');

        const jsonText = textarea.value.trim();

        if (!jsonText) {
            statusDiv.innerHTML = '<div class="dmm-status error">Please enter JSON to validate.</div>';
            btnSave.disabled = true;
            return null;
        }

        let framework;
        try {
            framework = JSON.parse(jsonText);
        } catch (e) {
            statusDiv.innerHTML = `<div class="dmm-status error"><strong>Invalid JSON:</strong> ${escapeHtml(e.message)}</div>`;
            btnSave.disabled = true;
            settingsLog("JSON parse error", { error: e.message });
            return null;
        }

        const result = validateFramework(framework);

        let html = '';

        if (result.valid) {
            html = '<div class="dmm-status success"><strong>Validation passed!</strong>';

            if (result.warnings.length > 0) {
                html += '<ul class="dmm-validation-list">';
                result.warnings.forEach(w => {
                    html += `<li style="color: #856404;">Warning: ${escapeHtml(w)}</li>`;
                });
                html += '</ul>';
            }

            // Show summary
            const domains = framework.domains || [];
            let questionCount = 0;
            domains.forEach(d => {
                questionCount += (d.questions || []).length;
            });

            html += `<p>Framework "${escapeHtml(framework.meta.name)}" - ${domains.length} domains, ${questionCount} questions.</p>`;
            html += '</div>';

            btnSave.disabled = false;
        } else {
            html = '<div class="dmm-status error"><strong>Validation failed:</strong>';
            html += '<ul class="dmm-validation-list">';
            result.errors.forEach(e => {
                html += `<li class="invalid">${escapeHtml(e)}</li>`;
            });
            html += '</ul></div>';

            btnSave.disabled = true;
        }

        statusDiv.innerHTML = html;
        settingsLog("Validation result", { valid: result.valid, errors: result.errors.length, warnings: result.warnings.length });

        return result.valid ? framework : null;
    }

    function saveFramework(productId) {
        settingsLog("saveFramework called", { productId: productId });

        const framework = validateCurrentInput();
        if (!framework) {
            return;
        }

        const btnSave = document.getElementById('dmm-btn-save');
        const statusDiv = document.getElementById('dmm-validation-status');

        btnSave.disabled = true;
        btnSave.innerHTML = 'Saving...';

        const jsonData = JSON.stringify(framework);

        // Try update first, then insert if fails (7-param signature with APP_NAME)
        spiraAppManager.storageUpdateProduct(
            APP_GUID,
            APP_NAME,
            CUSTOM_FRAMEWORK_KEY,
            jsonData,
            productId,
            function () {
                settingsLog("storageUpdateProduct SUCCESS", {});
                onSaveSuccess(framework);
            },
            function (err) {
                settingsLog("storageUpdateProduct FAILED, trying insert", { error: err });

                // Insert new (8-param signature with APP_NAME)
                spiraAppManager.storageInsertProduct(
                    APP_GUID,
                    APP_NAME,
                    CUSTOM_FRAMEWORK_KEY,
                    jsonData,
                    productId,
                    false, // isSecure
                    function () {
                        settingsLog("storageInsertProduct SUCCESS", {});
                        onSaveSuccess(framework);
                    },
                    function (e) {
                        settingsLog("storageInsertProduct FAILED", { error: e });
                        statusDiv.innerHTML = `<div class="dmm-status error">Failed to save: ${escapeHtml(String(e))}</div>`;
                        btnSave.disabled = false;
                        btnSave.innerHTML = 'Save Framework';
                    }
                );
            }
        );
    }

    function onSaveSuccess(framework) {
        const btnSave = document.getElementById('dmm-btn-save');
        const statusDiv = document.getElementById('dmm-validation-status');

        statusDiv.innerHTML = '<div class="dmm-status success"><strong>Framework saved successfully!</strong> The assessment widget will now use your custom framework.</div>';
        btnSave.innerHTML = 'Save Framework';
        btnSave.disabled = true; // Keep disabled until next validation

        // Update current framework display
        displayCurrentFramework(framework);
    }

    function clearFramework(productId) {
        if (!confirm('Are you sure you want to clear the custom framework?\n\nThe assessment will revert to the default DevOps Maturity Model.')) {
            return;
        }

        settingsLog("clearFramework called", { productId: productId });

        const statusDiv = document.getElementById('dmm-validation-status');

        // Delete by saving empty string (or use delete API if available)
        // Note: storageUpdateProduct with empty value effectively clears
        spiraAppManager.storageUpdateProduct(
            APP_GUID,
            APP_NAME,
            CUSTOM_FRAMEWORK_KEY,
            "",
            productId,
            function () {
                settingsLog("clearFramework SUCCESS", {});
                statusDiv.innerHTML = '<div class="dmm-status success">Custom framework cleared. Using default assessment.</div>';
                displayNoFramework();
                document.getElementById('dmm-current-status').classList.remove('success');
            },
            function (err) {
                settingsLog("clearFramework FAILED", { error: err });
                // May fail if key doesn't exist - that's fine
                statusDiv.innerHTML = '<div class="dmm-status info">No custom framework to clear.</div>';
                displayNoFramework();
            }
        );
    }

    // --- UTILITY ---

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

})(); // End IIFE
