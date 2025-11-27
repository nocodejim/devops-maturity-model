#!/bin/bash

# Phase 6: Integration Testing
# Based on docs/TESTING-SESSION-PROMPT.md

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_DIR="$SCRIPT_DIR/../results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RESULT_FILE="$RESULTS_DIR/integration_${TIMESTAMP}.log"

# Create results directory if it doesn't exist
mkdir -p "$RESULTS_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "$1" | tee -a "$RESULT_FILE"
}

test_passed() {
    log "${GREEN}✅ PASS: $1${NC}"
}

test_failed() {
    log "${RED}❌ FAIL: $1${NC}"
}

test_warning() {
    log "${YELLOW}⚠️  WARN: $1${NC}"
}

log "=== DevOps Maturity Assessment - Integration Tests ==="
log "Started: $(date)"
log "Results: $RESULT_FILE"
log ""

# Check if we have a saved token from backend tests
TOKEN_FILE="$RESULTS_DIR/auth_token.txt"
if [ -f "$TOKEN_FILE" ]; then
    TOKEN=$(cat "$TOKEN_FILE")
    log "Using saved authentication token from backend tests"
else
    log "No saved token found, attempting fresh login..."
    TOKEN=""
fi

# Test 1: Login and capture token (if not already available)
log "Test 1: Authentication setup..."
if [ -z "$TOKEN" ]; then
    LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8680/api/auth/login \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -d "username=admin@example.com&password=admin123" 2>/dev/null || echo "ERROR")
    
    if [ "$LOGIN_RESPONSE" = "ERROR" ]; then
        test_failed "Cannot authenticate - login endpoint not accessible"
        exit 1
    else
        TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('access_token', ''))" 2>/dev/null || echo "")
        if [[ "$TOKEN" == eyJ* ]]; then
            test_passed "Successfully authenticated and obtained token"
        else
            test_failed "Authentication failed - invalid token received"
            exit 1
        fi
    fi
else
    test_passed "Using existing authentication token"
fi

log ""

# Test 2: Create assessment
log "Test 2: Creating test assessment..."
CREATE_RESPONSE=$(curl -s -X POST http://localhost:8680/api/assessments/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "team_name": "Integration Test Team",
    "status": "in_progress"
  }' 2>/dev/null || echo "ERROR")

if [ "$CREATE_RESPONSE" = "ERROR" ]; then
    test_failed "Cannot create assessment - endpoint not accessible"
    ASSESSMENT_ID=""
else
    if echo "$CREATE_RESPONSE" | python3 -m json.tool > /dev/null 2>&1; then
        ASSESSMENT_ID=$(echo "$CREATE_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('id', ''))" 2>/dev/null || echo "")
        TEAM_NAME=$(echo "$CREATE_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('team_name', ''))" 2>/dev/null || echo "")
        
        if [ -n "$ASSESSMENT_ID" ] && [ "$TEAM_NAME" = "Integration Test Team" ]; then
            test_passed "Assessment created successfully"
            log "Assessment ID: $ASSESSMENT_ID"
        else
            test_failed "Assessment creation returned invalid data"
            log "Response: $CREATE_RESPONSE"
            ASSESSMENT_ID=""
        fi
    else
        test_failed "Assessment creation response is not valid JSON"
        log "Response: $CREATE_RESPONSE"
        ASSESSMENT_ID=""
    fi
fi

log ""

# Test 3: Submit gate responses (sample responses for first few gates)
log "Test 3: Submitting sample assessment responses..."
if [ -z "$ASSESSMENT_ID" ]; then
    test_failed "Cannot test responses - no valid assessment ID"
else
    # Submit responses for first 2 gates (4 questions total)
    RESPONSES_JSON='{
      "responses": [
        {"domain": "domain1", "gate_id": "gate_1_1", "question_id": "q1", "score": 3, "notes": "Integration test response 1"},
        {"domain": "domain1", "gate_id": "gate_1_1", "question_id": "q2", "score": 4, "notes": "Integration test response 2"},
        {"domain": "domain1", "gate_id": "gate_1_2", "question_id": "q3", "score": 2, "notes": "Integration test response 3"},
        {"domain": "domain1", "gate_id": "gate_1_2", "question_id": "q4", "score": 5, "notes": "Integration test response 4"}
      ]
    }'
    
    RESPONSES_RESPONSE=$(curl -s -X POST "http://localhost:8680/api/assessments/$ASSESSMENT_ID/responses" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "$RESPONSES_JSON" 2>/dev/null || echo "ERROR")
    
    if [ "$RESPONSES_RESPONSE" = "ERROR" ]; then
        test_failed "Cannot submit responses - endpoint not accessible"
    else
        if echo "$RESPONSES_RESPONSE" | python3 -m json.tool > /dev/null 2>&1; then
            # Check if response is an array of response objects
            RESPONSE_COUNT=$(echo "$RESPONSES_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data) if isinstance(data, list) else 0)" 2>/dev/null || echo "0")
            if [ "$RESPONSE_COUNT" -gt 0 ]; then
                test_passed "Assessment responses submitted successfully"
                log "Responses created: $RESPONSE_COUNT"
            else
                test_failed "Response submission failed - no responses returned"
                log "Response: $RESPONSES_RESPONSE"
            fi
        else
            test_failed "Response submission returned invalid JSON"
            log "Response: $RESPONSES_RESPONSE"
        fi
    fi
fi

log ""

