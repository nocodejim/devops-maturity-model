# Debugging Guide - Phase 5

This guide provides systematic debugging procedures for common issues found during testing.

## General Debugging Approach

1. **Identify the symptom** - What exactly is not working?
2. **Check the console** - Look for JavaScript/TypeScript errors
3. **Check the network** - Verify API requests and responses
4. **Check the data flow** - Trace data from frontend to backend
5. **Isolate the issue** - Determine if it's frontend, backend, or integration

## Common Issues and Debugging Steps

### Issue 1: Login Button Does Nothing

**Symptoms:**
- Click "Sign In" button
- Nothing happens
- No network requests
- No console errors

**Debugging Steps:**

1. **Check Event Handler Binding:**
   ```javascript
   // In browser console, check if button has event listeners
   $0 // Select the button element in Elements tab first
   getEventListeners($0) // Should show click listeners
   ```

2. **Check Form Validation:**
   - Are email/password fields filled?
   - Is form validation preventing submission?
   - Check for HTML5 validation errors

3. **Check JavaScript Errors:**
   ```javascript
   // In console, manually trigger the login function
   // This helps identify if the function exists and works
   ```

4. **Check Component State:**
   - Is the component properly mounted?
   - Are there any React rendering errors?
   - Check React DevTools if available

**Files to Check:**
- `frontend/src/pages/LoginPage.tsx` - Login form handler
- `frontend/src/contexts/AuthContext.tsx` - Auth state management

---

### Issue 2: Network Request Fails

**Symptoms:**
- Login button triggers request
- Network tab shows failed request
- Status code 4XX, 5XX, or network error

**Debugging Steps:**

1. **Check Request Details:**
   - Method: Should be POST
   - URL: Should be `http://localhost:8000/api/auth/login`
   - Headers: Should include `Content-Type: application/x-www-form-urlencoded`
   - Payload: Should be `username=admin@example.com&password=admin123`

2. **Check Response Details:**
   - Status code and meaning
   - Response headers
   - Response body content
   - Error messages

3. **Common Status Codes:**
   - **404:** Endpoint not found - check URL and backend routing
   - **405:** Method not allowed - check if POST is supported
   - **422:** Validation error - check request payload format
   - **500:** Server error - check backend logs

4. **Check CORS Configuration:**
   ```bash
   # Check if CORS headers are present in response
   curl -H "Origin: http://localhost:5173" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS http://localhost:8000/api/auth/login
   ```

**Files to Check:**
- `backend/app/config.py` - CORS configuration
- `backend/app/api/auth.py` - Login endpoint implementation

---

### Issue 3: CORS Errors

**Symptoms:**
- Console error: "CORS policy: No 'Access-Control-Allow-Origin'"
- Network request blocked by browser
- Request doesn't reach backend

**Debugging Steps:**

1. **Verify CORS Configuration:**
   ```bash
   # Check backend CORS settings
   docker-compose exec backend grep -r "CORS\|cors" app/
   ```

2. **Check Request Origin:**
   - Frontend should be running on `http://localhost:5173`
   - Backend should allow this origin

3. **Check Response Headers:**
   ```bash
   # Manual CORS check
   curl -H "Origin: http://localhost:5173" \
        -v http://localhost:8000/api/auth/login
   ```
   
   Should include:
   - `Access-Control-Allow-Origin: http://localhost:5173`
   - `Access-Control-Allow-Credentials: true`

4. **Common CORS Fixes:**
   - Ensure backend allows frontend origin
   - Check if credentials are properly configured
   - Verify preflight requests are handled

**Files to Check:**
- `backend/app/config.py` - CORS settings
- `backend/app/main.py` - CORS middleware setup

---

### Issue 4: Token Not Stored

**Symptoms:**
- Login request succeeds (200 status)
- Response contains access_token
- Token not found in localStorage

**Debugging Steps:**

1. **Check Response Format:**
   ```javascript
   // In Network tab, check login response
   // Should be: {"access_token": "eyJ...", "token_type": "bearer"}
   ```

2. **Check Token Extraction:**
   ```javascript
   // In console, manually check response parsing
   fetch('/api/auth/login', {
     method: 'POST',
     headers: {'Content-Type': 'application/x-www-form-urlencoded'},
     body: 'username=admin@example.com&password=admin123'
   })
   .then(r => r.json())
   .then(data => console.log(data.access_token))
   ```

3. **Check localStorage Operations:**
   ```javascript
   // Test localStorage manually
   localStorage.setItem('test', 'value')
   localStorage.getItem('test') // Should return 'value'
   localStorage.removeItem('test')
   ```

