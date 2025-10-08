# Mobile Network Login Troubleshooting

**Status:** UNRESOLVED - Needs fresh perspective
**Date:** 2025-10-07
**Last Updated:** 22:45

## Problem Summary

Login works perfectly from dev PC at `http://localhost:5173` but fails from mobile phone at `http://192.168.44.93:5173` with error message: "invalid email or password"

**Critical Detail:** Backend logs show `200 OK` responses for login attempts from phone, but frontend still displays error message.

---

## Environment Details

### Network Configuration
- **Dev PC Network IP:** 192.168.44.93
- **WSL2 Internal IP:** 172.31.194.250
- **Platform:** WSL2 on Windows host
- **Phone:** Pixel 8 Pro running Chrome on Android

### Service URLs
- **Frontend (local):** http://localhost:5173
- **Frontend (network):** http://192.168.44.93:5173
- **Backend (local):** http://localhost:8000
- **Backend (network):** http://192.168.44.93:8000
- **Backend API:** http://192.168.44.93:8000/api

### Test Credentials
- Email: admin@example.com
- Password: admin123

---

## What Works ✅

1. **Local Login (Dev PC)**
   - URL: http://localhost:5173
   - Status: **WORKS PERFECTLY**
   - Console logs show complete flow:
     ```
     [Login] Starting login with email: admin@example.com
     [Login] Login response received: {access_token: '...', token_type: 'bearer'}
     [Login] Token stored in localStorage
     [Login] Fetching current user...
     [Login] User verified successfully: {email: 'admin@example.com', ...}
     [Login] Updating AuthContext with user...
     [Login] Navigating to dashboard...
     [Login] Navigate called
     ```
   - Result: Successfully navigates to dashboard

2. **Network Connectivity**
   - Phone can load login page at http://192.168.44.93:5173
   - Phone can access backend docs at http://192.168.44.93:8000/docs
   - Phone can see JSON response from http://192.168.44.93:8000
   - No firewall blocking (another Docker site on same network works fine on port 8250)

3. **Backend Processing**
   - Backend receives POST requests from phone
   - Backend returns `200 OK` status
   - Backend logs show:
     ```
     INFO: 172.31.0.1:38352 - "POST /api/auth/login HTTP/1.1" 200 OK
     INFO: 172.31.0.1:38368 - "POST /api/auth/login HTTP/1.1" 200 OK
     INFO: 172.31.0.1:47992 - "POST /api/auth/login HTTP/1.1" 200 OK
     ```
   - Note: IP 172.31.0.1 is Docker internal network (expected for WSL2)

---

## What Doesn't Work ❌

1. **Mobile Network Login**
   - URL: http://192.168.44.93:5173
   - Frontend shows: "invalid email or password"
   - Backend logs: `200 OK` (contradicts frontend error)
   - No console access on Chrome Android to see debug logs

---

## Changes Made (In Chronological Order)

### 1. CORS Configuration
**File:** `backend/app/config.py`
```python
ALLOWED_ORIGINS: List[str] = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://192.168.44.93:5173",  # Added
    "http://192.168.44.93:8000",  # Added
]
```

### 2. Removed Hardcoded API URL
**File:** `docker-compose.yml`

**Before:**
```yaml
frontend:
  environment:
    VITE_API_URL: http://localhost:8000/api
```

**After:**
```yaml
frontend:
  # VITE_API_URL removed - frontend auto-detects backend URL based on hostname
```

### 3. Dynamic Backend URL Detection
**File:** `frontend/src/services/api.ts`
```typescript
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  // Use same host as frontend but port 8000
  const host = window.location.hostname
  const url = `http://${host}:8000/api`
  console.log('[API] Detected backend URL:', url)  // Debug logging
  return url
}

const API_URL = getApiUrl()
```

**Expected behavior:**
- From localhost:5173 → detects http://localhost:8000/api
- From 192.168.44.93:5173 → detects http://192.168.44.93:8000/api

### 4. Fixed AuthContext Login Flow
**File:** `frontend/src/contexts/AuthContext.tsx`

**Problem:** AuthContext only loaded user on mount. After login, token was stored but context wasn't updated, causing ProtectedRoute to redirect back to login.

**Solution:** Added `login(user)` function to update context state:
```typescript
interface AuthContextType {
  user: User | null
  loading: boolean
  login: (user: User) => void  // Added
  logout: () => void
}

const login = (user: User) => {
  setUser(user)
}
```

**File:** `frontend/src/pages/LoginPage.tsx`
```typescript
const user = await authApi.getCurrentUser()
login(user)  // Update AuthContext before navigation
navigate('/dashboard')
```

**Result:** Fixed local login, but mobile still fails

### 5. Password Visibility Toggle
**File:** `frontend/src/pages/LoginPage.tsx`

Added eye icon to toggle password visibility for mobile debugging:
```typescript
const [showPassword, setShowPassword] = useState(false)

