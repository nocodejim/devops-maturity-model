# DevOps Maturity Assessment - Testing Suite

This directory contains comprehensive testing scripts and documentation for the DevOps Maturity Assessment application.

## Testing Structure

```
tests/
├── README.md                    # This file
├── scripts/                     # Automated test scripts
│   ├── infrastructure.sh        # Phase 1: Infrastructure validation
│   ├── backend-api.sh          # Phase 2: Backend API testing
│   ├── frontend-build.sh       # Phase 3: Frontend build testing
│   └── integration.sh          # Phase 6: Integration testing
├── manual/                     # Manual testing guides
│   ├── browser-testing.md      # Phase 4: Browser testing guide
│   └── debugging-guide.md      # Phase 5: Debugging procedures
├── results/                    # Test execution results
│   └── .gitkeep
└── fixtures/                   # Test data and fixtures
    └── test-data.json
```

## Quick Start

1. **Run Infrastructure Tests:**
   ```bash
   ./tests/scripts/infrastructure.sh
   ```

2. **Run Backend API Tests:**
   ```bash
   ./tests/scripts/backend-api.sh
   ```

3. **Run Frontend Build Tests:**
   ```bash
   ./tests/scripts/frontend-build.sh
   ```

4. **Manual Browser Testing:**
   Follow guide in `tests/manual/browser-testing.md`

5. **Run Full Integration Tests:**
   ```bash
   ./tests/scripts/integration.sh
   ```

## Test Execution Order

Tests should be executed in the following order:
1. Infrastructure validation
2. Backend API testing
3. Frontend build testing
4. Manual browser testing
5. Integration testing

## Prerequisites

- Docker and docker-compose installed
- Application running via `docker-compose up`
- Test user created: admin@example.com / admin123

## Test Results

Results are automatically saved to `tests/results/` with timestamps.
Manual test results should be documented in the respective checklist files.