# Test 4: Retrieve assessment with responses
log "Test 4: Retrieving assessment data..."
if [ -z "$ASSESSMENT_ID" ]; then
    test_failed "Cannot test retrieval - no valid assessment ID"
else
    GET_RESPONSE=$(curl -s "http://localhost:8680/api/assessments/$ASSESSMENT_ID" \
      -H "Authorization: Bearer $TOKEN" 2>/dev/null || echo "ERROR")
    
    if [ "$GET_RESPONSE" = "ERROR" ]; then
        test_failed "Cannot retrieve assessment - endpoint not accessible"
    else
        if echo "$GET_RESPONSE" | python3 -m json.tool > /dev/null 2>&1; then
            RETRIEVED_ID=$(echo "$GET_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('id', ''))" 2>/dev/null || echo "")
            RESPONSES_COUNT=$(echo "$GET_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('responses', [])))" 2>/dev/null || echo "0")
            
            if [ "$RETRIEVED_ID" = "$ASSESSMENT_ID" ]; then
                test_passed "Assessment retrieved successfully"
                log "Responses count: $RESPONSES_COUNT"
            else
                test_failed "Retrieved assessment ID mismatch"
            fi
        else
            test_failed "Assessment retrieval returned invalid JSON"
        fi
    fi
fi

log ""

# Test 5: List assessments (should include our test assessment)
log "Test 5: Listing all assessments..."
LIST_RESPONSE=$(curl -s http://localhost:8680/api/assessments/ \
  -H "Authorization: Bearer $TOKEN" 2>/dev/null || echo "ERROR")

if [ "$LIST_RESPONSE" = "ERROR" ]; then
    test_failed "Cannot list assessments - endpoint not accessible"
else
    if echo "$LIST_RESPONSE" | python3 -m json.tool > /dev/null 2>&1; then
        ASSESSMENT_COUNT=$(echo "$LIST_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data))" 2>/dev/null || echo "0")
        
        if [ "$ASSESSMENT_COUNT" -gt 0 ]; then
            test_passed "Assessments list retrieved successfully"
            log "Total assessments: $ASSESSMENT_COUNT"
            
            # Check if our test assessment is in the list
            if [ -n "$ASSESSMENT_ID" ]; then
                FOUND_TEST=$(echo "$LIST_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(any(item.get('id') == '$ASSESSMENT_ID' for item in data))" 2>/dev/null || echo "False")
                if [ "$FOUND_TEST" = "True" ]; then
                    test_passed "Test assessment found in list"
                else
                    test_warning "Test assessment not found in list"
                fi
            fi
        else
            test_warning "No assessments found in list"
        fi
    else
        test_failed "Assessments list returned invalid JSON"
    fi
fi

log ""

# Test 6: Test assessment completion workflow
log "Test 6: Testing assessment completion..."
if [ -z "$ASSESSMENT_ID" ]; then
    test_failed "Cannot test completion - no valid assessment ID"
else
    # Try to complete the assessment (this might require all responses)
    COMPLETE_RESPONSE=$(curl -s -X PUT "http://localhost:8680/api/assessments/$ASSESSMENT_ID/complete" \
      -H "Authorization: Bearer $TOKEN" 2>/dev/null || echo "ERROR")
    
    if [ "$COMPLETE_RESPONSE" = "ERROR" ]; then
        test_warning "Assessment completion endpoint not accessible (may not be implemented)"
    else
        if echo "$COMPLETE_RESPONSE" | python3 -m json.tool > /dev/null 2>&1; then
            STATUS=$(echo "$COMPLETE_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('status', ''))" 2>/dev/null || echo "")
            if [ "$STATUS" = "completed" ]; then
                test_passed "Assessment completed successfully"
            else
                test_warning "Assessment completion returned status: $STATUS"
            fi
        else
            test_warning "Assessment completion returned non-JSON response"
        fi
    fi
fi

log ""

# Test 7: Cleanup - Delete test assessment
log "Test 7: Cleaning up test data..."
if [ -z "$ASSESSMENT_ID" ]; then
    test_warning "No test assessment to clean up"
else
    DELETE_RESPONSE=$(curl -s -X DELETE "http://localhost:8680/api/assessments/$ASSESSMENT_ID" \
      -H "Authorization: Bearer $TOKEN" -o /dev/null -w "%{http_code}" 2>/dev/null || echo "000")
    
    if [ "$DELETE_RESPONSE" = "204" ] || [ "$DELETE_RESPONSE" = "200" ]; then
        test_passed "Test assessment deleted successfully"
    else
        test_warning "Test assessment deletion returned status: $DELETE_RESPONSE (manual cleanup may be needed)"
    fi
fi

log ""
log "=== Integration Tests Complete ==="
log "Completed: $(date)"

# Summary
PASS_COUNT=$(grep -c "✅ PASS" "$RESULT_FILE" || echo "0")
FAIL_COUNT=$(grep -c "❌ FAIL" "$RESULT_FILE" || echo "0")
WARN_COUNT=$(grep -c "⚠️  WARN" "$RESULT_FILE" || echo "0")

log ""
log "Summary: $PASS_COUNT passed, $FAIL_COUNT failed, $WARN_COUNT warnings"

if [ "$FAIL_COUNT" -gt 0 ]; then
    log "${RED}Integration tests failed. Check the issues above.${NC}"
    exit 1
else
    log "${GREEN}All integration tests passed!${NC}"
    if [ "$WARN_COUNT" -gt 0 ]; then
        log "${YELLOW}Note: $WARN_COUNT warnings found - review for potential issues${NC}"
    fi
fi