<input type={showPassword ? 'text' : 'password'} ... />
<button onClick={() => setShowPassword(!showPassword)}>
  {/* Eye icon SVG */}
</button>
```

### 6. Extensive Console Logging
Added debug logging throughout login flow:
```typescript
console.log('[Login] Starting login with email:', email)
console.log('[Login] Login response received:', response)
console.log('[Login] Token stored in localStorage')
console.log('[Login] Fetching current user...')
console.log('[Login] User verified successfully:', user)
console.log('[Login] Updating AuthContext with user...')
console.log('[Login] Navigating to dashboard...')
```

**Problem:** Can't access Chrome DevTools on Android to see these logs from phone

---

## Current Hypothesis

Backend is successfully processing login and returning JWT token, but one of these is happening on mobile:

1. **Frontend error handling issue**
   - Success response being caught as error
   - Check LoginPage.tsx catch block
   - Check axios interceptors in api.ts

2. **Mobile browser localStorage issue**
   - localStorage.setItem() failing silently
   - Token not being stored properly

3. **CORS preflight failure**
   - OPTIONS request failing but POST succeeding
   - Axios seeing CORS error and treating as auth failure

4. **Response parsing on mobile**
   - Mobile browser parsing JSON differently
   - access_token field missing or malformed

5. **Network proxy/interference**
   - Some middleware between phone and Docker container
   - Stripping headers or modifying response

---

## Files to Investigate

### High Priority
1. **frontend/src/services/api.ts**
   - Lines 46-55: Response interceptor catches 401 and removes token
   - Could be catching non-401 errors and removing token
   - Check if other errors trigger this interceptor

2. **frontend/src/pages/LoginPage.tsx**
   - Lines 45-49: Error handling catch block
   - Check if successful login somehow entering catch block
   - Verify error message logic

3. **backend/app/main.py**
   - CORS middleware configuration
   - Check if preflight requests handled correctly
   - Verify CORS headers in response

### Medium Priority
4. **frontend/src/contexts/AuthContext.tsx**
   - Lines 27-35: User loading logic
   - Could be interfering with login

5. **backend/app/api/auth.py**
   - Login endpoint implementation
   - Verify response format matches TokenResponse schema

---

## Diagnostic Steps to Try

### 1. Enable Remote Debugging (Recommended)
```bash
# On Android phone:
# 1. Enable Developer Options
# 2. Enable USB Debugging
# 3. Connect phone to dev PC via USB

# On dev PC:
# 1. Chrome → chrome://inspect/#devices
# 2. Inspect the 192.168.44.93:5173 page
# 3. View Console logs from phone
```

### 2. Test Different Browsers
- Try Firefox on Android
- Try Samsung Internet browser
- Compare error messages

### 3. Test from Different Device
- Try from another phone on same network
- Try from tablet
- Isolate if it's device-specific

### 4. Capture Network Traffic
```bash
# From dev PC (won't show phone traffic, but useful baseline)
docker-compose logs -f backend | grep "POST /api/auth/login"

