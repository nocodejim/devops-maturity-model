#!/bin/bash
#
# Deploy Safety Check Script
#
# This script checks the current database state before deployment to ensure
# we don't accidentally destroy user data on upgrades.
#
# Usage: ./scripts/check_deploy_safety.sh
#
# Exit codes:
#   0 = Safe to deploy (fresh install or safe upgrade)
#   1 = Error occurred
#   2 = Has completed assessments (upgrade mode - seeding will be skipped)
#

set -e

echo "=============================================="
echo "Deploy Safety Check - Database State Analysis"
echo "=============================================="
echo ""

# Check if containers are running
if ! docker-compose ps | grep -q "devops-maturity-db.*Up"; then
    echo "[CHECK] PostgreSQL container is not running."
    echo "[CHECK] This appears to be a fresh deployment."
    echo ""
    echo "STATUS: FRESH_INSTALL"
    echo "ACTION: Safe to proceed - will create admin user and seed all frameworks."
    exit 0
fi

echo "[CHECK] PostgreSQL container is running. Checking database state..."
echo ""

# Function to run psql queries (returns 0 if empty/error)
run_query() {
    result=$(docker-compose exec -T postgres psql -U devops -d devops_maturity -t -c "$1" 2>/dev/null | tr -d ' \n\r')
    if [ -z "$result" ]; then
        echo "0"
    else
        echo "$result"
    fi
}

# Check if tables exist
TABLES_EXIST=$(docker-compose exec -T postgres psql -U devops -d devops_maturity -c "\dt" 2>/dev/null | grep -c "users" || echo "0")

if [ "$TABLES_EXIST" = "0" ]; then
    echo "[CHECK] Database tables do not exist yet."
    echo ""
    echo "STATUS: TABLES_NOT_CREATED"
    echo "ACTION: Safe to proceed - migrations will create tables, then seed."
    exit 0
fi

echo "[CHECK] Tables exist. Checking data..."
echo ""

# Get counts
USER_COUNT=$(run_query "SELECT COUNT(*) FROM users;")
FRAMEWORK_COUNT=$(run_query "SELECT COUNT(*) FROM frameworks;")
ASSESSMENT_COUNT=$(run_query "SELECT COUNT(*) FROM assessments;")
COMPLETED_COUNT=$(run_query "SELECT COUNT(*) FROM assessments WHERE status = 'COMPLETED';")

echo "Database State:"
echo "  - Users: $USER_COUNT"
echo "  - Frameworks: $FRAMEWORK_COUNT"
echo "  - Assessments: $ASSESSMENT_COUNT"
echo "  - Completed Assessments: $COMPLETED_COUNT"
echo ""

# Check for admin user
ADMIN_EXISTS=$(run_query "SELECT COUNT(*) FROM users WHERE email = 'admin@example.com';")
echo "Admin User (admin@example.com): $([ "$ADMIN_EXISTS" = "1" ] && echo "EXISTS" || echo "NOT FOUND")"
echo ""

# List frameworks if any
if [ "$FRAMEWORK_COUNT" != "0" ]; then
    echo "Existing Frameworks:"
    docker-compose exec -T postgres psql -U devops -d devops_maturity -c "SELECT name, version FROM frameworks;" 2>/dev/null
    echo ""
fi

# Determine status and action
echo "=============================================="

if [ "$COMPLETED_COUNT" != "0" ]; then
    echo "STATUS: UPGRADE_MODE (has completed assessments)"
    echo ""
    echo "WARNING: This system has $COMPLETED_COUNT completed assessment(s)!"
    echo ""
    echo "ACTION: The init script will:"
    echo "  - Run migrations (safe)"
    echo "  - Skip admin user creation (user exists)"
    echo "  - Skip framework seeding (to protect assessment data)"
    echo ""
    echo "To manually seed frameworks on an existing system, you must:"
    echo "  1. Backup the database first"
    echo "  2. Run: docker-compose exec backend python -m app.scripts.init_database --force"
    echo ""
    exit 2
elif [ "$ASSESSMENT_COUNT" != "0" ]; then
    echo "STATUS: HAS_ASSESSMENTS (but none completed)"
    echo ""
    echo "Note: This system has $ASSESSMENT_COUNT in-progress assessment(s)."
    echo ""
    echo "ACTION: The init script will:"
    echo "  - Run migrations"
    echo "  - Create admin user if needed"
    echo "  - Seed frameworks if none exist"
    exit 0
else
    echo "STATUS: SAFE_TO_SEED"
    echo ""
    if [ "$FRAMEWORK_COUNT" = "0" ]; then
        echo "ACTION: Will seed all 3 frameworks (DevOps MVP, DORA, CALMS)"
    else
        echo "ACTION: Frameworks exist, seeding will be skipped"
    fi

    if [ "$ADMIN_EXISTS" = "0" ]; then
        echo "ACTION: Will create admin user (admin@example.com / admin123)"
    else
        echo "ACTION: Admin user exists, creation will be skipped"
    fi
    exit 0
fi
