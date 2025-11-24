#!/bin/bash

# Master Test Runner for DevOps Maturity Assessment
# Executes all automated tests in the correct order

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_DIR="$SCRIPT_DIR/results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
SUMMARY_FILE="$RESULTS_DIR/test_summary_${TIMESTAMP}.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create results directory if it doesn't exist
mkdir -p "$RESULTS_DIR"

log() {
    echo -e "$1" | tee -a "$SUMMARY_FILE"
}

log "${BLUE}=== DevOps Maturity Assessment - Complete Test Suite ===${NC}"
log "Started: $(date)"
log "Summary: $SUMMARY_FILE"
log ""

# Test execution tracking
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

run_test() {
    local test_name="$1"
    local test_script="$2"
    local required="$3"  # "required" or "optional"
    
    log "${BLUE}Running $test_name...${NC}"
    TESTS_RUN=$((TESTS_RUN + 1))
    
    if [ -f "$test_script" ] && [ -x "$test_script" ]; then
        if "$test_script"; then
            log "${GREEN}✅ $test_name PASSED${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
            return 0
        else
            log "${RED}❌ $test_name FAILED${NC}"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            
            if [ "$required" = "required" ]; then
                log "${RED}Required test failed. Stopping execution.${NC}"
                return 1
            else
                log "${YELLOW}Optional test failed. Continuing...${NC}"
                return 0
            fi
        fi
    else
        log "${RED}❌ Test script not found or not executable: $test_script${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

log "Phase 1: Infrastructure Validation"
log "=================================="
if ! run_test "Infrastructure Tests" "$SCRIPT_DIR/scripts/infrastructure.sh" "required"; then
    log "${RED}Infrastructure tests failed. Cannot proceed with other tests.${NC}"
    exit 1
fi
log ""

log "Phase 2: Backend API Testing"
log "============================="
if ! run_test "Backend API Tests" "$SCRIPT_DIR/scripts/backend-api.sh" "required"; then
    log "${RED}Backend API tests failed. Cannot proceed with integration tests.${NC}"
    exit 1
fi
log ""

log "Phase 3: Frontend Build Testing"
log "==============================="
if ! run_test "Frontend Build Tests" "$SCRIPT_DIR/scripts/frontend-build.sh" "required"; then
    log "${RED}Frontend build tests failed. Manual browser testing may not work.${NC}"
    # Don't exit here - frontend issues might be fixable
fi
log ""

log "Phase 4: Manual Browser Testing"
log "==============================="
log "${YELLOW}⚠️  Manual browser testing required${NC}"
log "Please follow the guide: $SCRIPT_DIR/manual/browser-testing.md"
log "Browser testing cannot be automated and must be performed manually."
log ""

log "Phase 5: Integration Testing"
log "============================"
run_test "Integration Tests" "$SCRIPT_DIR/scripts/integration.sh" "optional"
log ""

# Final summary
log "${BLUE}=== Test Execution Summary ===${NC}"
log "Total tests run: $TESTS_RUN"
log "Tests passed: $TESTS_PASSED"
log "Tests failed: $TESTS_FAILED"
log "Completed: $(date)"
log ""

if [ $TESTS_FAILED -eq 0 ]; then
    log "${GREEN}🎉 All automated tests passed!${NC}"
    log ""
    log "Next steps:"
    log "1. Perform manual browser testing using: tests/manual/browser-testing.md"
    log "2. If browser tests pass, the application is ready for use"
    log "3. If issues found, use debugging guide: tests/manual/debugging-guide.md"
else
    log "${RED}❌ Some tests failed. Review the results above.${NC}"
    log ""
    log "Troubleshooting:"
    log "1. Check individual test logs in: $RESULTS_DIR/"
    log "2. Use debugging guide: tests/manual/debugging-guide.md"
    log "3. Fix issues and re-run tests"
fi

log ""
log "Test results saved to: $RESULTS_DIR/"
log "Individual test logs available with timestamps"

exit $TESTS_FAILED