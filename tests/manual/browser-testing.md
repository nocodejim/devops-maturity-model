# Browser Testing Guide - Phase 4

This guide covers manual browser testing that cannot be automated with curl or scripts.

## Prerequisites

- All containers running: `docker-compose ps`
- Backend API tests passed: `./tests/scripts/backend-api.sh`
- Frontend build tests passed: `./tests/scripts/frontend-build.sh`

## Test Environment

- **Frontend URL:** http://localhost:5173
- **Backend URL:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Test User:** admin@example.com / admin123

## Browser Setup

1. **Open Browser** (Chrome, Firefox, or Safari)
2. **Open Developer Tools** (F12 or Cmd+Option+I)
3. **Position DevTools:**
   - Console tab visible
   - Network tab accessible
   - Application tab accessible

## Test Procedures

### Test 1: Initial Page Load

1. **Navigate to:** http://localhost:5173
2. **Check Console Tab:**
   - [ ] No red errors
   - [ ] No TypeScript compilation errors
   - [ ] No missing asset (404) errors
3. **Check Network Tab:**
   - [ ] All requests return 200 status
   - [ ] No failed requests (red entries)
   - [ ] Main HTML document loads
4. **Visual Check:**
   - [ ] Page displays correctly
   - [ ] No broken layout
   - [ ] Loading states work properly

**Expected Result:** Clean page load with no console errors

---

### Test 2: Login Page Access

1. **Navigate to:** http://localhost:5173/login
2. **Visual Verification:**
   - [ ] Login form displays
   - [ ] Email input field present
   - [ ] Password input field present
   - [ ] "Sign In" button present
   - [ ] Form styling looks correct
3. **Console Check:**
   - [ ] No routing errors
   - [ ] No component rendering errors

**Expected Result:** Login page displays with functional form

---

### Test 3: Login Form Submission

1. **Clear Network Tab** (click clear button)
2. **Enter Credentials:**
   - Email: `admin@example.com`
   - Password: `admin123`
3. **Click "Sign In" Button**
4. **Immediately Check Network Tab:**
   - [ ] POST request to `http://localhost:8000/api/auth/login`
   - [ ] Request method: POST
   - [ ] Status code: 200 (success)
   - [ ] Response contains `access_token` field
5. **Check Console Tab:**
   - [ ] No JavaScript errors
   - [ ] No network errors
   - [ ] No CORS errors

**Expected Result:** Successful login request with 200 status

---

### Test 4: Token Storage Verification

1. **After login attempt, open Application Tab**
2. **Navigate to:** Storage → Local Storage → http://localhost:5173
3. **Verify:**
   - [ ] `access_token` key exists
   - [ ] Token value starts with "eyJ" (JWT format)
   - [ ] Token is not empty or null

**Expected Result:** JWT token stored in localStorage

---

### Test 5: Post-Login Redirect

1. **After successful login, check:**
   - [ ] URL changes to `/dashboard`
   - [ ] Dashboard page loads
   - [ ] No redirect loops
2. **Check Network Tab:**
   - [ ] Request to `/api/auth/me` (fetches current user)
   - [ ] Status code: 200
   - [ ] Response contains user data
3. **Console Check:**
   - [ ] No navigation errors
   - [ ] No authentication errors

**Expected Result:** Redirect to dashboard with user data loaded

---

### Test 6: Dashboard Functionality

1. **Visual Verification:**
   - [ ] Header displays user name
   - [ ] Logout button present
   - [ ] Analytics cards display
   - [ ] "New Assessment" button present
   - [ ] Assessments list section visible
2. **Interactive Elements:**
   - [ ] Logout button clickable
   - [ ] "New Assessment" button clickable
   - [ ] Navigation elements work

**Expected Result:** Fully functional dashboard interface

---

### Test 7: Error Scenarios

#### Invalid Login Credentials
1. **Enter invalid credentials:**
   - Email: `wrong@example.com`
   - Password: `wrongpassword`
2. **Click "Sign In"**
3. **Verify:**
   - [ ] Error message displays
   - [ ] No redirect occurs
   - [ ] Form remains accessible

#### Network Error Simulation
1. **Stop backend container:** `docker-compose stop backend`
2. **Try to login with valid credentials**
3. **Verify:**
   - [ ] Network error handled gracefully
   - [ ] User-friendly error message
   - [ ] No application crash
4. **Restart backend:** `docker-compose start backend`

**Expected Result:** Graceful error handling with user feedback

---

## Common Issues and Solutions

### Issue: Login Button Does Nothing

**Debugging Steps:**
1. **Check Console for errors:**
   - TypeScript compilation errors
   - React component errors
   - Event handler errors
2. **Check Network Tab:**
   - Is POST request being sent?
   - If NO: Frontend JavaScript issue
   - If YES: Check response status and body

### Issue: CORS Errors

**Symptoms:**
- Console error: "CORS policy: No 'Access-Control-Allow-Origin'"
- Network request fails with CORS error

**Check:**
- Backend CORS configuration
- Request headers include correct Origin
- Response headers include Access-Control-Allow-Origin

### Issue: Token Not Stored

**Debugging Steps:**
1. Check if login request succeeds
2. Verify response contains `access_token`
3. Check localStorage write operation in Console
4. Verify no JavaScript errors during token storage

### Issue: Redirect Not Working

**Debugging Steps:**
1. Check if token is stored correctly
2. Verify `/api/auth/me` request succeeds
3. Check React Router configuration
4. Look for navigation errors in Console

---

## Test Results Template

Copy and fill out during testing:

```
### Browser Testing Results - [Date]

**Browser:** [Chrome/Firefox/Safari] [Version]
**Tester:** [Name]

#### Test 1: Initial Page Load
- Console errors: [ ] None / [ ] Found: ___________
- Network errors: [ ] None / [ ] Found: ___________
- Visual issues: [ ] None / [ ] Found: ___________

#### Test 2: Login Page Access
- Form displays: [ ] Yes / [ ] No
- Console errors: [ ] None / [ ] Found: ___________

#### Test 3: Login Form Submission
- Network request sent: [ ] Yes / [ ] No
- Status code: [ ] 200 / [ ] Other: ___________
- Response valid: [ ] Yes / [ ] No

#### Test 4: Token Storage
- Token stored: [ ] Yes / [ ] No
- Token format valid: [ ] Yes / [ ] No

#### Test 5: Post-Login Redirect
- Redirects to dashboard: [ ] Yes / [ ] No
- User data loads: [ ] Yes / [ ] No

#### Test 6: Dashboard Functionality
- All elements display: [ ] Yes / [ ] No
- Interactive elements work: [ ] Yes / [ ] No

#### Test 7: Error Scenarios
- Invalid credentials handled: [ ] Yes / [ ] No
- Network errors handled: [ ] Yes / [ ] No

**Overall Status:** [ ] PASS / [ ] FAIL
**Issues Found:** ___________
**Notes:** ___________
```

---

## Next Steps

After completing browser testing:

1. **If all tests pass:** Proceed to integration testing
2. **If tests fail:** Document issues in `docs/lessons-learned.md`
3. **For debugging:** Use the debugging guide in `tests/manual/debugging-guide.md`