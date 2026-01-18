// DevOps Maturity Model SpiraApp - Product Admin Settings Page
// Handles custom framework upload, validation, and management

(function () {
    // --- CONSTANTS ---
    const APP_GUID = "4B8D9721-6A99-4786-903D-9346739A0673";
    const APP_NAME = "DevOpsMaturityAssessment";
    const CUSTOM_FRAMEWORK_KEY = "custom_framework";

    // JSON template for download (embedded to avoid file reference issues)
    const TEMPLATE_JSON = {
        "meta": {
            "name": "My Custom Assessment",
            "description": "Description of your assessment purpose and what it measures",
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
                        "guidance": "Score 0 = None/Unknown | Score 1 = Initial/Ad-hoc | Score 2 = Developing | Score 3 = Defined | Score 4 = Managed | Score 5 = Optimizing",
                        "order": 1
                    }
                ]
            },
            {
                "id": "domain2",
                "name": "Second Domain",
                "description": "Description of your second domain",
                "weight": 0.35,
                "order": 2,
                "questions": [
                    {
                        "id": "Q2",
                        "text": "Question for domain 2?",
                        "guidance": "Score 0 = ... | Score 1 = ... | Score 2 = ... | Score 3 = ... | Score 4 = ... | Score 5 = ...",
                        "order": 1
                    }
                ]
            },
            {
                "id": "domain3",
                "name": "Third Domain",
                "description": "Description of your third domain",
                "weight": 0.30,
                "order": 3,
                "questions": [
                    {
                        "id": "Q3",
                        "text": "Question for domain 3?",
                        "guidance": "Score 0 = ... | Score 1 = ... | Score 2 = ... | Score 3 = ... | Score 4 = ... | Score 5 = ...",
                        "order": 1
                    }
                ]
            }
        ]
    };

    // --- STATE ---
    let pendingFramework = null;
    let currentFramework = null;

    // --- SIMPLE TEMPLATE FUNCTION (Mustache not available on settings pages) ---
    function renderTemplate(template, data) {
        // Simple {{key}} replacement since Mustache is not available on settings pages
        let result = template;
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const regex = new RegExp('\\{\\{' + key + '\\}\\}', 'g');
                result = result.replace(regex, data[key] !== undefined ? data[key] : '');
            }
        }
        return result;
    }

    // --- TEMPLATES ---
    const TPL_SETTINGS = `
<div class="dmm-settings">
    <h3>Custom Assessment Framework</h3>
    
    <div class="dmm-settings-section">
        <h4>Current Framework</h4>
        <div id="dmm-current-status"></div>
    </div>

    <div class="dmm-settings-section">
        <h4>Upload Custom Framework</h4>
        <p>Upload a JSON file to replace the default assessment questions with your own custom framework.</p>
        
        <div class="dmm-upload-area" id="dmm-upload-area">
            <input type="file" id="dmm-file-input" accept=".json,application/json">
            <p>
                <i class="fa-light fa-cloud-arrow-up" style="font-size: 2em; color: #007bff;"></i>
            </p>
            <label class="dmm-upload-label" for="dmm-file-input">
                Click to select a JSON file or drag and drop
            </label>
        </div>
        
        <div id="dmm-preview-area"></div>
        <div id="dmm-error-area"></div>
    </div>

    <div class="dmm-settings-section">
        <h4>Download Template</h4>
        <p>Download a blank template JSON file to get started with creating your custom assessment.</p>
        <button id="btn-download-template" class="dmm-btn dmm-btn-secondary">
            <i class="fa-light fa-download"></i> Download Template
        </button>
    </div>
</div>
`;

    const TPL_CURRENT_DEFAULT = `
<div class="dmm-current-framework default">
    <strong>Default Framework</strong>
    <span class="dmm-framework-badge default">Built-in</span>
    <p style="margin-top: 10px; margin-bottom: 0;">Using the built-in DevOps Maturity assessment with 20 questions across 3 domains.</p>
</div>
`;

    const TPL_CURRENT_CUSTOM = `
<div class="dmm-current-framework">
    <strong>{{name}}</strong>
    <span class="dmm-framework-badge custom">Custom</span>
    <p style="margin-top: 10px; margin-bottom: 5px;">{{description}}</p>
    <small>{{domainCount}} domains, {{questionCount}} questions</small>
    <div style="margin-top: 15px;">
        <button id="btn-clear-framework" class="dmm-btn dmm-btn-danger">
            <i class="fa-light fa-trash"></i> Remove Custom Framework
        </button>
    </div>
</div>
`;

    const TPL_PREVIEW = `
<div class="dmm-preview">
    <h5>Preview: {{name}}</h5>
    <p style="color: #666;">{{description}}</p>
    <div class="dmm-preview-details">
        <div class="dmm-preview-item">
            <span class="value">{{domainCount}}</span>
            <span class="label">Domains</span>
        </div>
        <div class="dmm-preview-item">
            <span class="value">{{questionCount}}</span>
            <span class="label">Questions</span>
        </div>
        <div class="dmm-preview-item">
            <span class="value">v{{version}}</span>
            <span class="label">Version</span>
        </div>
    </div>
    <div class="dmm-actions">
        <button id="btn-save-framework" class="dmm-btn dmm-btn-success">
            <i class="fa-light fa-save"></i> Save Framework
        </button>
        <button id="btn-cancel-upload" class="dmm-btn dmm-btn-secondary">
            Cancel
        </button>
    </div>
</div>
`;

    // --- INIT ---
    spiraAppManager.registerEvent_windowLoad(initSettings);

    function initSettings() {
        console.log("[DMM-Settings] ========== INITIALIZING SETTINGS PAGE ==========");
        console.log("[DMM-Settings] APP_GUID:", APP_GUID);
        console.log("[DMM-Settings] Current Page ID:", spiraAppManager.pageId);
        console.log("[DMM-Settings] Project ID:", spiraAppManager.projectId);
        console.log("[DMM-Settings] User ID:", spiraAppManager.userId);
        console.log("[DMM-Settings] SpiraAppManager available:", typeof spiraAppManager);
        renderSettingsPage();
    }

    function renderSettingsPage() {
        console.log("[DMM-Settings] === RENDER SETTINGS PAGE START ===");

        // Find the container - on SpiraApp Product Admin page, we inject into the content area
        // The SpiraApp injects content after any existing product settings
        const containers = document.querySelectorAll('[id*="' + APP_GUID + '"]');
        console.log("[DMM-Settings] Found elements with GUID in ID:", containers.length);
        containers.forEach(function (el, idx) {
            console.log("[DMM-Settings]   [" + idx + "] Element:", el.tagName, "ID:", el.id, "Class:", el.className);
        });

        let container = null;

        // Look for content container
        containers.forEach(function (el) {
            if (el.id && el.id.toLowerCase().includes('content')) {
                console.log("[DMM-Settings] Found GUID content container:", el.id);
                container = el;
            }
        });

        // Fallback: look for any element with our GUID
        if (!container && containers.length > 0) {
            console.log("[DMM-Settings] No GUID content container, using first GUID element");
            container = containers[0];
        }

        // If still not found, try the pageContents approach
        if (!container) {
            console.log("[DMM-Settings] No GUID containers found, searching for .spiraapp-settings or .product-spiraapp-details");
            const settingsAreas = document.querySelectorAll('.spiraapp-settings, .product-spiraapp-details');
            console.log("[DMM-Settings] Found settings areas:", settingsAreas.length);

            if (settingsAreas.length > 0) {
                // Create our own container
                container = document.createElement('div');
                container.id = APP_GUID + '_settings_content';
                settingsAreas[0].appendChild(container);
                console.log("[DMM-Settings] Created new container and appended to settings area");
            }
        }

        // Last resort: search document for any reasonable place to inject
        if (!container) {
            console.log("[DMM-Settings] Still no container, searching for common page sections...");
            const possibleParents = document.querySelectorAll('#cplMainContent, [id*="content"], main, .container, .content');
            console.log("[DMM-Settings] Found possible parent containers:", possibleParents.length);

            if (possibleParents.length > 0) {
                container = document.createElement('div');
                container.id = APP_GUID + '_settings_content';
                possibleParents[0].appendChild(container);
                console.log("[DMM-Settings] Created container and appended to:", possibleParents[0].id || possibleParents[0].className);
            }
        }

        if (!container) {
            console.error("[DMM-Settings] *** CRITICAL: No container found! May not be on the SpiraApp Product Admin page ***");
            console.error("[DMM-Settings] Document head:", document.head.innerHTML.substring(0, 200));
            console.error("[DMM-Settings] Body class:", document.body.className);
            console.error("[DMM-Settings] Body ID:", document.body.id);
            return;
        }

        console.log("[DMM-Settings] Rendering to container:", container.id, "Tag:", container.tagName);
        container.innerHTML = TPL_SETTINGS;
        console.log("[DMM-Settings] Settings HTML injected successfully");

        // Load current framework status
        loadCurrentFramework();

        // Bind events
        bindEvents();

        console.log("[DMM-Settings] === RENDER SETTINGS PAGE COMPLETE ===");
    }

    function loadCurrentFramework() {
        const productId = spiraAppManager.projectId;
        console.log("[DMM-Settings] Loading current framework for product:", productId);

        spiraAppManager.storageGetProduct(
            APP_GUID,
            APP_NAME,
            CUSTOM_FRAMEWORK_KEY,
            productId,
            function (data) {
                console.log("[DMM-Settings] storageGetProduct SUCCESS - Data received:", data ? "Yes (" + data.length + " chars)" : "null/empty");
                if (data && data !== "") {
                    try {
                        currentFramework = JSON.parse(data);
                        console.log("[DMM-Settings] Successfully parsed stored framework:", currentFramework.meta.name);
                        renderCurrentStatus(currentFramework);
                    } catch (e) {
                        console.error("[DMM-Settings] ERROR parsing stored framework:", e.message);
                        renderCurrentStatus(null);
                    }
                } else {
                    console.log("[DMM-Settings] No stored framework data (expected on first use)");
                    renderCurrentStatus(null);
                }
            },
            function (err) {
                // Expected on first use - no custom framework set
                console.log("[DMM-Settings] storageGetProduct ERROR (expected on first use):", err ? err.message : "Unknown error");
                renderCurrentStatus(null);
            }
        );
    }

    function renderCurrentStatus(framework) {
        const statusEl = document.getElementById('dmm-current-status');
        console.log("[DMM-Settings] renderCurrentStatus called - Framework provided:", framework ? "Yes" : "No", "Status element found:", statusEl ? "Yes" : "No");

        if (!statusEl) {
            console.warn("[DMM-Settings] WARNING: dmm-current-status element not found!");
            return;
        }

        if (framework && framework.meta) {
            const questionCount = countQuestions(framework);
            console.log("[DMM-Settings] Rendering CUSTOM framework:", framework.meta.name, "Domains:", framework.domains ? framework.domains.length : 0, "Questions:", questionCount);
            const html = renderTemplate(TPL_CURRENT_CUSTOM, {
                name: framework.meta.name,
                description: framework.meta.description || '',
                domainCount: framework.domains ? framework.domains.length : 0,
                questionCount: questionCount
            });
            statusEl.innerHTML = html;

            // Bind clear button
            const btnClear = document.getElementById('btn-clear-framework');
            if (btnClear) {
                console.log("[DMM-Settings] Binding clear framework button");
                btnClear.addEventListener('click', clearFramework);
            } else {
                console.warn("[DMM-Settings] WARNING: btn-clear-framework button not found!");
            }
        } else {
            console.log("[DMM-Settings] Rendering DEFAULT framework (no custom framework found)");
            statusEl.innerHTML = TPL_CURRENT_DEFAULT;
        }
    }

    function bindEvents() {
        console.log("[DMM-Settings] Binding events to form elements");

        // File input change
        const fileInput = document.getElementById('dmm-file-input');
        if (fileInput) {
            console.log("[DMM-Settings] Found dmm-file-input, binding change event");
            fileInput.addEventListener('change', handleFileSelect);
        } else {
            console.warn("[DMM-Settings] WARNING: dmm-file-input not found!");
        }

        // Download template
        const btnDownload = document.getElementById('btn-download-template');
        if (btnDownload) {
            console.log("[DMM-Settings] Found btn-download-template, binding click event");
            btnDownload.addEventListener('click', downloadTemplate);
        } else {
            console.warn("[DMM-Settings] WARNING: btn-download-template not found!");
        }

        // Drag and drop
        const uploadArea = document.getElementById('dmm-upload-area');
        if (uploadArea) {
            console.log("[DMM-Settings] Found dmm-upload-area, binding drag/drop events");
            uploadArea.addEventListener('dragover', function (e) {
                e.preventDefault();
                e.stopPropagation();
                uploadArea.style.borderColor = '#007bff';
                uploadArea.style.backgroundColor = '#f0f7ff';
            });

            uploadArea.addEventListener('dragleave', function (e) {
                e.preventDefault();
                e.stopPropagation();
                uploadArea.style.borderColor = '#ccc';
                uploadArea.style.backgroundColor = '';
            });

            uploadArea.addEventListener('drop', function (e) {
                e.preventDefault();
                e.stopPropagation();
                uploadArea.style.borderColor = '#ccc';
                uploadArea.style.backgroundColor = '';

                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    processFile(files[0]);
                }
            });
        } else {
            console.warn("[DMM-Settings] WARNING: dmm-upload-area not found!");
        }

        console.log("[DMM-Settings] Event binding complete");
    }

    function handleFileSelect(e) {
        const file = e.target.files[0];
        console.log("[DMM-Settings] handleFileSelect triggered - File selected:", file ? file.name : "None");
        if (file) {
            processFile(file);
        }
    }

    function processFile(file) {
        console.log("[DMM-Settings] Processing file:", file.name, "Size:", file.size, "bytes");

        // Clear previous states
        clearError();
        clearPreview();

        if (!file.name.endsWith('.json')) {
            showError('Please select a JSON file (.json extension)');
            return;
        }

        const reader = new FileReader();

        reader.onload = function (e) {
            try {
                console.log("[DMM-Settings] FileReader onload triggered");
                const content = e.target.result;
                console.log("[DMM-Settings] File content length:", content.length, "chars");

                const framework = JSON.parse(content);
                console.log("[DMM-Settings] JSON parsed successfully. Framework name:", framework.meta ? framework.meta.name : "NO META");

                // Validate
                console.log("[DMM-Settings] Starting framework validation...");
                const validation = validateFramework(framework);
                console.log("[DMM-Settings] Validation result - Valid:", validation.valid, "Errors:", validation.errors.length);

                if (!validation.valid) {
                    console.warn("[DMM-Settings] Validation FAILED:", validation.errors);
                    showError('Invalid framework: ' + validation.errors.join(', '));
                    return;
                }

                console.log("[DMM-Settings] Validation PASSED, showing preview...");
                // Show preview
                pendingFramework = framework;
                showPreview(framework);

            } catch (err) {
                console.error("[DMM-Settings] ERROR in file processing:", err.name, err.message);
                console.error("[DMM-Settings] Error stack:", err.stack);
                showError('Invalid JSON file: ' + err.message);
            }
        };

        reader.onerror = function () {
            showError('Error reading file');
        };

        reader.readAsText(file);
    }

    function validateFramework(framework) {
        const errors = [];

        // Check meta
        if (!framework.meta) {
            errors.push('Missing "meta" section');
        } else {
            if (!framework.meta.name || framework.meta.name.trim() === '') {
                errors.push('Missing framework name (meta.name)');
            }
        }

        // Check domains
        if (!framework.domains || !Array.isArray(framework.domains)) {
            errors.push('Missing or invalid "domains" array');
        } else if (framework.domains.length === 0) {
            errors.push('At least one domain is required');
        } else {
            // Validate each domain
            let totalWeight = 0;
            framework.domains.forEach(function (domain, idx) {
                if (!domain.id) {
                    errors.push('Domain ' + (idx + 1) + ' missing "id"');
                }
                if (!domain.name) {
                    errors.push('Domain ' + (idx + 1) + ' missing "name"');
                }
                if (typeof domain.weight !== 'number') {
                    errors.push('Domain ' + (idx + 1) + ' missing or invalid "weight"');
                } else {
                    totalWeight += domain.weight;
                }
                if (!domain.questions || !Array.isArray(domain.questions) || domain.questions.length === 0) {
                    errors.push('Domain "' + (domain.name || idx + 1) + '" has no questions');
                } else {
                    // Validate questions
                    domain.questions.forEach(function (q, qIdx) {
                        if (!q.id) {
                            errors.push('Question ' + (qIdx + 1) + ' in "' + domain.name + '" missing "id"');
                        }
                        if (!q.text) {
                            errors.push('Question ' + (qIdx + 1) + ' in "' + domain.name + '" missing "text"');
                        }
                    });
                }
            });

            // Warn if weights don't add up to 1
            if (Math.abs(totalWeight - 1.0) > 0.01) {
                errors.push('Domain weights should sum to 1.0 (currently: ' + totalWeight.toFixed(2) + ')');
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    function countQuestions(framework) {
        let count = 0;
        if (framework.domains) {
            framework.domains.forEach(function (domain) {
                if (domain.questions) {
                    count += domain.questions.length;
                }
            });
        }
        return count;
    }

    function showPreview(framework) {
        const previewArea = document.getElementById('dmm-preview-area');
        if (!previewArea) {
            console.warn("[DMM-Settings] WARNING: dmm-preview-area element not found!");
            return;
        }

        console.log("[DMM-Settings] Showing preview for framework:", framework.meta.name);
        const html = renderTemplate(TPL_PREVIEW, {
            name: framework.meta.name,
            description: framework.meta.description || '',
            domainCount: framework.domains.length,
            questionCount: countQuestions(framework),
            version: framework.meta.version || '1.0'
        });

        previewArea.innerHTML = html;
        console.log("[DMM-Settings] Preview HTML injected successfully");

        // Bind preview buttons
        const btnSave = document.getElementById('btn-save-framework');
        if (btnSave) {
            btnSave.addEventListener('click', saveFramework);
        }

        const btnCancel = document.getElementById('btn-cancel-upload');
        if (btnCancel) {
            btnCancel.addEventListener('click', function () {
                clearPreview();
                pendingFramework = null;
            });
        }
    }

    function clearPreview() {
        const previewArea = document.getElementById('dmm-preview-area');
        if (previewArea) {
            previewArea.innerHTML = '';
        }
    }

    function showError(message) {
        const errorArea = document.getElementById('dmm-error-area');
        if (errorArea) {
            errorArea.innerHTML = '<div class="dmm-error"><i class="fa-light fa-triangle-exclamation"></i> ' + message + '</div>';
        }
    }

    function clearError() {
        const errorArea = document.getElementById('dmm-error-area');
        if (errorArea) {
            errorArea.innerHTML = '';
        }
    }

    function saveFramework() {
        if (!pendingFramework) {
            showError('No framework to save');
            return;
        }

        const productId = spiraAppManager.projectId;
        const jsonStr = JSON.stringify(pendingFramework);

        console.log("DMM Settings: Saving framework for product", productId);

        const btnSave = document.getElementById('btn-save-framework');
        if (btnSave) {
            btnSave.disabled = true;
            btnSave.innerHTML = '<i class="fa-light fa-spinner fa-spin"></i> Saving...';
        }

        // Try update first, then insert if not exists
        spiraAppManager.storageUpdateProduct(
            APP_GUID,
            APP_NAME,
            CUSTOM_FRAMEWORK_KEY,
            jsonStr,
            productId,
            function () {
                console.log("DMM Settings: Framework saved (update)");
                onSaveSuccess();
            },
            function (err) {
                console.log("DMM Settings: Update failed, trying insert", err);
                // Try insert
                spiraAppManager.storageInsertProduct(
                    APP_GUID,
                    APP_NAME,
                    CUSTOM_FRAMEWORK_KEY,
                    jsonStr,
                    productId,
                    false, // isSecure
                    function () {
                        console.log("DMM Settings: Framework saved (insert)");
                        onSaveSuccess();
                    },
                    function (insertErr) {
                        console.log("DMM Settings: Insert also failed", insertErr);
                        showError('Failed to save framework: ' + (insertErr.message || 'Unknown error'));
                        if (btnSave) {
                            btnSave.disabled = false;
                            btnSave.innerHTML = '<i class="fa-light fa-save"></i> Save Framework';
                        }
                    }
                );
            }
        );
    }

    function onSaveSuccess() {
        currentFramework = pendingFramework;
        pendingFramework = null;
        clearPreview();
        clearError();

        // Show success message
        spiraAppManager.displaySuccessMessage('Custom framework saved successfully! The widget will now use your custom questions.');

        // Refresh current status display
        renderCurrentStatus(currentFramework);

        // Clear the file input
        const fileInput = document.getElementById('dmm-file-input');
        if (fileInput) {
            fileInput.value = '';
        }
    }

    function clearFramework() {
        const productId = spiraAppManager.projectId;

        spiraAppManager.displayConfirmation(
            'Are you sure you want to remove the custom framework? The widget will revert to using the default DevOps Maturity questions.',
            function () {
                console.log("DMM Settings: Clearing custom framework");

                // Delete the storage entry by saving empty string
                spiraAppManager.storageUpdateProduct(
                    APP_GUID,
                    APP_NAME,
                    CUSTOM_FRAMEWORK_KEY,
                    "",
                    productId,
                    function () {
                        console.log("DMM Settings: Framework cleared");
                        currentFramework = null;
                        renderCurrentStatus(null);
                        spiraAppManager.displaySuccessMessage('Custom framework removed. The widget will now use the default questions.');
                    },
                    function (err) {
                        console.log("DMM Settings: Error clearing framework", err);
                        spiraAppManager.displayErrorMessage('Failed to remove framework');
                    }
                );
            }
        );
    }

    function downloadTemplate() {
        const jsonStr = JSON.stringify(TEMPLATE_JSON, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'assessment-template.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log("DMM Settings: Template downloaded");
    }

})();
