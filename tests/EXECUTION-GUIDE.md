# Test Execution Guide

This guide provides step-by-step instructions for executing the complete test suite for the DevOps Maturity Assessment application.

## Prerequisites

1. **Application Running:**
   ```bash
   docker-compose up -d
   ```

2. **Verify Services:**
   ```bash
   docker-compose ps
   # Should show backend, frontend, and postgres as "Up"
   ```

3. **Test User Created:**
   - Email: admin@example.com
   - Password: admin123

## Test Execution Order

### Option 1: Run All Automated Tests

```bash
# Execute complete automated test suite
./tests/run-all-tests.sh
```

This will run all automated tests in the correct order and provide a summary.

### Option 2: Run Tests Individually

#### Phase 1: Infrastructure Validation
```bash
./tests/scripts/infrastructure.sh
```
**Purpose:** Verify all containers are running and healthy
**Duration:** ~30 seconds
**Must Pass:** Yes - other tests depend on this

#### Phase 2: Backend API Testing
```bash
./tests/scripts/backend-api.sh
```
**Purpose:** Test all backend endpoints and authentication
**Duration:** ~1 minute
**Must Pass:** Yes - frontend depends on working backend

#### Phase 3: Frontend Build Testing
```bash
./tests/scripts/frontend-build.sh
```
**Purpose:** Verify frontend builds and serves correctly
**Duration:** ~1 minute
**Must Pass:** Yes - browser testing depends on this

#### Phase 4: Manual Browser Testing
**Purpose:** Test actual user interactions in browser
**Duration:** ~10-15 minutes
**Must Pass:** Yes - this is the real user experience

Follow the detailed guide: `tests/manual/browser-testing.md`

#### Phase 5: Integration Testing
```bash
./tests/scripts/integration.sh
```
**Purpose:** Test complete API workflows
**Duration:** ~2 minutes
**Must Pass:** Optional - but recommended

## Test Results

### Automated Test Results
- Results saved to: `tests/results/`
- Format: `[test_type]_[timestamp].log`
- Summary: `test_summary_[timestamp].log`

### Manual Test Results
Document results in the browser testing guide or create a separate results file.

## Interpreting Results

### Success Indicators
- ✅ All automated tests pass
- ✅ Browser testing shows functional login and dashboard
- ✅ No console errors in browser
- ✅ All network requests succeed

### Failure Indicators
- ❌ Any automated test fails
- ❌ Login button doesn't work in browser
- ❌ Console shows JavaScript errors
- ❌ Network requests fail or return errors

## Troubleshooting

### If Infrastructure Tests Fail
1. Check if all containers are running: `docker-compose ps`
2. Check container logs: `docker-compose logs [service]`
3. Restart services: `docker-compose restart`

### If Backend API Tests Fail
1. Check backend logs: `docker-compose logs backend`
2. Verify database connection
3. Check if test user exists
4. Test endpoints manually with curl

### If Frontend Build Tests Fail
1. Check frontend logs: `docker-compose logs frontend`
2. Check for TypeScript errors
3. Verify dependencies are installed
4. Try rebuilding: `docker-compose exec frontend npm run build`

### If Browser Tests Fail
1. Use the debugging guide: `tests/manual/debugging-guide.md`
2. Check browser console for errors
3. Check network tab for failed requests
4. Verify CORS configuration

### If Integration Tests Fail
1. Ensure backend API tests passed first
2. Check authentication token generation
3. Verify API endpoints accept the test data format

## Common Issues and Solutions

### Issue: "Cannot connect to Docker daemon"
**Solution:** Start Docker service or check Docker installation

### Issue: "Port already in use"
**Solution:** 
```bash
docker-compose down
# Wait a few seconds
docker-compose up -d
```

### Issue: "Test user not found"
**Solution:**
```bash
# Create test user
docker-compose exec backend python create_test_user.py
```

### Issue: "CORS errors in browser"
**Solution:** Check backend CORS configuration in `backend/app/config.py`

### Issue: "Frontend not accessible"
**Solution:**
```bash
# Check if frontend container is running
docker-compose ps frontend
# Check frontend logs
docker-compose logs frontend
```

## Test Coverage

### Automated Tests Cover:
- ✅ Container health and connectivity
- ✅ Backend API endpoints and responses
- ✅ Frontend build and configuration
- ✅ Authentication flow (API level)
- ✅ Assessment CRUD operations (API level)
- ✅ Data persistence and retrieval

### Manual Tests Cover:
- ✅ Actual browser user experience
- ✅ JavaScript execution and DOM manipulation
- ✅ Visual layout and styling
- ✅ Interactive elements and event handlers
- ✅ Error handling and user feedback
- ✅ Navigation and routing

## Continuous Testing

### During Development
1. Run infrastructure tests after any Docker changes
2. Run backend tests after API changes
3. Run frontend tests after build configuration changes
4. Run browser tests after UI changes

### Before Deployment
1. Run complete test suite: `./tests/run-all-tests.sh`
2. Perform full manual browser testing
3. Document any issues found
4. Ensure all tests pass before deploying

### After Deployment
1. Run smoke tests on deployed environment
2. Verify all URLs are accessible
3. Test login flow with real users
4. Monitor for any runtime errors

## Test Maintenance

### Adding New Tests
1. Add automated tests to appropriate script in `tests/scripts/`
2. Add manual test cases to `tests/manual/browser-testing.md`
3. Update this execution guide if new phases are added

### Updating Existing Tests
1. Modify test scripts as needed
2. Update expected results in test fixtures
3. Update documentation to reflect changes

### Test Data Management
- Test data stored in: `tests/fixtures/test-data.json`
- Update test data when API contracts change
- Ensure test data doesn't conflict with real data