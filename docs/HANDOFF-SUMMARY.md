# Mobile Login Issue - Handoff Summary

**Date:** 2025-10-07
**Status:** UNRESOLVED - Needs fresh perspective

---

## TL;DR

Login works perfectly locally but fails from phone on network. Backend shows `200 OK` but frontend shows "invalid email or password". Need to figure out why successful backend response is treated as error in frontend.

---

## The Problem

**Works:** http://localhost:5173 → Login succeeds, navigates to dashboard ✅
**Fails:** http://192.168.44.93:5173 (from phone) → Shows "invalid email or password" ❌

**The Mystery:** Backend logs show `200 OK` for phone login attempts:
```
INFO: 172.31.0.1:38352 - "POST /api/auth/login HTTP/1.1" 200 OK
```

But frontend displays error message to user.

---

## What We Know

### ✅ Confirmed Working
- Network connectivity (phone loads login page)
- Backend accessibility (phone can reach http://192.168.44.93:8000/docs)
- Backend authentication (returns 200 OK with JWT token)
- CORS configuration (added 192.168.44.93 to allowed origins)
- Dynamic URL detection (frontend auto-detects backend URL from hostname)
- AuthContext login flow (fixed to update user state before navigation)
- Local login (works 100% from dev PC)

### ❌ Still Failing
- Phone login shows "invalid email or password"
- No console access on Chrome Android (can't see debug logs)
- No GET request to /api/auth/me after login (suggests error before getCurrentUser() call)

---

## What We Fixed Today

1. **AuthContext Login Loop**
   - Problem: Login succeeded but immediately redirected back to login page
   - Cause: AuthContext not updated with user after login
   - Fix: Added `login(user)` function to update context before navigation
   - Result: Local login now works ✅

2. **Hardcoded API URL**
   - Problem: docker-compose.yml had `VITE_API_URL=http://localhost:8000/api`
   - Cause: Overrode dynamic hostname detection
   - Fix: Removed environment variable, frontend now detects URL from `window.location.hostname`
   - Result: Should work but still fails on mobile ❌

3. **Added Debugging**
   - Extensive console.log throughout login flow
   - Password visibility toggle for mobile
   - API URL detection logging
   - Problem: Can't access logs on mobile browser

---

## Key Files

### Frontend
- `frontend/src/pages/LoginPage.tsx` - Login form and flow (lines 15-50)
- `frontend/src/services/api.ts` - Axios config, URL detection, interceptors (lines 16-55)
- `frontend/src/contexts/AuthContext.tsx` - User state management (lines 42-44)

### Backend
- `backend/app/config.py` - CORS settings (lines 19-24)
- `backend/app/api/auth.py` - Login endpoint

### Config
- `docker-compose.yml` - Removed VITE_API_URL (line 48)

---

## The Mystery

Backend shows successful login:
```
POST /api/auth/login HTTP/1.1" 200 OK
```

But there's NO follow-up request:
```
GET /api/auth/me HTTP/1.1" 200 OK  ← This should happen but doesn't
```

**This tells us:** Error happens in frontend AFTER receiving login response but BEFORE calling getCurrentUser().

Possible causes:
1. Frontend error handling catching success as error
2. localStorage.setItem() failing on mobile
3. Response parsing issue
4. Token missing from response
5. Some axios interceptor triggering

---

## Recommended Next Steps

### 1. Get Mobile Console Logs (CRITICAL)
```bash
# USB Debugging:
# Phone: Settings → Developer Options → USB Debugging
# PC: Chrome → chrome://inspect/#devices
# Inspect the 192.168.44.93:5173 page
# Check Console for [Login] messages
```

### 2. Test from Dev PC Using Network IP
```bash
# From dev PC browser, go to:
http://192.168.44.93:5173

# This will tell you if it's:
# - Mobile browser specific issue
# - OR network IP issue
```

### 3. Check Response Content
Look at what's actually in the 200 OK response:
- Is access_token present?
- Is response format correct?
- Any CORS headers missing?

---

## Test Credentials

```
Email: admin@example.com
Password: admin123
```

---

## Documentation

**Full diagnostic details:**
`docs/mobile-network-troubleshooting.md`

**All issues encountered today:**
`docs/lessons-learned.md` (Issues #14, #15, #16)

**Project instructions:**
`CLAUDE.md`

---

## Environment

```bash
# Start services
docker-compose up -d

# View backend logs
docker-compose logs -f backend

# Rebuild frontend (if needed)
docker-compose up -d --build frontend

# Access
Local:   http://localhost:5173
Network: http://192.168.44.93:5173
Backend: http://192.168.44.93:8000
```

---

## Quick Win to Try

Add this to `frontend/src/pages/LoginPage.tsx` after line 20:

```typescript
console.log('[Login] Login response received:', response)
console.log('[Login] Access token present:', !!response.access_token)
console.log('[Login] Token value:', response.access_token?.substring(0, 20) + '...')

// Add alert for mobile debugging (can see without console)
alert(`Login response: ${response.access_token ? 'Token received' : 'NO TOKEN'}`)
```

This will show an alert on phone confirming if token is received.

---

## Contacts

**User:** Jim
**Network IP:** 192.168.44.93
**Platform:** WSL2 on Windows
**Phone:** Pixel 8 Pro, Chrome on Android

---

Good luck! The answer is probably something simple we've been staring at for hours. Fresh eyes will see it. 🚀
