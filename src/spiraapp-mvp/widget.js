// DevOps Maturity Model SpiraApp Widget

(function () {

    // --- CONSTANTS & CONFIG ---
    const DMM_STORAGE_KEY = "dmm_assessments_history";
    // Defined in manifest.yaml
    // Defined in manifest.yaml
    const APP_GUID = "4B8D9721-6A99-4786-903D-9346739A0673";
    const APP_NAME = "DevOpsMaturityAssessment"; // Must match manifest name (no spaces)
    const DOMAIN_WEIGHTS = {
        "domain1": 0.35, // Source Control
        "domain2": 0.30, // Security
        "domain3": 0.35  // CI/CD
    };

    // ... (Styles omitted for brevity) ...

    // 4. Handle Submit & Scoring
    function handleSubmit() {
        dmmLog("handleSubmit called", {});

        // Visual feedback immediately
        const btnSubmit = document.getElementById("btn-submit-dmm");
        if (btnSubmit) {
            btnSubmit.innerHTML = "Calculating...";
            btnSubmit.disabled = true;
        }

        // Collect responses
        const form = document.getElementById("dmm-form");
        if (!form) {
            dmmLog("Error: form element not found", {});
            spiraAppManager.displayErrorMessage("Error: Could not find assessment form.");
            if (btnSubmit) { btnSubmit.innerHTML = "Submit Assessment"; btnSubmit.disabled = false; }
            return;
        }

        let responses = {};
        let allAnswered = true;

        // We know the IDs are Q1...Q20
        DMM_QUESTIONS.forEach(q => {
            const radios = form.querySelectorAll(`input[name="${q.id}"]`);
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
            spiraAppManager.displayErrorMessage("Please answer all questions before submitting.");
            if (btnSubmit) { btnSubmit.innerHTML = "Submit Assessment"; btnSubmit.disabled = false; }
            return;
        }

        dmmLog("All questions answered, calculating scores", {});
        // Calculate Scores (Logic from spec)
        const results = calculateScores(responses);
        dmmLog("Scores calculated", { overall: results.overallScore, level: results.maturityLevel });

        // Save
        saveAssessmentResults(results);
    }

    function calculateScores(responses) {
        // 1. Domain Scores
        // Domain Score = (Total Points / Max Possible) * 100
        let domainTotals = {
            domain1: { current: 0, max: 0 },
            domain2: { current: 0, max: 0 },
            domain3: { current: 0, max: 0 }
        };

        DMM_QUESTIONS.forEach(q => {
            const r = responses[q.id];
            if (r) {
                domainTotals[r.domain].current += r.score;
                domainTotals[r.domain].max += 5; // Max score per question is 5
            }
        });

        const d1Score = (domainTotals.domain1.current / domainTotals.domain1.max) * 100;
        const d2Score = (domainTotals.domain2.current / domainTotals.domain2.max) * 100;
        const d3Score = (domainTotals.domain3.current / domainTotals.domain3.max) * 100;

        // 2. Overall Score (Weighted)
        // D1: 35%, D2: 30%, D3: 35%
        const overall = (d1Score * DOMAIN_WEIGHTS.domain1) +
            (d2Score * DOMAIN_WEIGHTS.domain2) +
            (d3Score * DOMAIN_WEIGHTS.domain3);

        // 3. Maturity Level
        let level = 1;
        let levelName = "Initial";
        if (overall > 20) { level = 2; levelName = "Developing"; }
        if (overall > 40) { level = 3; levelName = "Defined"; }
        if (overall > 60) { level = 4; levelName = "Managed"; }
        if (overall > 80) { level = 5; levelName = "Optimizing"; }

        return {
            date: new Date().toISOString(),
            overallScore: Math.round(overall * 100) / 100, // 2 decimals
            maturityLevel: levelName,
            maturityLevelInt: level,
            domain1Score: Math.round(d1Score),
            domain2Score: Math.round(d2Score),
            domain3Score: Math.round(d3Score),
            responses: responses
        };
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
