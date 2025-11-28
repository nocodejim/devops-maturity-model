#!/bin/bash

# Phase 3: Frontend Build and Serving Tests
# Based on docs/TESTING-SESSION-PROMPT.md

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_DIR="$SCRIPT_DIR/../results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RESULT_FILE="$RESULTS_DIR/frontend_build_${TIMESTAMP}.log"

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

log "=== DevOps Maturity Assessment - Frontend Build Tests ==="
log "Started: $(date)"
log "Results: $RESULT_FILE"
log ""

# Test 1: Verify frontend is serving
log "Test 1: Testing frontend serving..."
RESPONSE=$(curl -s http://localhost:8673 2>/dev/null || echo "ERROR")
if [ "$RESPONSE" = "ERROR" ]; then
    test_failed "Frontend not accessible at http://localhost:8673"
else
    if echo "$RESPONSE" | grep -q "DevOps Maturity Assessment"; then
        test_passed "Frontend serves HTML with correct title"
    else
        test_warning "Frontend serves HTML but title may be incorrect"
        log "HTML preview: $(echo "$RESPONSE" | head -5)"
    fi
fi

log ""

# Test 2: Check frontend environment configuration
log "Test 2: Checking frontend API configuration..."
API_CONFIG=$(docker compose exec -T frontend cat src/services/api.ts 2>/dev/null | grep -A 2 "API_URL" || echo "ERROR")
if [ "$API_CONFIG" = "ERROR" ]; then
    test_failed "Cannot read frontend API configuration"
else
    if echo "$API_CONFIG" | grep -q "8000" || echo "$API_CONFIG" | grep -q "getApiUrl"; then
        test_passed "Frontend API URL correctly configured"
        log "API Config: Dynamic URL detection implemented"
    else
        test_failed "Frontend API URL not configured correctly"
        log "API Config: $API_CONFIG"
    fi
fi

log ""

# Test 3: Check TypeScript compilation (detailed)
log "Test 3: Testing TypeScript compilation (detailed)..."
BUILD_OUTPUT=$(docker compose exec -T frontend npm run build 2>&1 || echo "BUILD_FAILED")
if [ "$BUILD_OUTPUT" = "BUILD_FAILED" ]; then
    test_failed "TypeScript build command failed to execute"
else
    if echo "$BUILD_OUTPUT" | grep -q "built in"; then
        BUILD_TIME=$(echo "$BUILD_OUTPUT" | grep "built in" | head -1)
        test_passed "TypeScript compilation successful"
        log "$BUILD_TIME"
        
        # Check for warnings
        if echo "$BUILD_OUTPUT" | grep -q "warning"; then
            WARNINGS=$(echo "$BUILD_OUTPUT" | grep -c "warning" || echo "0")
            test_warning "$WARNINGS TypeScript warnings found"
        fi
    else
        test_failed "TypeScript compilation failed"
        log "Build output:"
        echo "$BUILD_OUTPUT" | tee -a "$RESULT_FILE"
    fi
fi

log ""

# Test 4: Check for common frontend assets
log "Test 4: Testing frontend asset availability..."

# Check if main JS bundle is accessible
JS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8673/src/main.tsx 2>/dev/null || echo "000")
if [ "$JS_RESPONSE" = "200" ]; then
    test_passed "Main TypeScript file is accessible"
else
    test_warning "Main TypeScript file not directly accessible (expected in dev mode)"
fi

# Check if CSS/styling is working
CSS_CHECK=$(curl -s http://localhost:8673 | grep -o "tailwind\|css" | head -1 || echo "")
if [ -n "$CSS_CHECK" ]; then
    test_passed "CSS/styling configuration detected"
else
    test_warning "No CSS/styling references found in HTML"
fi

log ""

# Test 5: Check Vite dev server configuration
log "Test 5: Testing Vite dev server configuration..."
VITE_CONFIG=$(docker compose exec -T frontend cat vite.config.ts 2>/dev/null || echo "ERROR")
if [ "$VITE_CONFIG" = "ERROR" ]; then
    test_failed "Cannot read Vite configuration"
else
    if echo "$VITE_CONFIG" | grep -q "5173"; then
        test_passed "Vite configured for correct port"
    else
        test_warning "Vite port configuration not found (may use default)"
    fi
    
    if echo "$VITE_CONFIG" | grep -q "host.*true\|host.*0.0.0.0"; then
        test_passed "Vite configured for external access"
    else
        test_warning "Vite may not be configured for external access"
    fi
fi

log ""

# Test 6: Check package.json dependencies
log "Test 6: Checking critical dependencies..."
PACKAGE_JSON=$(docker compose exec -T frontend cat package.json 2>/dev/null || echo "ERROR")
if [ "$PACKAGE_JSON" = "ERROR" ]; then
    test_failed "Cannot read package.json"
else
    # Check for React
    if echo "$PACKAGE_JSON" | grep -q '"react"'; then
        test_passed "React dependency found"
    else
        test_failed "React dependency missing"
    fi
    
    # Check for TypeScript
    if echo "$PACKAGE_JSON" | grep -q '"typescript"'; then
        test_passed "TypeScript dependency found"
    else
        test_warning "TypeScript dependency not found in dependencies"
    fi
    
    # Check for Vite
    if echo "$PACKAGE_JSON" | grep -q '"vite"'; then
        test_passed "Vite dependency found"
    else
        test_failed "Vite dependency missing"
    fi
fi

log ""

# Test 7: Test frontend routing (if accessible)
log "Test 7: Testing frontend routing..."
LOGIN_PAGE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8673/login 2>/dev/null || echo "000")
if [ "$LOGIN_PAGE" = "200" ]; then
    test_passed "Login route is accessible"
else
    test_warning "Login route returned status: $LOGIN_PAGE (may be SPA routing)"
fi

DASHBOARD_PAGE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8673/dashboard 2>/dev/null || echo "000")
if [ "$DASHBOARD_PAGE" = "200" ]; then
    test_passed "Dashboard route is accessible"
else
    test_warning "Dashboard route returned status: $DASHBOARD_PAGE (may be SPA routing)"
fi

log ""
log "=== Frontend Build Tests Complete ==="
log "Completed: $(date)"

# Summary
PASS_COUNT=$(grep -c "✅ PASS" "$RESULT_FILE" || echo "0")
FAIL_COUNT=$(grep -c "❌ FAIL" "$RESULT_FILE" || echo "0")
WARN_COUNT=$(grep -c "⚠️  WARN" "$RESULT_FILE" || echo "0")

log ""
log "Summary: $PASS_COUNT passed, $FAIL_COUNT failed, $WARN_COUNT warnings"

if [ "$FAIL_COUNT" -gt 0 ]; then
    log "${RED}Frontend build tests failed. Check the issues above.${NC}"
    exit 1
else
    log "${GREEN}All frontend build tests passed!${NC}"
    if [ "$WARN_COUNT" -gt 0 ]; then
        log "${YELLOW}Note: $WARN_COUNT warnings found - review for potential issues${NC}"
    fi
fi