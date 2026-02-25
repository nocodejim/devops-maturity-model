// DevOps Maturity Model SpiraApp Widget v1.0
// Runtime provides: WIDGET_ELEMENT, APP_GUID, spiraAppManager, Mustache

(function () {
    'use strict';

    // ===== 1. CONSTANTS =====

    var APP_NAME = 'DevOpsMaturityAssessment';
    var STORAGE_KEY = 'dmm_assessments_history';
    var CUSTOM_FRAMEWORK_KEY = 'custom_framework';

    var MATURITY_LEVELS = [
        { min: 0,  name: 'Initial',    level: 1, color: '#EF4444' },
        { min: 20, name: 'Developing', level: 2, color: '#F97316' },
        { min: 40, name: 'Defined',    level: 3, color: '#EAB308' },
        { min: 60, name: 'Managed',    level: 4, color: '#22C55E' },
        { min: 80, name: 'Optimizing', level: 5, color: '#3B82F6' }
    ];

    // Built-in assessment questions (20 questions, 3 domains)
    var DMM_QUESTIONS = [
        // Domain 1: Source Control & Development
        { id: 'Q1', domain: 'domain1', text: 'What version control system do you use?', options: [
            { score: 0, text: 'No version control' },
            { score: 1, text: 'Centralized VCS (SVN, etc.)' },
            { score: 2, text: 'Git with basic usage' },
            { score: 3, text: 'Git with defined strategy' },
            { score: 4, text: 'Git with trunk-based or optimized flow' },
            { score: 5, text: 'Git with automated enforcement' }
        ]},
        { id: 'Q2', domain: 'domain1', text: 'How do you manage code branches?', options: [
            { score: 0, text: 'No defined strategy, ad-hoc' },
            { score: 1, text: 'Long-lived feature branches' },
            { score: 2, text: 'GitFlow with manual merges' },
            { score: 4, text: 'Trunk-based with feature flags' },
            { score: 5, text: 'Trunk-based with automated CI checks' }
        ]},
        { id: 'Q3', domain: 'domain1', text: 'How are code changes reviewed?', options: [
            { score: 0, text: 'No formal review' },
            { score: 1, text: 'Manual/email review' },
            { score: 2, text: 'Pull requests, no automation' },
            { score: 3, text: 'PR with required approvals' },
            { score: 4, text: 'PR with automated checks + approvals' },
            { score: 5, text: 'PR + checks + 2+ reviewers + protected branches' }
        ]},
        { id: 'Q4', domain: 'domain1', text: 'What automated code quality checks run on every commit?', options: [
            { score: 0, text: 'None' },
            { score: 2, text: 'Linting only' },
            { score: 3, text: 'Linting + basic static analysis' },
            { score: 4, text: 'SAST + linting + complexity checks' },
            { score: 5, text: 'Comprehensive analysis + security + coverage gates' }
        ]},
        { id: 'Q5', domain: 'domain1', text: 'What is your test coverage and automation level?', options: [
            { score: 0, text: 'No automated tests' },
            { score: 1, text: '<40% coverage, manual tests' },
            { score: 2, text: '40-60% coverage, some automation' },
            { score: 3, text: '60-80% coverage, mostly automated' },
            { score: 4, text: '>80% coverage, fully automated' },
            { score: 5, text: '>80% + integration tests + test pyramid' }
        ]},
        { id: 'Q6', domain: 'domain1', text: 'How long does a typical build + test cycle take?', options: [
            { score: 0, text: '>60 minutes' },
            { score: 1, text: '30-60 minutes' },
            { score: 2, text: '15-30 minutes' },
            { score: 3, text: '5-15 minutes' },
            { score: 5, text: '<5 minutes with caching/parallelization' }
        ]},
        { id: 'Q7', domain: 'domain1', text: 'How quickly do developers get feedback on code changes?', options: [
            { score: 0, text: 'Hours or next day' },
            { score: 1, text: '30-60 minutes' },
            { score: 2, text: '10-30 minutes' },
            { score: 3, text: '5-10 minutes' },
            { score: 5, text: '<5 minutes with local pre-commit checks' }
        ]},

        // Domain 2: Security & Compliance
        { id: 'Q8', domain: 'domain2', text: 'What security scans run automatically in your pipeline?', options: [
            { score: 0, text: 'None' },
            { score: 1, text: 'Manual security reviews only' },
            { score: 2, text: 'Dependency scanning only' },
            { score: 3, text: 'SAST + dependency scanning' },
            { score: 4, text: 'SAST + DAST + dependency + container scanning' },
            { score: 5, text: 'Full scan suite + secret detection + IaC scanning' }
        ]},
        { id: 'Q9', domain: 'domain2', text: 'How do you handle security vulnerabilities?', options: [
            { score: 0, text: 'No process' },
            { score: 1, text: 'Manual tracking when found' },
            { score: 2, text: 'Automated detection, manual remediation' },
            { score: 3, text: 'Automated detection + SLA tracking' },
            { score: 4, text: 'Automated detection + blocking + SLA' },
            { score: 5, text: 'Automated detection + auto-remediation + SLA' }
        ]},
        { id: 'Q10', domain: 'domain2', text: 'How are secrets and credentials managed?', options: [
            { score: 0, text: 'Hardcoded in code/configs' },
            { score: 1, text: 'Environment variables' },
            { score: 2, text: 'Encrypted config files' },
            { score: 4, text: 'Secrets management tool (Vault, etc.)' },
            { score: 5, text: 'Centralized secrets + rotation + audit' }
        ]},
        { id: 'Q11', domain: 'domain2', text: 'Do you track your software dependencies and supply chain?', options: [
            { score: 0, text: 'No tracking' },
            { score: 1, text: 'Manual dependency list' },
            { score: 3, text: 'Automated dependency scanning' },
            { score: 4, text: 'SBOM generation + license compliance' },
            { score: 5, text: 'SBOM + provenance + signing + SLSA' }
        ]},
        { id: 'Q12', domain: 'domain2', text: 'How is access to production systems managed?', options: [
            { score: 0, text: 'Shared credentials' },
            { score: 1, text: 'Individual accounts, no MFA' },
            { score: 2, text: 'Individual accounts + MFA' },
            { score: 4, text: 'SSO + MFA + role-based access' },
            { score: 5, text: 'Zero-trust + just-in-time access + audit logs' }
        ]},
        { id: 'Q13', domain: 'domain2', text: 'How do you handle audit and compliance requirements?', options: [
            { score: 0, text: 'Manual processes and documentation' },
            { score: 1, text: 'Partially automated documentation' },
            { score: 3, text: 'Automated compliance checks in pipeline' },
            { score: 4, text: 'Policy as code + automated audits' },
            { score: 5, text: 'Continuous compliance + automated evidence' }
        ]},

        // Domain 3: CI/CD & Deployment
        { id: 'Q14', domain: 'domain3', text: 'How automated is your build process?', options: [
            { score: 0, text: 'Manual builds' },
            { score: 1, text: 'Semi-automated, triggered manually' },
            { score: 2, text: 'Automated on commit to main branch' },
            { score: 3, text: 'Automated on every commit/PR' },
            { score: 4, text: 'Automated + parallel execution' },
            { score: 5, text: 'Automated + parallel + optimized (<15 min)' }
        ]},
        { id: 'Q15', domain: 'domain3', text: 'How often do you deploy to production?', options: [
            { score: 0, text: 'Monthly or less' },
            { score: 1, text: 'Every 2-4 weeks' },
            { score: 2, text: 'Weekly' },
            { score: 3, text: 'Multiple times per week' },
            { score: 4, text: 'Daily' },
            { score: 5, text: 'On-demand/continuous (multiple per day)' }
        ]},
        { id: 'Q16', domain: 'domain3', text: 'How automated is your deployment process?', options: [
            { score: 0, text: 'Manual deployments' },
            { score: 1, text: 'Scripted but manual trigger' },
            { score: 2, text: 'Automated to staging, manual to prod' },
            { score: 3, text: 'Automated to all environments' },
            { score: 4, text: 'Automated + approval gates' },
            { score: 5, text: 'Fully automated + GitOps + rollback' }
        ]},
        { id: 'Q17', domain: 'domain3', text: 'How is your infrastructure managed?', options: [
            { score: 0, text: 'Manual/ClickOps' },
            { score: 1, text: 'Documentation only' },
            { score: 2, text: 'Scripts for some infrastructure' },
            { score: 3, text: 'IaC for most infrastructure' },
            { score: 4, text: 'IaC for all infrastructure + version control' },
            { score: 5, text: 'IaC + automated testing + drift detection' }
        ]},
        { id: 'Q18', domain: 'domain3', text: 'Can you deploy without user-facing downtime?', options: [
            { score: 0, text: 'Always requires downtime' },
            { score: 1, text: 'Usually requires maintenance window' },
            { score: 2, text: 'Sometimes zero-downtime' },
            { score: 3, text: 'Usually zero-downtime (blue-green/canary)' },
            { score: 5, text: 'Always zero-downtime + automated verification' }
        ]},
        { id: 'Q19', domain: 'domain3', text: 'How quickly can you rollback a bad deployment?', options: [
            { score: 0, text: '>1 hour, manual process' },
            { score: 1, text: '30-60 minutes, semi-automated' },
            { score: 2, text: '10-30 minutes, mostly automated' },
            { score: 4, text: '<10 minutes, automated rollback' },
            { score: 5, text: 'Instant automated rollback on failure detection' }
        ]},
        { id: 'Q20', domain: 'domain3', text: 'How do you control feature releases?', options: [
            { score: 0, text: 'Features tied to deployments' },
            { score: 1, text: 'Manual configuration changes' },
            { score: 2, text: 'Basic feature flags' },
            { score: 3, text: 'Feature flag system with targeting' },
            { score: 4, text: 'Advanced feature flags + A/B testing' },
            { score: 5, text: 'Progressive rollout + automated metrics' }
        ]}
    ];

    // ===== 2. STATE =====

    var activeFramework = null;
    var assessmentHistory = [];
    var currentDomainIndex = 0;

    // ===== 3. STYLE INJECTION =====

    var WIDGET_STYLES = 'file://widget.css';

    function injectStyles() {
        if (document.getElementById('dmm-styles')) return;
        // In demo mode, CSS is loaded via <link> and this string is the literal reference
        if (WIDGET_STYLES.length < 50) return;
        var s = document.createElement('style');
        s.id = 'dmm-styles';
        // Package generator base64-encodes CSS when embedded in JS files
        try { s.textContent = atob(WIDGET_STYLES); } catch (e) { s.textContent = WIDGET_STYLES; }
        document.head.appendChild(s);
    }

    // ===== 4. SVG GENERATORS =====

    function getMaturityLevel(score) {
        for (var i = MATURITY_LEVELS.length - 1; i >= 0; i--) {
            if (score >= MATURITY_LEVELS[i].min) return MATURITY_LEVELS[i];
        }
        return MATURITY_LEVELS[0];
    }

    function generateScoreGauge(score, size) {
        var r = (size / 2) - 8;
        var cx = size / 2;
        var cy = size / 2;
        var circ = 2 * Math.PI * r;
        var offset = circ - (Math.min(score, 100) / 100) * circ;
        var lvl = getMaturityLevel(score);

        return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' +
            '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#E5E7EB" stroke-width="8"/>' +
            '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + lvl.color + '" stroke-width="8" ' +
                'stroke-dasharray="' + circ + '" stroke-dashoffset="' + offset + '" ' +
                'stroke-linecap="round" transform="rotate(-90 ' + cx + ' ' + cy + ')"/>' +
            '<text x="' + cx + '" y="' + (cy - 4) + '" text-anchor="middle" font-size="22" font-weight="bold" fill="#1F2937">' + Math.round(score) + '%</text>' +
            '<text x="' + cx + '" y="' + (cy + 14) + '" text-anchor="middle" font-size="10" fill="#6B7280">' + lvl.name + '</text>' +
            '</svg>';
    }

    function generateRadarChart(domainScores, size) {
        var entries = [];
        for (var id in domainScores) {
            if (domainScores.hasOwnProperty(id)) entries.push(domainScores[id]);
        }
        var n = entries.length;
        if (n < 3) return '';

        var cx = size / 2;
        var cy = size / 2;
        var r = (size / 2) - 30;
        var step = (2 * Math.PI) / n;
        var svg = '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">';

        // Grid polygons at 20/40/60/80/100%
        for (var g = 1; g <= 5; g++) {
            var gr = (r * g) / 5;
            var gridPts = '';
            for (var gi = 0; gi < n; gi++) {
                var ga = step * gi - Math.PI / 2;
                gridPts += (cx + gr * Math.cos(ga)).toFixed(1) + ',' + (cy + gr * Math.sin(ga)).toFixed(1) + ' ';
            }
            svg += '<polygon points="' + gridPts.trim() + '" fill="none" stroke="#E5E7EB" stroke-width="0.5"/>';
        }

        // Axis lines
        for (var a = 0; a < n; a++) {
            var aa = step * a - Math.PI / 2;
            svg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + r * Math.cos(aa)).toFixed(1) + '" y2="' + (cy + r * Math.sin(aa)).toFixed(1) + '" stroke="#E5E7EB" stroke-width="0.5"/>';
        }

        // Data polygon + dots
        var pts = '';
        for (var d = 0; d < n; d++) {
            var da = step * d - Math.PI / 2;
            var ds = Math.min(entries[d].score, 100) / 100;
            pts += (cx + r * ds * Math.cos(da)).toFixed(1) + ',' + (cy + r * ds * Math.sin(da)).toFixed(1) + ' ';
        }
        svg += '<polygon points="' + pts.trim() + '" fill="rgba(37,99,235,0.15)" stroke="#2563EB" stroke-width="1.5"/>';

        for (var dd = 0; dd < n; dd++) {
            var dda = step * dd - Math.PI / 2;
            var dds = Math.min(entries[dd].score, 100) / 100;
            svg += '<circle cx="' + (cx + r * dds * Math.cos(dda)).toFixed(1) + '" cy="' + (cy + r * dds * Math.sin(dda)).toFixed(1) + '" r="3" fill="#2563EB"/>';
        }

        // Labels
        for (var l = 0; l < n; l++) {
            var la = step * l - Math.PI / 2;
            var lr = r + 20;
            var lx = cx + lr * Math.cos(la);
            var ly = cy + lr * Math.sin(la);
            var cosVal = Math.cos(la);
            var anchor = Math.abs(cosVal) < 0.15 ? 'middle' : (cosVal > 0 ? 'start' : 'end');
            svg += '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" text-anchor="' + anchor + '" font-size="9" fill="#6B7280" dominant-baseline="middle">' + entries[l].name + '</text>';
        }

        svg += '</svg>';
        return svg;
    }

    function generateTrendLine(scores, width, height) {
        if (scores.length < 2) return '';
        var pad = 15;
        var w = width - pad * 2;
        var h = height - pad * 2;
        var stepX = w / (scores.length - 1);

        var svg = '<svg width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">';

        // Horizontal guides
        for (var g = 0; g <= 4; g++) {
            var gy = pad + (h * g) / 4;
            svg += '<line x1="' + pad + '" y1="' + gy.toFixed(1) + '" x2="' + (width - pad) + '" y2="' + gy.toFixed(1) + '" stroke="#F3F4F6" stroke-width="0.5"/>';
        }

        // Polyline
        var pts = '';
        for (var i = 0; i < scores.length; i++) {
            var x = pad + i * stepX;
            var y = pad + h - (Math.min(scores[i], 100) / 100) * h;
            pts += x.toFixed(1) + ',' + y.toFixed(1) + ' ';
        }
        svg += '<polyline points="' + pts.trim() + '" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';

        // Dots
        for (var j = 0; j < scores.length; j++) {
            var px = pad + j * stepX;
            var py = pad + h - (Math.min(scores[j], 100) / 100) * h;
            svg += '<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="3" fill="#2563EB"/>';
            svg += '<text x="' + px.toFixed(1) + '" y="' + (py - 8).toFixed(1) + '" text-anchor="middle" font-size="9" fill="#6B7280">' + Math.round(scores[j]) + '</text>';
        }

        svg += '</svg>';
        return svg;
    }

    // ===== 5. FRAMEWORK LOADING =====

    function convertBuiltInToFramework() {
        var domainDefs = {
            domain1: { id: 'source-control', name: 'Source Control & Development', description: 'Version control, branching, code review, quality checks, testing', weight: 0.35, order: 1 },
            domain2: { id: 'security', name: 'Security & Compliance', description: 'Security scanning, vulnerability management, access control, compliance', weight: 0.30, order: 2 },
            domain3: { id: 'cicd', name: 'CI/CD & Deployment', description: 'Build automation, deployment frequency, infrastructure, rollback', weight: 0.35, order: 3 }
        };

        var domainMap = {};
        DMM_QUESTIONS.forEach(function (q) {
            var def = domainDefs[q.domain];
            if (!domainMap[def.id]) {
                domainMap[def.id] = { id: def.id, name: def.name, description: def.description, weight: def.weight, order: def.order, questions: [] };
            }
            domainMap[def.id].questions.push({ id: q.id, text: q.text, options: q.options, order: domainMap[def.id].questions.length + 1 });
        });

        var domains = [];
        for (var key in domainMap) {
            if (domainMap.hasOwnProperty(key)) domains.push(domainMap[key]);
        }
        domains.sort(function (a, b) { return a.order - b.order; });

        return {
            meta: { name: 'DevOps Maturity Model', description: 'Assess your team\'s DevOps capabilities across Source Control, Security, and CI/CD.', version: '1.0' },
            domains: domains
        };
    }

    function getQuestionOptions(question) {
        if (question.options && question.options.length > 0) return question.options;
        return [
            { score: 0, text: 'None / Not Applicable' },
            { score: 1, text: 'Initial / Ad-hoc' },
            { score: 2, text: 'Developing' },
            { score: 3, text: 'Defined' },
            { score: 4, text: 'Managed' },
            { score: 5, text: 'Optimizing' }
        ];
    }

    // ===== 6. SCORING =====

    function calculateScores(responses, framework) {
        var domainScores = {};
        var overall = 0;

        framework.domains.forEach(function (domain) {
            var total = 0;
            var max = 0;
            domain.questions.forEach(function (q) {
                if (responses[q.id] !== undefined) {
                    total += responses[q.id];
                    max += 5;
                }
            });
            var score = max > 0 ? (total / max) * 100 : 0;
            domainScores[domain.id] = { name: domain.name, score: Math.round(score * 100) / 100, weight: domain.weight };
            overall += score * domain.weight;
        });

        var lvl = getMaturityLevel(overall);
        return {
            date: new Date().toISOString(),
            frameworkName: framework.meta.name,
            overallScore: Math.round(overall * 100) / 100,
            maturityLevel: lvl.name,
            maturityLevelInt: lvl.level,
            domainScores: domainScores,
            responses: responses
        };
    }

    // ===== 7. STORAGE HELPERS =====

    function storageGet(key, callback) {
        var productId = spiraAppManager.projectId;
        spiraAppManager.storageGetProduct(
            APP_GUID, APP_NAME, key, productId,
            function (data) {
                if (data && data !== '') {
                    try { callback(JSON.parse(data)); } catch (e) { callback(null); }
                } else {
                    callback(null);
                }
            },
            function () { callback(null); }
        );
    }

    function storageSave(key, value, onSuccess, onError) {
        var productId = spiraAppManager.projectId;
        var json = JSON.stringify(value);
        spiraAppManager.storageUpdateProduct(
            APP_GUID, APP_NAME, key, json, productId,
            function () { if (onSuccess) onSuccess(); },
            function () {
                spiraAppManager.storageInsertProduct(
                    APP_GUID, APP_NAME, key, json, productId, false,
                    function () { if (onSuccess) onSuccess(); },
                    function (err) { if (onError) onError(err); }
                );
            }
        );
    }

    // ===== 8. MUSTACHE TEMPLATES =====

    var TPL_SUMMARY = [
        '<div class="dmm-widget">',
        '{{#hasHistory}}',
        '<div class="dmm-card">',
            '<div class="dmm-gauge-container">{{{gauge}}}</div>',
            '<h3 class="dmm-title">{{frameworkName}}</h3>',
            '<div class="dmm-level-badge dmm-level-{{level}}">{{levelName}}</div>',
            '<p class="dmm-meta">Last assessed: {{date}}</p>',
            '<div class="dmm-actions">',
                '<button id="btn-start" class="dmm-btn">New Assessment</button>',
                '{{#showHistory}}<button id="btn-history" class="dmm-btn dmm-btn-secondary">History ({{historyCount}})</button>{{/showHistory}}',
            '</div>',
        '</div>',
        '{{/hasHistory}}',
        '{{^hasHistory}}',
        '<div class="dmm-card dmm-empty">',
            '<svg class="dmm-empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5">',
                '<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>',
                '<path d="M9 14l2 2 4-4"/>',
            '</svg>',
            '<h3 class="dmm-title">DevOps Maturity Assessment</h3>',
            '<p class="dmm-meta">Evaluate your team\'s DevOps practices and track improvement over time.</p>',
            '<div class="dmm-actions">',
                '<button id="btn-start" class="dmm-btn">Start Assessment</button>',
            '</div>',
        '</div>',
        '{{/hasHistory}}',
        '</div>'
    ].join('\n');

    var TPL_FORM = [
        '<div class="dmm-widget">',
        '<div class="dmm-form-header">',
            '<h3 class="dmm-title">{{frameworkName}}</h3>',
            '<p class="dmm-meta">{{questionCount}} questions across {{domainCount}} domains</p>',
        '</div>',
        '<div class="dmm-progress">',
            '<div class="dmm-progress-bar" id="dmm-progress-bar"></div>',
            '<span class="dmm-progress-text" id="dmm-progress-text">0 / {{questionCount}}</span>',
        '</div>',
        '<div class="dmm-tabs" id="dmm-tabs">',
            '{{#domains}}<button class="dmm-tab" data-domain-index="{{index}}">{{name}}</button>{{/domains}}',
        '</div>',
        '<form id="dmm-form">',
            '{{#domains}}',
            '<div class="dmm-domain-page" data-domain="{{id}}" id="dmm-domain-{{index}}">',
                '{{#questions}}',
                '<div class="dmm-question-card" id="qcard-{{questionId}}">',
                    '<span class="dmm-question-text">{{text}}</span>',
                    '{{#hasGuidance}}<p class="dmm-guidance">{{guidance}}</p>{{/hasGuidance}}',
                    '<div class="dmm-options">',
                        '{{#options}}<label class="dmm-option"><input type="radio" name="{{questionId}}" value="{{score}}"><span class="dmm-option-text">{{text}}</span><span class="dmm-option-score">{{score}}</span></label>{{/options}}',
                    '</div>',
                '</div>',
                '{{/questions}}',
            '</div>',
            '{{/domains}}',
        '</form>',
        '<div class="dmm-nav">',
            '<button type="button" id="btn-prev" class="dmm-btn dmm-btn-secondary">Previous</button>',
            '<button type="button" id="btn-cancel" class="dmm-btn dmm-btn-outline">Cancel</button>',
            '<button type="button" id="btn-next" class="dmm-btn">Next</button>',
            '<button type="button" id="btn-submit" class="dmm-btn" style="display:none">Submit Assessment</button>',
        '</div>',
        '</div>'
    ].join('\n');

    var TPL_RESULTS = [
        '<div class="dmm-widget">',
        '<div class="dmm-card">',
            '<h3 class="dmm-title">Assessment Complete</h3>',
            '<div class="dmm-gauge-container">{{{gauge}}}</div>',
            '<div class="dmm-level-badge dmm-level-{{level}}">{{levelName}}</div>',
            '<h4 class="dmm-section-title">Domain Scores</h4>',
            '{{{domainBars}}}',
            '{{#showRadar}}',
            '<h4 class="dmm-section-title">Comparison</h4>',
            '<div class="dmm-radar-container">{{{radar}}}</div>',
            '{{/showRadar}}',
            '<div class="dmm-actions">',
                '<button id="btn-publish" class="dmm-btn dmm-btn-publish">Publish to Spira</button>',
                '<button id="btn-back" class="dmm-btn dmm-btn-secondary">Back to Dashboard</button>',
            '</div>',
        '</div>',
        '</div>'
    ].join('\n');

    var TPL_HISTORY = [
        '<div class="dmm-widget">',
        '<div class="dmm-card">',
            '<h3 class="dmm-title">Assessment History</h3>',
            '{{#hasTrend}}',
            '<h4 class="dmm-section-title">Score Trend</h4>',
            '<div class="dmm-trend-container">{{{trendLine}}}</div>',
            '{{/hasTrend}}',
            '<div class="dmm-history-list">',
                '{{#assessments}}',
                '<div class="dmm-history-item">',
                    '<div class="dmm-history-left">',
                        '<span class="dmm-history-score">{{score}}%</span>',
                        '<span class="dmm-level-badge dmm-level-{{level}} dmm-badge-sm">{{levelName}}</span>',
                    '</div>',
                    '<div class="dmm-history-right">',
                        '<span class="dmm-history-framework">{{framework}}</span>',
                        '<span class="dmm-history-date">{{date}}</span>',
                    '</div>',
                '</div>',
                '{{/assessments}}',
            '</div>',
            '<div class="dmm-actions">',
                '<button id="btn-back-summary" class="dmm-btn dmm-btn-secondary">Back</button>',
                '<button id="btn-start-new" class="dmm-btn">New Assessment</button>',
            '</div>',
        '</div>',
        '</div>'
    ].join('\n');

    // ===== 9. VIEW RENDERERS =====

    function getContainer() {
        // Prefer runtime-provided element, fallback for older Spira versions
        if (typeof WIDGET_ELEMENT !== 'undefined' && WIDGET_ELEMENT) return WIDGET_ELEMENT;
        return document.getElementById(APP_GUID.toLowerCase() + '_content') ||
               document.getElementById(APP_GUID + '_content');
    }

    function renderSummary() {
        var el = getContainer();
        if (!el) return;

        var data = { hasHistory: false };

        if (assessmentHistory.length > 0) {
            var sorted = assessmentHistory.slice().sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
            var latest = sorted[0];
            data = {
                hasHistory: true,
                gauge: generateScoreGauge(latest.overallScore, 120),
                frameworkName: latest.frameworkName || 'DevOps Maturity Model',
                levelName: latest.maturityLevel,
                level: latest.maturityLevelInt,
                date: fmtDate(latest.date),
                showHistory: assessmentHistory.length > 1,
                historyCount: assessmentHistory.length
            };
        }

        el.innerHTML = Mustache.render(TPL_SUMMARY, data);
        bindClick('btn-start', handleStart);
        bindClick('btn-history', function () { renderHistory(); });
    }

    function renderAssessmentForm() {
        var el = getContainer();
        if (!el) return;
        currentDomainIndex = 0;

        // Build template data
        var domains = activeFramework.domains.map(function (d, idx) {
            return {
                id: d.id,
                name: d.name,
                index: idx,
                questions: d.questions.map(function (q) {
                    var opts = getQuestionOptions(q);
                    return {
                        id: q.id,
                        text: q.text,
                        guidance: q.guidance || '',
                        hasGuidance: !!(q.guidance),
                        questionId: q.id,
                        options: opts
                    };
                })
            };
        });

        var totalQ = 0;
        domains.forEach(function (d) { totalQ += d.questions.length; });

        el.innerHTML = Mustache.render(TPL_FORM, {
            frameworkName: activeFramework.meta.name,
            domainCount: domains.length,
            questionCount: totalQ,
            domains: domains
        });

        updateDomainView();
        updateProgress();

        // Navigation
        bindClick('btn-prev', function () { navigateDomain(-1); });
        bindClick('btn-next', function () { navigateDomain(1); });
        bindClick('btn-cancel', handleCancel);
        bindClick('btn-submit', handleSubmit);

        // Tab clicks
        var tabs = el.querySelectorAll('.dmm-tab');
        for (var t = 0; t < tabs.length; t++) {
            (function (tab) {
                tab.addEventListener('click', function () {
                    currentDomainIndex = parseInt(this.getAttribute('data-domain-index'));
                    updateDomainView();
                });
            })(tabs[t]);
        }

        // Radio changes update progress + mark answered cards
        var radios = el.querySelectorAll('input[type="radio"]');
        for (var r = 0; r < radios.length; r++) {
            radios[r].addEventListener('change', function () {
                updateProgress();
                var card = this.closest('.dmm-question-card');
                if (card) card.classList.add('answered');
            });
        }
    }

    function updateDomainView() {
        var el = getContainer();
        if (!el) return;
        var pages = el.querySelectorAll('.dmm-domain-page');
        var tabs = el.querySelectorAll('.dmm-tab');
        var n = pages.length;

        for (var i = 0; i < pages.length; i++) {
            pages[i].classList.toggle('active', i === currentDomainIndex);
        }
        for (var j = 0; j < tabs.length; j++) {
            tabs[j].classList.toggle('active', j === currentDomainIndex);
        }

        // Mark completed tabs
        for (var k = 0; k < tabs.length; k++) {
            var domain = activeFramework.domains[k];
            if (domain) {
                var allAnswered = true;
                for (var q = 0; q < domain.questions.length; q++) {
                    if (!el.querySelector('input[name="' + domain.questions[q].id + '"]:checked')) {
                        allAnswered = false;
                        break;
                    }
                }
                tabs[k].classList.toggle('completed', allAnswered && k !== currentDomainIndex);
            }
        }

        // Show/hide nav buttons
        var btnPrev = document.getElementById('btn-prev');
        var btnNext = document.getElementById('btn-next');
        var btnSubmit = document.getElementById('btn-submit');

        if (btnPrev) btnPrev.style.display = currentDomainIndex > 0 ? '' : 'none';
        if (btnNext) btnNext.style.display = currentDomainIndex < n - 1 ? '' : 'none';
        if (btnSubmit) btnSubmit.style.display = currentDomainIndex === n - 1 ? '' : 'none';
    }

    function navigateDomain(dir) {
        var el = getContainer();
        if (!el) return;
        var pages = el.querySelectorAll('.dmm-domain-page');
        var newIdx = currentDomainIndex + dir;
        if (newIdx >= 0 && newIdx < pages.length) {
            currentDomainIndex = newIdx;
            updateDomainView();
            // Scroll form area to top
            var formEl = el.querySelector('.dmm-domain-page.active');
            if (formEl) formEl.scrollTop = 0;
        }
    }

    function updateProgress() {
        var el = getContainer();
        if (!el) return;
        var totalQ = 0;
        activeFramework.domains.forEach(function (d) { totalQ += d.questions.length; });

        var answered = 0;
        activeFramework.domains.forEach(function (d) {
            d.questions.forEach(function (q) {
                if (el.querySelector('input[name="' + q.id + '"]:checked')) answered++;
            });
        });

        var pct = totalQ > 0 ? Math.round((answered / totalQ) * 100) : 0;
        var bar = document.getElementById('dmm-progress-bar');
        var text = document.getElementById('dmm-progress-text');
        if (bar) bar.style.width = pct + '%';
        if (text) text.textContent = answered + ' / ' + totalQ;
    }

    function renderResults(result) {
        var el = getContainer();
        if (!el) return;

        // Build domain bar HTML
        var domainBars = '';
        for (var id in result.domainScores) {
            if (result.domainScores.hasOwnProperty(id)) {
                var d = result.domainScores[id];
                var lvl = getMaturityLevel(d.score);
                domainBars += '<div class="dmm-domain-bar">' +
                    '<div class="dmm-domain-bar-label">' + d.name + '</div>' +
                    '<div class="dmm-domain-bar-track"><div class="dmm-domain-bar-fill" style="width:' + d.score + '%;background:' + lvl.color + '"></div></div>' +
                    '<div class="dmm-domain-bar-score">' + Math.round(d.score) + '%</div></div>';
            }
        }

        var domainCount = 0;
        for (var k in result.domainScores) { if (result.domainScores.hasOwnProperty(k)) domainCount++; }
        var showRadar = domainCount >= 3;

        el.innerHTML = Mustache.render(TPL_RESULTS, {
            gauge: generateScoreGauge(result.overallScore, 140),
            levelName: result.maturityLevel,
            level: result.maturityLevelInt,
            domainBars: domainBars,
            showRadar: showRadar,
            radar: showRadar ? generateRadarChart(result.domainScores, 240) : ''
        });

        bindClick('btn-publish', function () { publishToSpira(result); });
        bindClick('btn-back', function () { renderSummary(); });
    }

    function renderHistory() {
        var el = getContainer();
        if (!el) return;

        var sorted = assessmentHistory.slice().sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
        var scores = sorted.slice().reverse().map(function (a) { return a.overallScore; });

        el.innerHTML = Mustache.render(TPL_HISTORY, {
            hasTrend: scores.length >= 2,
            trendLine: generateTrendLine(scores, 320, 100),
            assessments: sorted.map(function (a) {
                return {
                    score: Math.round(a.overallScore),
                    levelName: a.maturityLevel,
                    level: a.maturityLevelInt,
                    date: fmtDate(a.date),
                    framework: a.frameworkName || 'DevOps Maturity Model'
                };
            })
        });

        bindClick('btn-back-summary', function () { renderSummary(); });
        bindClick('btn-start-new', handleStart);
    }

    // ===== 10. EVENT HANDLERS =====

    function handleStart() {
        renderAssessmentForm();
    }

    function handleCancel() {
        renderSummary();
    }

    function handleSubmit() {
        var el = getContainer();
        if (!el) return;
        var btn = document.getElementById('btn-submit');

        // Collect responses
        var responses = {};
        var unanswered = [];

        activeFramework.domains.forEach(function (domain) {
            domain.questions.forEach(function (q) {
                var checked = el.querySelector('input[name="' + q.id + '"]:checked');
                if (checked) {
                    responses[q.id] = parseInt(checked.value);
                } else {
                    unanswered.push(q.id);
                }
            });
        });

        if (unanswered.length > 0) {
            spiraAppManager.displayErrorMessage('Please answer all questions. ' + unanswered.length + ' remaining.');
            // Navigate to first unanswered domain
            for (var i = 0; i < activeFramework.domains.length; i++) {
                var found = false;
                for (var j = 0; j < activeFramework.domains[i].questions.length; j++) {
                    if (unanswered.indexOf(activeFramework.domains[i].questions[j].id) >= 0) {
                        currentDomainIndex = i;
                        updateDomainView();
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }
            return;
        }

        if (btn) { btn.textContent = 'Saving...'; btn.disabled = true; }

        var result = calculateScores(responses, activeFramework);
        assessmentHistory.push(result);

        storageSave(STORAGE_KEY, assessmentHistory,
            function () { renderResults(result); },
            function () {
                spiraAppManager.displayErrorMessage('Failed to save assessment. Results are shown but may not persist.');
                renderResults(result);
            }
        );
    }

    // ===== 11. PUBLISH TO SPIRA =====

    function generateHtmlReport(result) {
        var domainRows = '';
        for (var id in result.domainScores) {
            if (result.domainScores.hasOwnProperty(id)) {
                var d = result.domainScores[id];
                var lvl = getMaturityLevel(d.score);
                domainRows += '<tr><td style="padding:8px;border-bottom:1px solid #eee">' + d.name +
                    '</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center;font-weight:bold;color:' + lvl.color + '">' +
                    Math.round(d.score) + '%</td><td style="padding:8px;border-bottom:1px solid #eee">' + lvl.name + '</td></tr>';
            }
        }

        var overallLvl = getMaturityLevel(result.overallScore);
        return [
            '<!DOCTYPE html><html><head><meta charset="utf-8"><title>DevOps Maturity Assessment</title></head>',
            '<body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;max-width:700px;margin:20px auto;color:#1F2937">',
            '<h1 style="font-size:20px;margin-bottom:4px">DevOps Maturity Assessment Report</h1>',
            '<p style="color:#6B7280;margin-top:0">Framework: ' + (result.frameworkName || 'DevOps Maturity Model') + ' &mdash; ' + new Date(result.date).toLocaleDateString() + '</p>',
            '<div style="text-align:center;padding:20px;background:#F9FAFB;border-radius:8px;margin:16px 0">',
            '<div style="font-size:48px;font-weight:bold;color:' + overallLvl.color + '">' + Math.round(result.overallScore) + '%</div>',
            '<div style="display:inline-block;padding:4px 16px;border-radius:12px;font-size:14px;font-weight:600;background:' + overallLvl.color + '20;color:' + overallLvl.color + '">' + result.maturityLevel + ' (Level ' + result.maturityLevelInt + ')</div>',
            '</div>',
            '<h2 style="font-size:16px;margin-top:24px">Domain Scores</h2>',
            '<table style="width:100%;border-collapse:collapse"><thead><tr style="background:#F3F4F6">',
            '<th style="padding:8px;text-align:left">Domain</th><th style="padding:8px;text-align:center">Score</th><th style="padding:8px;text-align:left">Level</th></tr></thead>',
            '<tbody>' + domainRows + '</tbody></table>',
            '<hr style="margin:24px 0;border:none;border-top:1px solid #E5E7EB">',
            '<p style="font-size:12px;color:#9CA3AF">Generated by DevOps Maturity Assessment SpiraApp v1.0</p>',
            '</body></html>'
        ].join('\n');
    }

    function publishToSpira(result) {
        var btn = document.getElementById('btn-publish');
        if (btn) { btn.textContent = 'Publishing...'; btn.disabled = true; }

        // Check permission to create documents (artifact type 13)
        if (typeof spiraAppManager.canCreateArtifactType === 'function' && !spiraAppManager.canCreateArtifactType(13)) {
            spiraAppManager.displayErrorMessage('You do not have permission to create documents in this product.');
            if (btn) { btn.textContent = 'Publish to Spira'; btn.disabled = false; }
            return;
        }

        var projectId = spiraAppManager.projectId;
        var dateStr = new Date(result.date).toISOString().split('T')[0];
        var htmlReport = generateHtmlReport(result);

        var payload = {
            BinaryData: btoa(unescape(encodeURIComponent(htmlReport))),
            FilenameOrUrl: 'DOMM_Assessment_' + dateStr + '.html',
            AttachmentTypeId: 1,
            Description: 'DevOps Maturity Assessment - ' + Math.round(result.overallScore) + '% (' + result.maturityLevel + ') - ' + (result.frameworkName || 'DevOps Maturity Model'),
            Tags: 'devops,assessment,maturity',
            CustomProperties: [
                { CustomPropertyFieldName: 'Custom_01', CustomPropertyTypeId: 2, IntegerValue: Math.round(result.overallScore) },
                { CustomPropertyFieldName: 'Custom_02', CustomPropertyTypeId: 1, StringValue: result.maturityLevel }
            ]
        };

        spiraAppManager.executeApi(
            APP_NAME,
            '7.0',
            'POST',
            'projects/' + projectId + '/documents/file',
            JSON.stringify(payload),
            function (response) {
                spiraAppManager.displaySuccessMessage('Assessment published to Spira Documents');
                if (btn) { btn.textContent = 'Published'; btn.disabled = true; btn.classList.add('dmm-btn-published'); }
            },
            function (err) {
                var msg = (err && err.message) ? err.message : 'Unknown error';
                spiraAppManager.displayErrorMessage('Failed to publish: ' + msg);
                if (btn) { btn.textContent = 'Publish to Spira'; btn.disabled = false; }
            }
        );
    }

    // ===== 12. HELPERS =====

    function bindClick(id, fn) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('click', fn);
    }

    function fmtDate(iso) {
        try { return spiraAppManager.formatDate(iso); }
        catch (e) { return new Date(iso).toLocaleDateString(); }
    }

    // ===== 12. INIT =====

    function init() {
        injectStyles();

        // Load custom framework (if any), then history
        storageGet(CUSTOM_FRAMEWORK_KEY, function (customFw) {
            if (customFw && customFw.meta && customFw.domains && customFw.domains.length > 0) {
                activeFramework = customFw;
            } else {
                activeFramework = convertBuiltInToFramework();
            }

            storageGet(STORAGE_KEY, function (history) {
                assessmentHistory = Array.isArray(history) ? history : [];
                renderSummary();
            });
        });
    }

    spiraAppManager.registerEvent_windowLoad(init);
    spiraAppManager.registerEvent_dashboardUpdated(init);

})();
