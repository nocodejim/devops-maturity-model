#!/bin/bash

# Phase 2: Backend API Testing
# Based on docs/TESTING-SESSION-PROMPT.md

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_DIR="$SCRIPT_DIR/../results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RESULT_FILE="$RESULTS_DIR/backend_api_${TIMESTAMP}.log"

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

log "=== DevOps Maturity Assessment - Backend API Tests ==="
log "Started: $(date)"
log "Results: $RESULT_FILE"
log ""

# Test 1: Root endpoint
log "Test 1: Testing root endpoint..."
RESPONSE=$(curl -s http://localhost:8680/ 2>/dev/null || echo "ERROR")
if [ "$RESPONSE" = "ERROR" ]; then
    test_failed "Root endpoint not accessible"
else
    if echo "$RESPONSE" | python3 -m json.tool > /dev/null 2>&1; then
        STATUS=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('status', 'unknown'))" 2>/dev/null || echo "unknown")
        SERVICE=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('service', 'unknown'))" 2>/dev/null || echo "unknown")
        
        if [ "$STATUS" = "healthy" ] && [[ "$SERVICE" == *"DevOps Maturity"* ]]; then
            test_passed "Root endpoint returns correct response"
            log "Service: $SERVICE, Status: $STATUS"
        else
            test_failed "Root endpoint response incorrect"
            log "Response: $RESPONSE"
        fi
    else
        test_failed "Root endpoint response is not valid JSON"
        log "Response: $RESPONSE"
    fi
fi

log ""

# Test 2: Health endpoint
log "Test 2: Testing health endpoint..."
RESPONSE=$(curl -s http://localhost:8680/health 2>/dev/null || echo "ERROR")
if [ "$RESPONSE" = "ERROR" ]; then
    test_failed "Health endpoint not accessible"
else
    if echo "$RESPONSE" | python3 -m json.tool > /dev/null 2>&1; then
        STATUS=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('status', 'unknown'))" 2>/dev/null || echo "unknown")
        DATABASE=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('database', 'unknown'))" 2>/dev/null || echo "unknown")
        
        if [ "$STATUS" = "healthy" ] && [ "$DATABASE" = "connected" ]; then
            test_passed "Health endpoint shows healthy status"
        else
            test_failed "Health endpoint shows unhealthy status"
            log "Status: $STATUS, Database: $DATABASE"
        fi
    else
        test_failed "Health endpoint response is not valid JSON"
        log "Response: $RESPONSE"
    fi
fi

log ""

# Test 3: Gates endpoint (no auth required)
log "Test 3: Testing gates endpoint..."
RESPONSE=$(curl -s http://localhost:8680/api/gates/ 2>/dev/null || echo "ERROR")
if [ "$RESPONSE" = "ERROR" ]; then
    test_failed "Gates endpoint not accessible"
else
    if echo "$RESPONSE" | python3 -m json.tool > /dev/null 2>&1; then
        TOTAL_GATES=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('total_gates', 0))" 2>/dev/null || echo "0")
        TOTAL_QUESTIONS=$(echo "$RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('total_questions', 0))" 2>/dev/null || echo "0")
        
        if [ "$TOTAL_GATES" = "20" ] && [ "$TOTAL_QUESTIONS" = "40" ]; then
            test_passed "Gates endpoint returns correct data structure"
            log "Gates: $TOTAL_GATES, Questions: $TOTAL_QUESTIONS"
        else
            test_failed "Gates endpoint data structure incorrect"
            log "Gates: $TOTAL_GATES, Questions: $TOTAL_QUESTIONS (expected 20/40)"
        fi
    else
        test_failed "Gates endpoint response is not valid JSON"
    fi
fi

log ""

# Test 4: Login endpoint
log "Test 4: Testing login endpoint..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8680/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@example.com&password=admin123" 2>/dev/null || echo "ERROR")

if [ "$LOGIN_RESPONSE" = "ERROR" ]; then
    test_failed "Login endpoint not accessible"
    TOKEN=""