4. **Check for JavaScript Errors:**
   - Look for errors during token storage
   - Check if localStorage is available
   - Verify no exceptions during JSON parsing

**Files to Check:**
- `frontend/src/services/api.ts` - API client and token handling
- `frontend/src/contexts/AuthContext.tsx` - Auth state management

---

### Issue 5: Redirect Not Working

**Symptoms:**
- Login succeeds
- Token stored correctly
- User not redirected to dashboard

**Debugging Steps:**

1. **Check Navigation Logic:**
   ```javascript
   // In console, check current route
   window.location.pathname
   window.location.href
   ```

2. **Check React Router:**
   - Verify routing configuration
   - Check for navigation guards
   - Look for redirect logic in auth context

3. **Check Authentication State:**
   ```javascript
   // Check if user is considered authenticated
   localStorage.getItem('access_token')
   // Should trigger auth state update
   ```

4. **Manual Navigation Test:**
   ```javascript
   // Try manual navigation
   window.location.href = '/dashboard'
   ```

**Files to Check:**
- `frontend/src/App.tsx` - Routing configuration
- `frontend/src/contexts/AuthContext.tsx` - Auth state and navigation

---

### Issue 6: Dashboard Not Loading

**Symptoms:**
- Successfully redirected to /dashboard
- Page appears blank or broken
- Console shows errors

**Debugging Steps:**

1. **Check Authentication:**
   - Verify token is present
   - Check `/api/auth/me` request
   - Ensure user data loads correctly

2. **Check Component Rendering:**
   - Look for React component errors
   - Check for missing props or data
   - Verify API data structure

3. **Check API Requests:**
   - Dashboard should load user data
   - May load assessments list
   - Check all API responses

4. **Check Route Protection:**
   - Verify dashboard route is protected
   - Check authentication guards
   - Ensure proper redirect logic

**Files to Check:**
- `frontend/src/pages/Dashboard.tsx` - Dashboard component
- `frontend/src/components/` - Dashboard sub-components

---

## Systematic Debugging Workflow

### Step 1: Reproduce the Issue
1. Clear browser cache and localStorage
2. Restart containers if needed
3. Follow exact steps to reproduce
4. Document exact symptoms

### Step 2: Check Infrastructure
1. Run infrastructure tests: `./tests/scripts/infrastructure.sh`
2. Verify all containers are running
3. Check for any service errors

### Step 3: Check Backend API
1. Run backend tests: `./tests/scripts/backend-api.sh`
2. Test specific endpoints with curl
3. Check backend logs for errors

### Step 4: Check Frontend Build
1. Run frontend tests: `./tests/scripts/frontend-build.sh`
2. Verify TypeScript compilation
3. Check for build errors

### Step 5: Isolate Frontend vs Backend
1. Test backend endpoints directly with curl
2. If backend works, issue is in frontend
3. If backend fails, fix backend first

### Step 6: Debug Frontend
1. Check browser console for errors
2. Check network requests and responses
3. Verify data flow and state management
4. Test individual components if possible

## Debugging Tools

### Browser DevTools
- **Console:** JavaScript errors and logs
- **Network:** HTTP requests and responses
- **Application:** localStorage, sessionStorage, cookies
- **Elements:** DOM inspection and CSS debugging
- **Sources:** JavaScript debugging and breakpoints

### Backend Debugging
```bash
# Check backend logs
docker-compose logs backend --tail 100 -f

# Check database connection
docker-compose exec backend python -c "
from app.database import engine
from sqlalchemy import text
with engine.connect() as conn:
    result = conn.execute(text('SELECT 1'))
    print('Database connected:', result.fetchone())
"

# Test specific endpoint
curl -v http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@example.com&password=admin123"
```

### Frontend Debugging
```bash
# Check frontend logs
docker-compose logs frontend --tail 100 -f

# Check TypeScript compilation
docker-compose exec frontend npm run build

# Check dependencies
docker-compose exec frontend npm list
```

## Documentation Template

When debugging, document findings:

```markdown
## Issue: [Brief Description]

**Date:** [Date]
**Tester:** [Name]
**Environment:** [Browser, OS, etc.]

### Symptoms
- [Exact behavior observed]
- [Error messages]
- [Steps to reproduce]

### Investigation
- [What was checked]
- [Tools used]
- [Findings]

### Root Cause
- [Identified cause]
- [Why it happened]

### Solution
- [What was changed]
- [Files modified]
- [Configuration updates]

### Verification
- [How fix was tested]
- [Confirmation steps]

### Prevention
- [How to avoid in future]
- [Additional tests needed]
```