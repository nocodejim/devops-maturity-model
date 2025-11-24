#!/bin/bash

# Phase 1: Infrastructure Validation Tests
# Based on docs/TESTING-SESSION-PROMPT.md

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_DIR="$SCRIPT_DIR/../results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RESULT_FILE="$RESULTS_DIR/infrastructure_${TIMESTAMP}.log"

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

log "=== DevOps Maturity Assessment - Infrastructure Tests ==="
log "Started: $(date)"
log "Results: $RESULT_FILE"
log ""

# Test 1: Verify all containers running
log "Test 1: Checking container status..."
if docker compose ps | grep -q "Up"; then
    CONTAINERS=$(docker compose ps --format "table {{.Name}}\t{{.State}}\t{{.Ports}}")
    log "$CONTAINERS"
    
    # Check specific containers
    if docker compose ps | grep -q "backend.*Up"; then
        test_passed "Backend container is running"
    else
        test_failed "Backend container is not running"
    fi
    
    if docker compose ps | grep -q "frontend.*Up"; then
        test_passed "Frontend container is running"
    else
        test_failed "Frontend container is not running"
    fi
    
    if docker compose ps | grep -q "postgres.*Up"; then
        test_passed "PostgreSQL container is running"
    else
        test_failed "PostgreSQL container is not running"
    fi
else
    test_failed "No containers are running. Run 'docker compose up' first."
    exit 1
fi

log ""

# Test 2: Check logs for errors
log "Test 2: Checking container logs for errors..."

log "Backend errors:"
BACKEND_ERRORS=$(docker compose logs backend --tail 50 2>/dev/null | grep -i error || true)
if [ -z "$BACKEND_ERRORS" ]; then
    test_passed "No errors found in backend logs"
else
    test_warning "Errors found in backend logs:"
    log "$BACKEND_ERRORS"
fi

log "Frontend errors:"
FRONTEND_ERRORS=$(docker compose logs frontend --tail 50 2>/dev/null | grep -i error || true)
if [ -z "$FRONTEND_ERRORS" ]; then
    test_passed "No errors found in frontend logs"
else
    test_warning "Errors found in frontend logs:"
    log "$FRONTEND_ERRORS"
fi

log "PostgreSQL errors:"
POSTGRES_ERRORS=$(docker compose logs postgres --tail 50 2>/dev/null | grep -i error || true)
if [ -z "$POSTGRES_ERRORS" ]; then
    test_passed "No errors found in PostgreSQL logs"
else
    test_warning "Errors found in PostgreSQL logs:"
    log "$POSTGRES_ERRORS"
fi

log ""

# Test 3: Verify TypeScript compilation
log "Test 3: Testing TypeScript compilation..."
if docker compose exec -T frontend npm run build > /tmp/build_output.log 2>&1; then
    BUILD_OUTPUT=$(cat /tmp/build_output.log)
    if echo "$BUILD_OUTPUT" | grep -q "built in"; then
        test_passed "TypeScript compilation successful"
        log "Build output: $(echo "$BUILD_OUTPUT" | grep "built in")"
    else
        test_warning "Build completed but no timing info found"
        log "$BUILD_OUTPUT"
    fi
else
    test_failed "TypeScript compilation failed"
    log "Build errors:"
    cat /tmp/build_output.log | tee -a "$RESULT_FILE"
fi

log ""

# Test 4: Check port accessibility
log "Test 4: Checking port accessibility..."

# Check backend port
if curl -s --connect-timeout 5 http://localhost:8000/ > /dev/null; then
    test_passed "Backend port 8000 is accessible"
else
    test_failed "Backend port 8000 is not accessible"
fi

# Check frontend port
if curl -s --connect-timeout 5 http://localhost:5173/ > /dev/null; then
    test_passed "Frontend port 5173 is accessible"
else
    test_failed "Frontend port 5173 is not accessible"
fi

log ""
log "=== Infrastructure Tests Complete ==="
log "Completed: $(date)"

# Summary
PASS_COUNT=$(grep -c "✅ PASS" "$RESULT_FILE" || echo "0")
FAIL_COUNT=$(grep -c "❌ FAIL" "$RESULT_FILE" || echo "0")
WARN_COUNT=$(grep -c "⚠️  WARN" "$RESULT_FILE" || echo "0")

log ""
log "Summary: $PASS_COUNT passed, $FAIL_COUNT failed, $WARN_COUNT warnings"

if [ "$FAIL_COUNT" -gt 0 ]; then
    log "${RED}Infrastructure tests failed. Fix issues before proceeding.${NC}"
    exit 1
else
    log "${GREEN}All infrastructure tests passed!${NC}"
fi