else
    if echo "$LOGIN_RESPONSE" | python3 -m json.tool > /dev/null 2>&1; then
        TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('access_token', ''))" 2>/dev/null || echo "")
        TOKEN_TYPE=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('token_type', ''))" 2>/dev/null || echo "")
        
        if [[ "$TOKEN" == eyJ* ]] && [ "$TOKEN_TYPE" = "bearer" ]; then
            test_passed "Login endpoint returns valid JWT token"
            log "Token type: $TOKEN_TYPE, Token starts with: ${TOKEN:0:10}..."
        else
            test_failed "Login endpoint response invalid"
            log "Response: $LOGIN_RESPONSE"
            TOKEN=""
        fi
    else
        test_failed "Login endpoint response is not valid JSON"
        log "Response: $LOGIN_RESPONSE"
        TOKEN=""
    fi
fi

log ""

# Test 5: Authenticated endpoint (requires token from test 4)
log "Test 5: Testing authenticated endpoint..."
if [ -z "$TOKEN" ]; then
    test_failed "Cannot test authenticated endpoint - no valid token from login"
else
    ME_RESPONSE=$(curl -s http://localhost:8680/api/auth/me \
      -H "Authorization: Bearer $TOKEN" 2>/dev/null || echo "ERROR")
    
    if [ "$ME_RESPONSE" = "ERROR" ]; then
        test_failed "Authenticated endpoint not accessible"
    else
        if echo "$ME_RESPONSE" | python3 -m json.tool > /dev/null 2>&1; then
            EMAIL=$(echo "$ME_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('email', ''))" 2>/dev/null || echo "")
            ROLE=$(echo "$ME_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('role', ''))" 2>/dev/null || echo "")
            
            if [ "$EMAIL" = "admin@example.com" ]; then
                test_passed "Authenticated endpoint returns correct user data"
                log "Email: $EMAIL, Role: $ROLE"
            else
                test_failed "Authenticated endpoint returns incorrect user data"
                log "Response: $ME_RESPONSE"
            fi
        else
            test_failed "Authenticated endpoint response is not valid JSON"
            log "Response: $ME_RESPONSE"
        fi
    fi
fi

log ""

# Test 6: Assessments list (authenticated)
log "Test 6: Testing assessments list endpoint..."
if [ -z "$TOKEN" ]; then
    test_failed "Cannot test assessments endpoint - no valid token"
else
    ASSESSMENTS_RESPONSE=$(curl -s http://localhost:8680/api/assessments/ \
      -H "Authorization: Bearer $TOKEN" 2>/dev/null || echo "ERROR")
    
    if [ "$ASSESSMENTS_RESPONSE" = "ERROR" ]; then
        test_failed "Assessments endpoint not accessible"
    else
        if echo "$ASSESSMENTS_RESPONSE" | python3 -m json.tool > /dev/null 2>&1; then
            # Should be an array (empty or with assessments)
            if echo "$ASSESSMENTS_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); assert isinstance(data, list)" 2>/dev/null; then
                ASSESSMENT_COUNT=$(echo "$ASSESSMENTS_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data))" 2>/dev/null || echo "0")
                test_passed "Assessments endpoint returns valid array"
                log "Assessment count: $ASSESSMENT_COUNT"
            else
                test_failed "Assessments endpoint does not return array"
                log "Response: $ASSESSMENTS_RESPONSE"
            fi
        else
            test_failed "Assessments endpoint response is not valid JSON"
            log "Response: $ASSESSMENTS_RESPONSE"
        fi
    fi
fi

log ""
log "=== Backend API Tests Complete ==="
log "Completed: $(date)"

# Summary
PASS_COUNT=$(grep -c "✅ PASS" "$RESULT_FILE" || echo "0")
FAIL_COUNT=$(grep -c "❌ FAIL" "$RESULT_FILE" || echo "0")
WARN_COUNT=$(grep -c "⚠️  WARN" "$RESULT_FILE" || echo "0")

log ""
log "Summary: $PASS_COUNT passed, $FAIL_COUNT failed, $WARN_COUNT warnings"

if [ "$FAIL_COUNT" -gt 0 ]; then
    log "${RED}Backend API tests failed. Check the issues above.${NC}"
    exit 1
else
    log "${GREEN}All backend API tests passed!${NC}"
fi

# Save token for use by other test scripts
if [ -n "$TOKEN" ]; then
    echo "$TOKEN" > "$RESULTS_DIR/auth_token.txt"
    log "Auth token saved for integration tests"
fi