// DevOps Maturity Model SpiraApp - Product Admin Settings Page
// Handles custom framework upload, validation, and management
// Note: Mustache is NOT available on settings pages - uses simple template rendering

(function () {
    'use strict';

    var APP_NAME = 'DevOpsMaturityAssessment';
    var CUSTOM_FRAMEWORK_KEY = 'custom_framework';

    var SETTINGS_STYLES = 'file://settings.css';

    // JSON template for download
    var TEMPLATE_JSON = {
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
                        "guidance": "Score 0 = None | Score 1 = Initial | Score 2 = Developing | Score 3 = Defined | Score 4 = Managed | Score 5 = Optimizing",
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

    // State
    var pendingFramework = null;
    var currentFramework = null;

    // Simple template renderer (no Mustache on settings pages)
    function renderTemplate(template, data) {
        var result = template;
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                var regex = new RegExp('\\{\\{' + key + '\\}\\}', 'g');
                result = result.replace(regex, data[key] !== undefined ? data[key] : '');
            }
        }
        return result;
    }

    // Templates
    var TPL_SETTINGS = [
        '<div class="dmm-settings">',
        '<h3>Custom Assessment Framework</h3>',
        '<div class="dmm-settings-section">',
            '<h4>Current Framework</h4>',
            '<div id="dmm-current-status"></div>',
        '</div>',
        '<div class="dmm-settings-section">',
            '<h4>Upload Custom Framework</h4>',
            '<p>Upload a JSON file to replace the default assessment questions with your own custom framework.</p>',
            '<div class="dmm-upload-area" id="dmm-upload-area">',
                '<input type="file" id="dmm-file-input" accept=".json,application/json">',
                '<p><i class="fa-light fa-cloud-arrow-up" style="font-size: 2em; color: #2563EB;"></i></p>',
                '<label class="dmm-upload-label" for="dmm-file-input">Click to select a JSON file or drag and drop</label>',
            '</div>',
            '<div id="dmm-preview-area"></div>',
            '<div id="dmm-error-area"></div>',
        '</div>',
        '<div class="dmm-settings-section">',
            '<h4>Download Template</h4>',
            '<p>Download a blank template JSON file to get started with creating your custom assessment.</p>',
            '<button id="btn-download-template" class="dmm-btn dmm-btn-secondary">',
                '<i class="fa-light fa-download"></i> Download Template',
            '</button>',
        '</div>',
        '</div>'
    ].join('\n');

    var TPL_CURRENT_DEFAULT = [
        '<div class="dmm-current-framework">',
        '<strong>Default Framework</strong>',
        '<span class="dmm-framework-badge default">Built-in</span>',
        '<p style="margin-top:10px;margin-bottom:0">Using the built-in DevOps Maturity assessment with 20 questions across 3 domains.</p>',
        '</div>'
    ].join('');

    var TPL_CURRENT_CUSTOM = [
        '<div class="dmm-current-framework">',
        '<strong>{{name}}</strong>',
        '<span class="dmm-framework-badge custom">Custom</span>',
        '<p style="margin-top:10px;margin-bottom:5px">{{description}}</p>',
        '<small>{{domainCount}} domains, {{questionCount}} questions</small>',
        '<div style="margin-top:15px">',
            '<button id="btn-clear-framework" class="dmm-btn dmm-btn-danger"><i class="fa-light fa-trash"></i> Remove Custom Framework</button>',
        '</div>',
        '</div>'
    ].join('');

    var TPL_PREVIEW = [
        '<div class="dmm-preview">',
        '<h5>Preview: {{name}}</h5>',
        '<p style="color:#666">{{description}}</p>',
        '<div class="dmm-preview-details">',
            '<div class="dmm-preview-item"><span class="value">{{domainCount}}</span><span class="label">Domains</span></div>',
            '<div class="dmm-preview-item"><span class="value">{{questionCount}}</span><span class="label">Questions</span></div>',
            '<div class="dmm-preview-item"><span class="value">v{{version}}</span><span class="label">Version</span></div>',
        '</div>',
        '<div class="dmm-actions">',
            '<button id="btn-save-framework" class="dmm-btn dmm-btn-success"><i class="fa-light fa-save"></i> Save Framework</button>',
            '<button id="btn-cancel-upload" class="dmm-btn dmm-btn-secondary">Cancel</button>',
        '</div>',
        '</div>'
    ].join('');

    // Style injection
    function injectStyles() {
        if (document.getElementById('dmm-settings-styles')) return;
        if (SETTINGS_STYLES.length < 50) return;
        var s = document.createElement('style');
        s.id = 'dmm-settings-styles';
        // Package generator base64-encodes CSS when embedded in JS files
        try { s.textContent = atob(SETTINGS_STYLES); } catch (e) { s.textContent = SETTINGS_STYLES; }
        document.head.appendChild(s);
    }

    // Find container element
    function findContainer() {
        // Look for GUID-based content container
        var containers = document.querySelectorAll('[id*="' + APP_GUID + '"]');
        for (var i = 0; i < containers.length; i++) {
            if (containers[i].id && containers[i].id.toLowerCase().indexOf('content') >= 0) {
                return containers[i];
            }
        }
        if (containers.length > 0) return containers[0];

        // Fallback: settings area
        var areas = document.querySelectorAll('.spiraapp-settings, .product-spiraapp-details');
        if (areas.length > 0) {
            var el = document.createElement('div');
            el.id = APP_GUID + '_settings_content';
            areas[0].appendChild(el);
            return el;
        }

        // Last resort
        var parents = document.querySelectorAll('#cplMainContent, main, .container, .content');
        if (parents.length > 0) {
            var el2 = document.createElement('div');
            el2.id = APP_GUID + '_settings_content';
            parents[0].appendChild(el2);
            return el2;
        }

        return null;
    }

    // Init
    function initSettings() {
        injectStyles();
        var container = findContainer();
        if (!container) return;

        container.innerHTML = TPL_SETTINGS;
        loadCurrentFramework();
        bindEvents();
    }

    function loadCurrentFramework() {
        var productId = spiraAppManager.projectId;
        spiraAppManager.storageGetProduct(
            APP_GUID, APP_NAME, CUSTOM_FRAMEWORK_KEY, productId,
            function (data) {
                if (data && data !== '') {
                    try {
                        currentFramework = JSON.parse(data);
                        renderCurrentStatus(currentFramework);
                    } catch (e) {
                        renderCurrentStatus(null);
                    }
                } else {
                    renderCurrentStatus(null);
                }
            },
            function () { renderCurrentStatus(null); }
        );
    }

    function renderCurrentStatus(framework) {
        var el = document.getElementById('dmm-current-status');
        if (!el) return;

        if (framework && framework.meta) {
            el.innerHTML = renderTemplate(TPL_CURRENT_CUSTOM, {
                name: framework.meta.name,
                description: framework.meta.description || '',
                domainCount: framework.domains ? framework.domains.length : 0,
                questionCount: countQuestions(framework)
            });
            var btnClear = document.getElementById('btn-clear-framework');
            if (btnClear) btnClear.addEventListener('click', clearFramework);
        } else {
            el.innerHTML = TPL_CURRENT_DEFAULT;
        }
    }

    function bindEvents() {
        var fileInput = document.getElementById('dmm-file-input');
        if (fileInput) fileInput.addEventListener('change', handleFileSelect);

        var btnDownload = document.getElementById('btn-download-template');
        if (btnDownload) btnDownload.addEventListener('click', downloadTemplate);

        var uploadArea = document.getElementById('dmm-upload-area');
        if (uploadArea) {
            uploadArea.addEventListener('dragover', function (e) {
                e.preventDefault();
                e.stopPropagation();
                uploadArea.style.borderColor = '#2563EB';
                uploadArea.style.backgroundColor = '#F0F7FF';
            });
            uploadArea.addEventListener('dragleave', function (e) {
                e.preventDefault();
                e.stopPropagation();
                uploadArea.style.borderColor = '';
                uploadArea.style.backgroundColor = '';
            });
            uploadArea.addEventListener('drop', function (e) {
                e.preventDefault();
                e.stopPropagation();
                uploadArea.style.borderColor = '';
                uploadArea.style.backgroundColor = '';
                if (e.dataTransfer.files.length > 0) processFile(e.dataTransfer.files[0]);
            });
        }
    }

    function handleFileSelect(e) {
        if (e.target.files[0]) processFile(e.target.files[0]);
    }

    function processFile(file) {
        clearError();
        clearPreview();

        if (!file.name.endsWith('.json')) {
            showError('Please select a JSON file (.json extension)');
            return;
        }

        var reader = new FileReader();
        reader.onload = function (e) {
            try {
                var framework = JSON.parse(e.target.result);
                var validation = validateFramework(framework);
                if (!validation.valid) {
                    showError('Invalid framework: ' + validation.errors.join(', '));
                    return;
                }
                pendingFramework = framework;
                showPreview(framework);
            } catch (err) {
                showError('Invalid JSON file: ' + err.message);
            }
        };
        reader.onerror = function () { showError('Error reading file'); };
        reader.readAsText(file);
    }

    function validateFramework(framework) {
        var errors = [];

        if (!framework.meta) {
            errors.push('Missing "meta" section');
        } else if (!framework.meta.name || framework.meta.name.trim() === '') {
            errors.push('Missing framework name (meta.name)');
        }

        if (!framework.domains || !Array.isArray(framework.domains)) {
            errors.push('Missing or invalid "domains" array');
        } else if (framework.domains.length === 0) {
            errors.push('At least one domain is required');
        } else {
            var totalWeight = 0;
            framework.domains.forEach(function (domain, idx) {
                if (!domain.id) errors.push('Domain ' + (idx + 1) + ' missing "id"');
                if (!domain.name) errors.push('Domain ' + (idx + 1) + ' missing "name"');
                if (typeof domain.weight !== 'number') {
                    errors.push('Domain ' + (idx + 1) + ' missing or invalid "weight"');
                } else {
                    totalWeight += domain.weight;
                }
                if (!domain.questions || !Array.isArray(domain.questions) || domain.questions.length === 0) {
                    errors.push('Domain "' + (domain.name || idx + 1) + '" has no questions');
                } else {
                    domain.questions.forEach(function (q, qIdx) {
                        if (!q.id) errors.push('Question ' + (qIdx + 1) + ' in "' + domain.name + '" missing "id"');
                        if (!q.text) errors.push('Question ' + (qIdx + 1) + ' in "' + domain.name + '" missing "text"');
                    });
                }
            });
            if (Math.abs(totalWeight - 1.0) > 0.01) {
                errors.push('Domain weights should sum to 1.0 (currently: ' + totalWeight.toFixed(2) + ')');
            }
        }

        return { valid: errors.length === 0, errors: errors };
    }

    function countQuestions(framework) {
        var count = 0;
        if (framework.domains) {
            framework.domains.forEach(function (d) { if (d.questions) count += d.questions.length; });
        }
        return count;
    }

    function showPreview(framework) {
        var area = document.getElementById('dmm-preview-area');
        if (!area) return;

        area.innerHTML = renderTemplate(TPL_PREVIEW, {
            name: framework.meta.name,
            description: framework.meta.description || '',
            domainCount: framework.domains.length,
            questionCount: countQuestions(framework),
            version: framework.meta.version || '1.0'
        });

        var btnSave = document.getElementById('btn-save-framework');
        if (btnSave) btnSave.addEventListener('click', saveFramework);

        var btnCancel = document.getElementById('btn-cancel-upload');
        if (btnCancel) btnCancel.addEventListener('click', function () { clearPreview(); pendingFramework = null; });
    }

    function clearPreview() {
        var area = document.getElementById('dmm-preview-area');
        if (area) area.innerHTML = '';
    }

    function showError(message) {
        var area = document.getElementById('dmm-error-area');
        if (area) area.innerHTML = '<div class="dmm-error"><i class="fa-light fa-triangle-exclamation"></i> ' + message + '</div>';
    }

    function clearError() {
        var area = document.getElementById('dmm-error-area');
        if (area) area.innerHTML = '';
    }

    function saveFramework() {
        if (!pendingFramework) { showError('No framework to save'); return; }

        var productId = spiraAppManager.projectId;
        var jsonStr = JSON.stringify(pendingFramework);
        var btnSave = document.getElementById('btn-save-framework');
        if (btnSave) { btnSave.disabled = true; btnSave.innerHTML = '<i class="fa-light fa-spinner fa-spin"></i> Saving...'; }

        // Update-then-insert pattern
        spiraAppManager.storageUpdateProduct(
            APP_GUID, APP_NAME, CUSTOM_FRAMEWORK_KEY, jsonStr, productId,
            function () { onSaveSuccess(); },
            function () {
                spiraAppManager.storageInsertProduct(
                    APP_GUID, APP_NAME, CUSTOM_FRAMEWORK_KEY, jsonStr, productId, false,
                    function () { onSaveSuccess(); },
                    function (err) {
                        showError('Failed to save framework: ' + (err.message || 'Unknown error'));
                        if (btnSave) { btnSave.disabled = false; btnSave.innerHTML = '<i class="fa-light fa-save"></i> Save Framework'; }
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
        spiraAppManager.displaySuccessMessage('Custom framework saved successfully! The widget will now use your custom questions.');
        renderCurrentStatus(currentFramework);
        var fileInput = document.getElementById('dmm-file-input');
        if (fileInput) fileInput.value = '';
    }

    function clearFramework() {
        var productId = spiraAppManager.projectId;
        spiraAppManager.displayConfirmation(
            'Are you sure you want to remove the custom framework? The widget will revert to using the default DevOps Maturity questions.',
            function () {
                spiraAppManager.storageUpdateProduct(
                    APP_GUID, APP_NAME, CUSTOM_FRAMEWORK_KEY, '', productId,
                    function () {
                        currentFramework = null;
                        renderCurrentStatus(null);
                        spiraAppManager.displaySuccessMessage('Custom framework removed. The widget will now use the default questions.');
                    },
                    function () { spiraAppManager.displayErrorMessage('Failed to remove framework'); }
                );
            }
        );
    }

    function downloadTemplate() {
        var jsonStr = JSON.stringify(TEMPLATE_JSON, null, 2);
        var blob = new Blob([jsonStr], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'assessment-template.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    spiraAppManager.registerEvent_windowLoad(initSettings);

})();