# Look for differences between:
# - Successful localhost login
# - Failed network login from phone
```

### 5. Add Response Logging
**File:** `frontend/src/services/api.ts`
```typescript
api.interceptors.response.use(
  response => {
    console.log('[API] Response received:', response.config.url, response.status, response.data)
    return response
  },
  error => {
    console.error('[API] Response error:', error.config?.url, error.response?.status, error.message)
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### 6. Test Minimal Login Flow
Create simple test page that only does:
```typescript
fetch('http://192.168.44.93:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'multipart/form-data' },
  body: formData
})
.then(r => r.json())
.then(data => console.log('SUCCESS:', data))
.catch(err => console.error('ERROR:', err))
```

### 7. Check localStorage Directly
Add button on login page to show localStorage contents:
```typescript
<button onClick={() => alert(JSON.stringify(localStorage))}>
  Debug Storage
</button>
```

### 8. Add Network Status Indicator
```typescript
console.log('[Login] Network online:', navigator.onLine)
console.log('[Login] User agent:', navigator.userAgent)
```

---

## Backend Logs Analysis

### Successful Login Pattern (from phone attempts)
```
devops-maturity-backend | INFO: 172.31.0.1:38352 - "POST /api/auth/login HTTP/1.1" 200 OK
devops-maturity-backend | INFO: 172.31.0.1:38368 - "POST /api/auth/login HTTP/1.1" 200 OK
devops-maturity-backend | INFO: 172.31.0.1:47992 - "POST /api/auth/login HTTP/1.1" 200 OK
devops-maturity-backend | INFO: 172.31.0.1:38034 - "POST /api/auth/login HTTP/1.1" 200 OK
```

**Key Observations:**
- All requests return 200 OK
- Source IP is 172.31.0.1 (Docker internal network - this is correct for WSL2)
- No GET requests to /api/auth/me (should happen after successful login)
- This suggests frontend is failing BEFORE calling getCurrentUser()

**Missing from logs:**
```
# Should see this after successful login:
INFO: 172.31.0.1:XXXXX - "GET /api/auth/me HTTP/1.1" 200 OK
```

**Conclusion:** The login POST succeeds but the subsequent getCurrentUser() GET never happens. This means:
1. Either the login response is missing access_token
2. Or frontend error handling is catching the successful response as an error
3. Or localStorage.setItem() is failing

---

## Questions for Next Investigator

1. **Can you access browser console from phone?**
   - USB debugging with chrome://inspect
   - Remote debugging tools
   - Alternative browser with better debugging

2. **What do you see in Network tab?**
   - Is POST /api/auth/login showing 200 OK?
   - What's in the response body?
   - Is there a GET /api/auth/me request?
   - Any CORS preflight OPTIONS requests?

3. **Does the error message change if you:**
   - Add `alert()` statements instead of console.log?
   - Show the actual error object in UI?
   - Try different credentials?

4. **Can you test these scenarios:**
   - Access from dev PC using network IP (http://192.168.44.93:5173)
   - Access from phone using dev PC's localhost via port forwarding
   - Access from another device on network

---

## Code References

### Login Flow Entry Point
- **File:** frontend/src/pages/LoginPage.tsx
- **Function:** `handleSubmit` (lines 15-50)
- **Key Steps:**
  1. Call authApi.login() → returns {access_token, token_type}
  2. Store token: localStorage.setItem('access_token', response.access_token)
  3. Call authApi.getCurrentUser() → returns User object
  4. Update context: login(user)
  5. Navigate: navigate('/dashboard')

### API Configuration
- **File:** frontend/src/services/api.ts
- **URL Detection:** getApiUrl() (lines 16-25)
- **Request Interceptor:** Lines 37-43 (adds Bearer token)
- **Response Interceptor:** Lines 46-55 (handles 401)

### Auth Context
- **File:** frontend/src/contexts/AuthContext.tsx
- **Login Function:** Lines 42-44
- **User Loading:** Lines 19-39 (useEffect on mount)

### Protected Routes
- **File:** frontend/src/components/ProtectedRoute.tsx
- **Logic:** If no user in context, redirect to /login

### Backend Login Endpoint
- **File:** backend/app/api/auth.py
- **Endpoint:** POST /auth/login
- **Returns:** TokenResponse {access_token: str, token_type: str}

### Backend CORS
- **File:** backend/app/config.py
- **ALLOWED_ORIGINS:** Lines 19-24

---

## Next Steps (Prioritized)

### Immediate (Can do now)
1. ✅ Document everything for next person (this file)
2. ⬜ Add response logging to axios interceptors
3. ⬜ Add localStorage debugging to login page
4. ⬜ Test from dev PC using network IP (not localhost)

### Short-term (Requires tools)
5. ⬜ Set up USB debugging to access phone console
6. ⬜ Capture browser Network tab from phone
7. ⬜ Test with Firefox/Safari on mobile

### Investigation (Requires code changes)
8. ⬜ Create minimal fetch() test page
9. ⬜ Add comprehensive response logging
10. ⬜ Check if issue is localStorage, CORS, or error handling

### Long-term (If simple fixes don't work)
11. ⬜ Set up proper error tracking (Sentry, etc.)
12. ⬜ Add health check endpoints
13. ⬜ Create network diagnostic page

---

## Related Documentation

- **Main Instructions:** /home/jim/devops-maturity-model/CLAUDE.md
- **Lessons Learned:** /home/jim/devops-maturity-model/docs/lessons-learned.md (Issue #16)
- **Testing Protocol:** /home/jim/devops-maturity-model/docs/TESTING-SESSION-PROMPT.md
- **Network Config:** docker-compose.yml
- **Backend Config:** backend/app/config.py

---

## Contact / Handoff Notes

**User Request:** "i want to give someone else a shot at fixing it"

**Current Status:**
- Login works 100% locally
- All network connectivity verified
- Backend processes requests successfully
- Frontend shows error despite backend success
- Cannot access mobile browser console for debugging

**Key Insight:** Backend logs show 200 OK but NO subsequent GET /api/auth/me request. This means the error is happening in frontend between receiving login response and calling getCurrentUser().

**Most Likely Causes (in order):**
1. Frontend error handling catching successful response as error
2. localStorage failing on mobile browser
3. Response parsing issue
4. CORS preflight failing (but POST succeeding somehow)

**Recommended First Step:** Set up chrome://inspect USB debugging to see actual console logs from phone. This will immediately reveal where the flow is breaking.

Good luck! 🚀
