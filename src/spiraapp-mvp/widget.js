// DevOps Maturity Model SpiraApp Widget

(function () {

    // --- CONSTANTS & CONFIG ---
    const DMM_STORAGE_KEY = "dmm_assessments_history";
    const CUSTOM_FRAMEWORK_KEY = "custom_framework";
    // Defined in manifest.yaml
    const APP_GUID = "4B8D9721-6A99-4786-903D-9346739A0673";
    const APP_NAME = "DevOpsMaturityAssessment"; // Must match manifest name

    // Active framework state (loaded from custom or default)
    let activeQuestions = null;
    let activeDomainWeights = null;
    let activeFrameworkMeta = null;

    const DOMAIN_WEIGHTS = {
        "domain1": 0.35, // Source Control
        "domain2": 0.30, // Security
        "domain3": 0.35  // CI/CD
    };

    // --- CSS STYLES (Injected) ---
    const WIDGET_STYLES = `
/* DevOps Maturity Model Widget Styles */
.dmm-widget {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}
.dmm-summary-card {
  text-align: center;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #ddd;
}
.dmm-score-large {
  font-size: 3em;
  font-weight: bold;
  color: #007bff;
  margin: 10px 0;
}
.dmm-level-badge {
  display: inline-block;
  padding: 5px 15px;
  border-radius: 15px;
  background: #e9ecef;
  color: #495057;
  font-weight: bold;
  margin-bottom: 15px;
}
.dmm-level-1 { background-color: #ffebee; color: #c62828; }
.dmm-level-2 { background-color: #fff3e0; color: #ef6c00; }
.dmm-level-3 { background-color: #fffde7; color: #f9a825; }
.dmm-level-4 { background-color: #e8f5e9; color: #2e7d32; }
.dmm-level-5 { background-color: #e3f2fd; color: #1565c0; }

.dmm-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  text-decoration: none;
  display: inline-block;
}
.dmm-btn:hover { background-color: #0056b3; color: white; }
.dmm-btn-secondary { background-color: #6c757d; }
.dmm-btn-secondary:hover { background-color: #5a6268; }

.dmm-form-container {
  max-height: 600px;
  overflow-y: auto;
  padding-right: 15px;
}
.dmm-domain-section { margin-bottom: 25px; border-bottom: 2px solid #eee; padding-bottom: 15px; }
.dmm-domain-title { font-size: 1.2em; color: #495057; margin-bottom: 15px; border-left: 4px solid #007bff; padding-left: 10px; }
.dmm-question-card { background: white; border: 1px solid #e9ecef; padding: 15px; margin-bottom: 15px; border-radius: 6px; }
.dmm-question-text { font-weight: 600; margin-bottom: 10px; display: block; }
.dmm-options label { display: block; margin-bottom: 8px; cursor: pointer; padding: 5px; border-radius: 4px; }
.dmm-options label:hover { background-color: #f8f9fa; }
.dmm-options input[type="radio"] { margin-right: 10px; }

.dmm-results-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px; }
.dmm-result-card { background: white; padding: 15px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align: center; border: 1px solid #eee; }
.dmm-result-value { font-size: 1.5em; font-weight: bold; color: #333; display: block; }
.dmm-result-label { font-size: 0.9em; color: #777; }
.dmm-actions { display: flex; gap: 10px; justify-content: center; margin-top: 20px; }
`;

    // --- DATA: QUESTIONS ---
    const DMM_QUESTIONS = [
        // Domain 1: Source Control & Development
        {
            id: "Q1", domain: "domain1", text: "What version control system do you use?",
            options: [
                { score: 0, text: "No version control" },
                { score: 1, text: "Centralized VCS (SVN, etc.)" },
                { score: 2, text: "Git with basic usage" },
                { score: 3, text: "Git with defined strategy" },
                { score: 4, text: "Git with trunk-based or optimized flow" },
                { score: 5, text: "Git with automated enforcement" }
            ]
        },
        {
            id: "Q2", domain: "domain1", text: "How do you manage code branches?",
            options: [
                { score: 0, text: "No defined strategy, ad-hoc" },
                { score: 1, text: "Long-lived feature branches" },
                { score: 2, text: "GitFlow with manual merges" },
                { score: 4, text: "Trunk-based with feature flags" }, // Note: skip 3 in spec
                { score: 5, text: "Trunk-based with automated CI checks" }
            ]
        },
        {
            id: "Q3", domain: "domain1", text: "How are code changes reviewed?",
            options: [
                { score: 0, text: "No formal review" },
                { score: 1, text: "Manual/email review" },
                { score: 2, text: "Pull requests, no automation" },
                { score: 3, text: "PR with required approvals" },
                { score: 4, text: "PR with automated checks + approvals" },
                { score: 5, text: "PR + checks + 2+ reviewers + protected branches" }
            ]
        },
        {
            id: "Q4", domain: "domain1", text: "What automated code quality checks run on every commit?",
            options: [
                { score: 0, text: "None" },
                { score: 2, text: "Linting only" },
                { score: 3, text: "Linting + basic static analysis" },
                { score: 4, text: "SAST + linting + complexity checks" },
                { score: 5, text: "Comprehensive analysis + security + coverage gates" }
            ]
        },
        {
            id: "Q5", domain: "domain1", text: "What is your test coverage and automation level?",
            options: [
                { score: 0, text: "No automated tests" },
                { score: 1, text: "<40% coverage, manual tests" },
                { score: 2, text: "40-60% coverage, some automation" },
                { score: 3, text: "60-80% coverage, mostly automated" },
                { score: 4, text: ">80% coverage, fully automated" },
                { score: 5, text: ">80% + integration tests + test pyramid" }
            ]
        },
        {
            id: "Q6", domain: "domain1", text: "How long does a typical build + test cycle take?",
            options: [
                { score: 0, text: ">60 minutes" },
                { score: 1, text: "30-60 minutes" },
                { score: 2, text: "15-30 minutes" },
                { score: 3, text: "5-15 minutes" },
                { score: 5, text: "<5 minutes with caching/parallelization" }
            ]
        },
        {
            id: "Q7", domain: "domain1", text: "How quickly do developers get feedback on code changes?",
            options: [
                { score: 0, text: "Hours or next day" },
                { score: 1, text: "30-60 minutes" },
                { score: 2, text: "10-30 minutes" },
                { score: 3, text: "5-10 minutes" },
                { score: 5, text: "<5 minutes with local pre-commit checks" }
            ]
        },

        // Domain 2: Security & Compliance
        {
            id: "Q8", domain: "domain2", text: "What security scans run automatically in your pipeline?",
            options: [
                { score: 0, text: "None" },
                { score: 1, text: "Manual security reviews only" },
                { score: 2, text: "Dependency scanning only" },
                { score: 3, text: "SAST + dependency scanning" },
                { score: 4, text: "SAST + DAST + dependency + container scanning" },
                { score: 5, text: "Full scan suite + secret detection + IaC scanning" }
            ]
        },
        {
            id: "Q9", domain: "domain2", text: "How do you handle security vulnerabilities?",
            options: [
                { score: 0, text: "No process" },
                { score: 1, text: "Manual tracking when found" },
                { score: 2, text: "Automated detection, manual remediation" },
                { score: 3, text: "Automated detection + SLA tracking" },
                { score: 4, text: "Automated detection + blocking + SLA" },
                { score: 5, text: "Automated detection + auto-remediation + SLA" }
            ]
        },
        {
            id: "Q10", domain: "domain2", text: "How are secrets and credentials managed?",
            options: [
                { score: 0, text: "Hardcoded in code/configs" },
                { score: 1, text: "Environment variables" },
                { score: 2, text: "Encrypted config files" },
                { score: 4, text: "Secrets management tool (Vault, etc.)" },
                { score: 5, text: "Centralized secrets + rotation + audit" }
            ]
        },
        {
            id: "Q11", domain: "domain2", text: "Do you track your software dependencies and supply chain?",
            options: [
                { score: 0, text: "No tracking" },
                { score: 1, text: "Manual dependency list" },
                { score: 3, text: "Automated dependency scanning" },
                { score: 4, text: "SBOM generation + license compliance" },
                { score: 5, text: "SBOM + provenance + signing + SLSA" }
            ]
        },
        {
            id: "Q12", domain: "domain2", text: "How is access to production systems managed?",
            options: [
                { score: 0, text: "Shared credentials" },
                { score: 1, text: "Individual accounts, no MFA" },
                { score: 2, text: "Individual accounts + MFA" },
                { score: 4, text: "SSO + MFA + role-based access" },
                { score: 5, text: "Zero-trust + just-in-time access + audit logs" }
            ]
        },
        {
            id: "Q13", domain: "domain2", text: "How do you handle audit and compliance requirements?",
            options: [
                { score: 0, text: "Manual processes and documentation" },
                { score: 1, text: "Partially automated documentation" },
                { score: 3, text: "Automated compliance checks in pipeline" },
                { score: 4, text: "Policy as code + automated audits" },
                { score: 5, text: "Continuous compliance + automated evidence" }
            ]
        },

        // Domain 3: CI/CD & Deployment
        {
            id: "Q14", domain: "domain3", text: "How automated is your build process?",
            options: [
                { score: 0, text: "Manual builds" },
                { score: 1, text: "Semi-automated, triggered manually" },
                { score: 2, text: "Automated on commit to main branch" },
                { score: 3, text: "Automated on every commit/PR" },
                { score: 4, text: "Automated + parallel execution" },
                { score: 5, text: "Automated + parallel + optimized (<15 min)" }
            ]
        },
        {
            id: "Q15", domain: "domain3", text: "How often do you deploy to production?",
            options: [
                { score: 0, text: "Monthly or less" },
                { score: 1, text: "Every 2-4 weeks" },
                { score: 2, text: "Weekly" },
                { score: 3, text: "Multiple times per week" },
                { score: 4, text: "Daily" },
                { score: 5, text: "On-demand/continuous (multiple per day)" }
            ]
        },
        {
            id: "Q16", domain: "domain3", text: "How automated is your deployment process?",
            options: [
                { score: 0, text: "Manual deployments" },
                { score: 1, text: "Scripted but manual trigger" },
                { score: 2, text: "Automated to staging, manual to prod" },
                { score: 3, text: "Automated to all environments" },
                { score: 4, text: "Automated + approval gates" },
                { score: 5, text: "Fully automated + GitOps + rollback" }
            ]
        },
        {
            id: "Q17", domain: "domain3", text: "How is your infrastructure managed?",
            options: [
                { score: 0, text: "Manual/ClickOps" },
                { score: 1, text: "Documentation only" },
                { score: 2, text: "Scripts for some infrastructure" },
                { score: 3, text: "IaC for most infrastructure" },
                { score: 4, text: "IaC for all infrastructure + version control" },
                { score: 5, text: "IaC + automated testing + drift detection" }
            ]
        },
        {
            id: "Q18", domain: "domain3", text: "Can you deploy without user-facing downtime?",
            options: [
                { score: 0, text: "Always requires downtime" },
                { score: 1, text: "Usually requires maintenance window" },
                { score: 2, text: "Sometimes zero-downtime" },
                { score: 3, text: "Usually zero-downtime (blue-green/canary)" },
                { score: 5, text: "Always zero-downtime + automated verification" }
            ]
        },
        {
            id: "Q19", domain: "domain3", text: "How quickly can you rollback a bad deployment?",
            options: [
                { score: 0, text: ">1 hour, manual process" },
                { score: 1, text: "30-60 minutes, semi-automated" },
                { score: 2, text: "10-30 minutes, mostly automated" },
                { score: 4, text: "<10 minutes, automated rollback" },
                { score: 5, text: "Instant automated rollback on failure detection" }
            ]
        },
        {
            id: "Q20", domain: "domain3", text: "How do you control feature releases?",
            options: [
                { score: 0, text: "Features tied to deployments" },
                { score: 1, text: "Manual configuration changes" },
                { score: 2, text: "Basic feature flags" },
                { score: 3, text: "Feature flag system with targeting" },
                { score: 4, text: "Advanced feature flags + A/B testing" },
                { score: 5, text: "Progressive rollout + automated metrics" }
            ]
        }
    ];

    // --- TEMPLATES ---
    const TPL_SUMMARY = `
<div class="dmm-widget">
    {{#hasHistory}}
        <div class="dmm-summary-card">
            <h3>Latest DevOps Maturity Score</h3>
            <div class="dmm-score-large">{{latestScore}}%</div>
            <div class="dmm-level-badge dmm-level-{{latestLevelInt}}">{{latestLevel}}</div>
            <p>Assessed on: {{latestDate}}</p>
            <div class="dmm-actions">
                <button id="btn-start-dmm" class="dmm-btn">Start New Assessment</button>
            </div>
            <br/>
            <small>Previous assessments: {{historyCount}}</small>
        </div>
    {{/hasHistory}}
    {{^hasHistory}}
        <div class="dmm-summary-card">
            <h3>DevOps Maturity Assessment</h3>
            <p>You haven't run an assessment for this product yet.</p>
            <p>Assess your team's capabilities across Source Control, Security, and CI/CD.</p>
            <div class="dmm-actions">
                <button id="btn-start-dmm" class="dmm-btn">Start Assessment</button>
            </div>
        </div>
    {{/hasHistory}}
</div>
`;

    const TPL_FORM = `
<div class="dmm-widget">
    <div class="dmm-form-header">
        <h3>New Assessment</h3>
        <p>Please answer the following 20 questions to the best of your ability.</p>
    </div>
    <form id="dmm-form">
        <div class="dmm-form-container">
            {{#domains}}
            <div class="dmm-domain-section">
                <div class="dmm-domain-title">{{title}}</div>
                {{#questions}}
                <div class="dmm-question-card">
                    <span class="dmm-question-text">{{id}}. {{text}}</span>
                    <div class="dmm-options">
                        {{#options}}
                        <label>
                            <input type="radio" name="{{questionId}}" value="{{score}}" required>
                            {{text}} ({{score}} pts)
                        </label>
                        {{/options}}
                    </div>
                </div>
                {{/questions}}
            </div>
            {{/domains}}
        </div>
        <div class="dmm-actions">
            <button type="button" id="btn-cancel-dmm" class="dmm-btn dmm-btn-secondary">Cancel</button>
            <button type="button" id="btn-submit-dmm" class="dmm-btn">Submit Assessment</button>
        </div>
    </form>
</div>
`;

    const TPL_RESULTS = `
<div class="dmm-widget">
    <div class="dmm-summary-card">
        <h3>Assessment Complete</h3>
        <div class="dmm-score-large">{{overallScore}}%</div>
        <div class="dmm-level-badge dmm-level-{{maturityLevelInt}}">{{maturityLevel}}</div>
        
        <div class="dmm-results-grid">
            <div class="dmm-result-card">
                <span class="dmm-result-value">{{domain1Score}}%</span>
                <span class="dmm-result-label">Source Control</span>
            </div>
            <div class="dmm-result-card">
                <span class="dmm-result-value">{{domain2Score}}%</span>
                <span class="dmm-result-label">Security</span>
            </div>
            <div class="dmm-result-card">
                <span class="dmm-result-value">{{domain3Score}}%</span>
                <span class="dmm-result-label">CI/CD</span>
            </div>
        </div>

        <div class="dmm-actions">
            <button id="btn-back-dmm" class="dmm-btn">Back to Dashboard</button>
        </div>
    </div>
</div>
`;

    // --- LOGIC ---

    // Helper to inject styles
    function injectStyles() {
        if (!document.getElementById("dmm-widget-styles")) {
            var style = document.createElement('style');
            style.id = "dmm-widget-styles";
            style.innerHTML = WIDGET_STYLES;
            document.head.appendChild(style);
        }
    }

    // Load custom framework from storage, fallback to default DMM_QUESTIONS
    function loadCustomFramework(callback) {
        const productId = spiraAppManager.projectId;
        dmmLog("loadCustomFramework called", { productId: productId });

        // Use 6-param signature (include pluginName!)
        spiraAppManager.storageGetProduct(
            APP_GUID,
            APP_NAME,
            CUSTOM_FRAMEWORK_KEY,
            productId,
            function (data) {
                dmmLog("loadCustomFramework SUCCESS", { hasData: !!data, dataLength: data ? data.length : 0 });

                if (data && data !== "" && data.trim() !== "") {
                    try {
                        const framework = JSON.parse(data);
                        dmmLog("Parsed custom framework", {
                            name: framework.meta ? framework.meta.name : "unknown",
                            domainsCount: framework.domains ? framework.domains.length : 0
                        });

                        // Validate and extract questions from custom framework
                        if (framework.domains && Array.isArray(framework.domains)) {
                            activeQuestions = [];
                            activeDomainWeights = {};
                            activeFrameworkMeta = framework.meta || { name: "Custom Framework" };

                            framework.domains.forEach(function(domain) {
                                // Build domain weight map
                                activeDomainWeights[domain.id] = domain.weight || 0;

                                // Flatten questions with domain reference
                                if (domain.questions && Array.isArray(domain.questions)) {
                                    domain.questions.forEach(function(q) {
                                        activeQuestions.push({
                                            id: q.id,
                                            domain: domain.id,
                                            domainName: domain.name,
                                            text: q.text,
                                            options: q.options || []
                                        });
                                    });
                                }
                            });

                            dmmLog("Custom framework loaded", {
                                questionsCount: activeQuestions.length,
                                domains: Object.keys(activeDomainWeights)
                            });

                            callback();
                            return;
                        }
                    } catch (e) {
                        dmmLog("Error parsing custom framework, using default", { error: e.message });
                    }
                }

                // Fallback to default
                useDefaultFramework();
                callback();
            },
            function (err) {
                // Expected on first run or if no custom framework
                dmmLog("loadCustomFramework FAILED (using default)", { error: err });
                useDefaultFramework();
                callback();
            }
        );
    }

    // Set up default framework from hardcoded DMM_QUESTIONS
    function useDefaultFramework() {
        dmmLog("Using default DMM framework", {});
        activeQuestions = DMM_QUESTIONS;
        activeDomainWeights = DOMAIN_WEIGHTS;
        activeFrameworkMeta = {
            name: "DevOps Maturity Model",
            description: "Default 20-question assessment",
            version: "1.0"
        };
    }

    // Get domain info for template rendering
    function getDomainInfo() {
        // Build domain structure from active questions
        const domainMap = {};

        activeQuestions.forEach(function(q) {
            if (!domainMap[q.domain]) {
                domainMap[q.domain] = {
                    id: q.domain,
                    title: q.domainName || getDomainTitle(q.domain),
                    questions: []
                };
            }
            domainMap[q.domain].questions.push({
                id: q.id,
                text: q.text,
                questionId: q.id,
                options: q.options
            });
        });

        return Object.values(domainMap);
    }

    // Get default domain title for legacy domains
    function getDomainTitle(domainId) {
        const defaultTitles = {
            "domain1": "Domain 1: Source Control & Development",
            "domain2": "Domain 2: Security & Compliance",
            "domain3": "Domain 3: CI/CD & Deployment"
        };
        return defaultTitles[domainId] || domainId;
    }

    // Entry Point
    spiraAppManager.registerEvent_windowLoad(initDmmWidget);
    // Also re-render if dashboard updates (e.g. filter change)
    spiraAppManager.registerEvent_dashboardUpdated(initDmmWidget);

    function initDmmWidget() {
        injectStyles();
        // Load custom framework first, then load history
        loadCustomFramework(function() {
            dmmLog("Framework loaded, proceeding to loadDmmHistory", {
                frameworkName: activeFrameworkMeta ? activeFrameworkMeta.name : "unknown",
                questionCount: activeQuestions ? activeQuestions.length : 0
            });
            loadDmmHistory();
        });
    }

    // PERSISTENT DEBUG: Write to localStorage so logs survive logout
    function dmmLog(msg, data) {
        const logKey = 'dmm_debug_log';
        let log = localStorage.getItem(logKey) || '';
        const timestamp = new Date().toISOString();
        const entry = `[${timestamp}] ${msg}: ${JSON.stringify(data)}\n`;
        localStorage.setItem(logKey, log + entry);
        console.log("DMM DEBUG:", msg, data);
    }

    // Clear old logs on fresh load
    localStorage.setItem('dmm_debug_log', '--- DMM Debug Session Started ---\n');

    // 1. Load Data
    function loadDmmHistory() {
        const productId = spiraAppManager.projectId;
        const expectedElementId = APP_GUID + "_content";

        dmmLog("loadDmmHistory called", {
            APP_GUID: APP_GUID,
            productId: productId,
            expectedElementId: expectedElementId
        });

        // DOM SCAN: Find ALL elements that might be our container
        const allElements = document.querySelectorAll('*');
        const matchingElements = [];
        allElements.forEach(el => {
            if (el.id && (el.id.includes(APP_GUID) || el.id.includes('content'))) {
                matchingElements.push({ id: el.id, tagName: el.tagName });
            }
        });
        dmmLog("DOM SCAN - Elements with GUID or 'content'", {
            count: matchingElements.length,
            elements: matchingElements.slice(0, 10) // First 10 only
        });

        // Try to find container with expected ID
        let container = document.getElementById(expectedElementId);

        // If not found, try alternative formats
        if (!container) {
            const alternatives = [
                APP_GUID.toLowerCase() + "_content",
                APP_GUID.replace(/-/g, "") + "_content",
                "spiraapp_" + APP_GUID + "_content"
            ];
            for (const altId of alternatives) {
                container = document.getElementById(altId);
                if (container) {
                    dmmLog("Found container with alternative ID", { altId: altId });
                    break;
                }
            }
        }

        dmmLog("Container lookup result", {
            found: !!container,
            usedId: container ? container.id : "NOT FOUND"
        });

        // Store the correct element ID for later use
        if (container) {
            window.DMM_CONTAINER_ID = container.id;
        }

        dmmLog("Calling storageGetProduct", { timestamp: Date.now() });

        // Use 6-param signature (keeps session alive even on error)
        // Note: API may use pluginName as key - handle error gracefully
        spiraAppManager.storageGetProduct(
            APP_GUID,
            APP_NAME,
            DMM_STORAGE_KEY,
            productId,
            function (data) { // Success
                dmmLog("storageGetProduct SUCCESS", { data: data });
                let history = [];
                if (data && data !== "") {
                    try {
                        history = JSON.parse(data);
                        dmmLog("Parsed history", { count: history.length });
                    } catch (e) {
                        dmmLog("Error parsing history", { error: e.message });
                    }
                }
                renderSummary(history);
            },
            function (err) { // Failure - expected on first run OR due to key mismatch
                dmmLog("storageGetProduct FAILED (expected on first run)", {
                    message: err?.message,
                    type: err?.exceptionType
                });
                // Render empty state regardless of error
                renderSummary([]);
            }
        );
    }

    // 2. Render Summary
    function renderSummary(history) {
        // Use discovered container ID if available, otherwise try expected format
        const elementId = window.DMM_CONTAINER_ID || (APP_GUID + "_content");
        dmmLog("renderSummary called", {
            historyLength: history ? history.length : 0,
            elementId: elementId,
            usingDiscoveredId: !!window.DMM_CONTAINER_ID
        });

        let container = document.getElementById(elementId);

        // If still not found, do one more scan for any element with our GUID
        if (!container) {
            dmmLog("Container still not found, scanning for any GUID element", {});
            const allWithGuid = document.querySelectorAll('[id*="' + APP_GUID + '"]');
            if (allWithGuid.length > 0) {
                container = allWithGuid[0];
                dmmLog("Found fallback container", { id: container.id });
            }
        }

        dmmLog("Container lookup final", {
            found: !!container,
            containerHTML: container ? container.innerHTML.substring(0, 100) : "NOT FOUND"
        });

        if (!container) {
            dmmLog("ERROR: Container not found, cannot render!", {
                elementId: elementId,
                hint: "Widget may not be added to dashboard. Check localStorage log for DOM SCAN results."
            });
            return; // Widget not on page?
        }

        let viewData = { hasHistory: false };

        if (history && history.length > 0) {
            // Sort by date desc
            history.sort((a, b) => new Date(b.date) - new Date(a.date));
            const latest = history[0];

            viewData = {
                hasHistory: true,
                latestScore: latest.overallScore,
                latestLevel: latest.maturityLevel,
                latestLevelInt: latest.maturityLevelInt,
                latestDate: spiraAppManager.formatDate(latest.date),
                historyCount: history.length
            };
        }

        dmmLog("Rendering template", { viewData: viewData });
        container.innerHTML = Mustache.render(TPL_SUMMARY, viewData);
        dmmLog("Template rendered", { newHTML: container.innerHTML.substring(0, 100) });

        // Bind Events
        const btnStart = document.getElementById("btn-start-dmm");
        dmmLog("Button lookup", { buttonFound: !!btnStart });
        if (btnStart) {
            btnStart.addEventListener("click", function () {
                renderAssessmentForm();
            });
        }
    }

    // 3. Render Form
    function renderAssessmentForm() {
        const elementId = window.DMM_CONTAINER_ID || (APP_GUID + "_content");
        dmmLog("renderAssessmentForm called", {
            elementId: elementId,
            frameworkName: activeFrameworkMeta ? activeFrameworkMeta.name : "unknown",
            questionCount: activeQuestions ? activeQuestions.length : 0
        });
        const container = document.getElementById(elementId);

        // Use dynamic domain info from active framework
        const domains = getDomainInfo();

        dmmLog("Rendering form with domains", {
            domainCount: domains.length,
            domains: domains.map(d => ({ id: d.id, questionCount: d.questions.length }))
        });

        container.innerHTML = Mustache.render(TPL_FORM, { domains: domains });

        // Bind Form Events
        const btnCancel = document.getElementById("btn-cancel-dmm");
        if (btnCancel) {
            btnCancel.addEventListener("click", function () {
                initDmmWidget(); // Reload summary
            });
        }

        const btnSubmit = document.getElementById("btn-submit-dmm");
        if (btnSubmit) {
            btnSubmit.addEventListener("click", handleSubmit);
        }
    }

    // 4. Handle Submit & Scoring
    function handleSubmit() {
        const btnSubmit = document.getElementById("btn-submit-dmm");
        try {
            dmmLog("handleSubmit called", {});

            // Visual feedback immediately
            if (btnSubmit) {
                btnSubmit.innerHTML = "Calculating...";
                btnSubmit.disabled = true;
            }

            // Collect responses
            // FIX: Do not rely on <form> tag existence (Spira may strip it). 
            // Query inputs directly from the widget container.

            // Find container
            const elementId = window.DMM_CONTAINER_ID || (APP_GUID + "_content");
            let container = document.getElementById(elementId);

            // Fallback: use button context if container ID lookup fails
            if (!container && btnSubmit) {
                container = btnSubmit.closest('.dmm-widget') || btnSubmit.closest('div'); // fallback to parent div
            }

            if (!container) {
                dmmLog("Error: Widget container not found for input query", {});
                spiraAppManager.displayErrorMessage("Error: Could not find assessment form context.");
                if (btnSubmit) { btnSubmit.innerHTML = "Submit Assessment"; btnSubmit.disabled = false; }
                return;
            }

            let responses = {};
            let allAnswered = true;

            // Use active questions from loaded framework
            activeQuestions.forEach(q => {
                // Scope query to container
                const radios = container.querySelectorAll(`input[name="${q.id}"]`);
                let val = null;
                radios.forEach(r => {
                    if (r.checked) val = parseInt(r.value);
                });

                if (val === null) {
                    allAnswered = false;
                } else {
                    responses[q.id] = {
                        domain: q.domain,
                        score: val
                    };
                }
            });

            if (!allAnswered) {
                dmmLog("Validation failed: Not all questions answered", {});
                spiraAppManager.displayErrorMessage("Please answer all questions before submitting.");
                if (btnSubmit) { btnSubmit.innerHTML = "Submit Assessment"; btnSubmit.disabled = false; }
                return;
            }

            // Calculate Scores (Logic from spec)
            const results = calculateScores(responses);

            // Save
            saveAssessmentResults(results);

        } catch (e) {
            dmmLog("CRITICAL ERROR in handleSubmit", { name: e.name, message: e.message, stack: e.stack });
            spiraAppManager.displayErrorMessage("Error submitting assessment: " + e.message);
            if (btnSubmit) { btnSubmit.innerHTML = "Submit Assessment"; btnSubmit.disabled = false; }
        }
    }

    function calculateScores(responses) {
        // 1. Domain Scores - dynamically build from active questions
        // Domain Score = (Total Points / Max Possible) * 100
        let domainTotals = {};

        // Initialize domain totals from active questions
        activeQuestions.forEach(q => {
            if (!domainTotals[q.domain]) {
                domainTotals[q.domain] = { current: 0, max: 0 };
            }
        });

        // Tally scores
        activeQuestions.forEach(q => {
            const r = responses[q.id];
            if (r) {
                domainTotals[r.domain].current += r.score;
                // Find max score from options (typically 5, but may vary)
                const maxScore = q.options.reduce((max, opt) => Math.max(max, opt.score), 0);
                domainTotals[r.domain].max += maxScore || 5;
            }
        });

        // Calculate domain percentages
        const domainScores = {};
        Object.keys(domainTotals).forEach(domainId => {
            const dt = domainTotals[domainId];
            domainScores[domainId] = dt.max > 0 ? (dt.current / dt.max) * 100 : 0;
        });

        // 2. Overall Score (Weighted using active domain weights)
        let overall = 0;
        Object.keys(domainScores).forEach(domainId => {
            const weight = activeDomainWeights[domainId] || 0;
            overall += domainScores[domainId] * weight;
        });

        dmmLog("Score calculation", {
            domainScores: domainScores,
            weights: activeDomainWeights,
            overall: overall
        });

        // 3. Maturity Level
        let level = 1;
        let levelName = "Initial";
        if (overall > 20) { level = 2; levelName = "Developing"; }
        if (overall > 40) { level = 3; levelName = "Defined"; }
        if (overall > 60) { level = 4; levelName = "Managed"; }
        if (overall > 80) { level = 5; levelName = "Optimizing"; }

        // Build result with dynamic domain scores
        const result = {
            date: new Date().toISOString(),
            overallScore: Math.round(overall * 100) / 100, // 2 decimals
            maturityLevel: levelName,
            maturityLevelInt: level,
            frameworkName: activeFrameworkMeta ? activeFrameworkMeta.name : "Unknown",
            domainScores: {},
            responses: responses
        };

        // Add individual domain scores (for both legacy template and new dynamic)
        Object.keys(domainScores).forEach(domainId => {
            result.domainScores[domainId] = Math.round(domainScores[domainId]);
        });

        // For backwards compatibility with legacy template (domain1Score, domain2Score, domain3Score)
        if (domainScores.domain1 !== undefined) result.domain1Score = Math.round(domainScores.domain1);
        if (domainScores.domain2 !== undefined) result.domain2Score = Math.round(domainScores.domain2);
        if (domainScores.domain3 !== undefined) result.domain3Score = Math.round(domainScores.domain3);

        return result;
    }

    // 5. Save & Show Results
    function saveAssessmentResults(resultObj) {
        const productId = spiraAppManager.projectId;

        dmmLog("saveAssessmentResults called", { productId: productId });

        // Show saving feedback
        const btnSubmit = document.getElementById("btn-submit-dmm");
        if (btnSubmit) { btnSubmit.innerHTML = "Saving..."; btnSubmit.disabled = true; }

        // Fetch existing first (6-param signature with APP_NAME)
        spiraAppManager.storageGetProduct(
            APP_GUID,
            APP_NAME,
            DMM_STORAGE_KEY,
            productId,
            function (data) {
                dmmLog("Save - storageGetProduct SUCCESS", { data: data });
                let history = [];
                if (data && data !== "") {
                    try { history = JSON.parse(data); } catch (e) { }
                }
                history.push(resultObj);
                dmmLog("History now has entries", { count: history.length });

                // Save back (7-param signature with APP_NAME)
                dmmLog("Calling storageUpdateProduct", {});
                spiraAppManager.storageUpdateProduct(
                    APP_GUID,
                    APP_NAME,
                    DMM_STORAGE_KEY,
                    JSON.stringify(history),
                    productId,
                    function () {
                        dmmLog("storageUpdateProduct SUCCESS", {});
                        renderResults(resultObj);
                    },
                    function (err) {
                        // If update fails, try insert
                        dmmLog("storageUpdateProduct FAILED, trying insert", { error: err });
                        // 8-param signature with APP_NAME
                        spiraAppManager.storageInsertProduct(
                            APP_GUID, APP_NAME, DMM_STORAGE_KEY, JSON.stringify(history), productId, false,
                            function () {
                                dmmLog("storageInsertProduct SUCCESS", {});
                                renderResults(resultObj);
                            },
                            function (e) {
                                dmmLog("storageInsertProduct FAILED", { error: e });
                                spiraAppManager.displayErrorMessage("Failed to save (n): " + e);
                                if (btnSubmit) { btnSubmit.innerHTML = "Submit Assessment"; btnSubmit.disabled = false; }
                            }
                        );
                    }
                );
            },
            function () {
                // Fetch failed, likely no key => Insert new
                dmmLog("Save - storageGetProduct FAILED, inserting new", {});
                let history = [resultObj];
                // 8-param signature with APP_NAME
                spiraAppManager.storageInsertProduct(
                    APP_GUID, APP_NAME, DMM_STORAGE_KEY, JSON.stringify(history), productId, false,
                    function () {
                        dmmLog("storageInsertProduct (new) SUCCESS", {});
                        renderResults(resultObj);
                    },
                    function (e) {
                        dmmLog("storageInsertProduct (new) FAILED", { error: e });
                        spiraAppManager.displayErrorMessage("Failed to save (new): " + e);
                        if (btnSubmit) { btnSubmit.innerHTML = "Submit Assessment"; btnSubmit.disabled = false; }
                    }
                );
            }
        );
    }

    function renderResults(result) {
        const elementId = window.DMM_CONTAINER_ID || (APP_GUID + "_content");
        dmmLog("renderResults called", { elementId: elementId });
        const container = document.getElementById(elementId);

        container.innerHTML = Mustache.render(TPL_RESULTS, result);

        const btnBack = document.getElementById("btn-back-dmm");
        if (btnBack) {
            btnBack.addEventListener("click", function () {
                initDmmWidget();
            });
        }
    }

})(); // End IIFE
