# Testing Checklist - Comprehensive Application Testing

## Quick Start

**Automated Tests:**
```bash
# Run all automated tests
./tests/run-all-tests.sh

# Or run individual test phases
./tests/scripts/infrastructure.sh
./tests/scripts/backend-api.sh
./tests/scripts/frontend-build.sh
./tests/scripts/integration.sh
```

**Manual Tests:**
- Follow guide: `tests/manual/browser-testing.md`
- Use debugging guide: `tests/manual/debugging-guide.md`

## Document Format

**When to Update:** When adding new features that need testing or when test cases change.

**Checklist Format:**
```markdown
#### Feature Name
- [ ] Test case description
- [ ] Expected result vs actual result
- [ ] Edge cases covered
```

**How to Use:**
- Check boxes `[x]` as tests are completed
- Add new sections for new features
- Document failures with expected vs actual results
- Add integration test scenarios for multi-feature workflows

---

## Critical Testing Directive
**ALWAYS test by actually accessing the application in its intended environment, not just checking if endpoints respond.**
- curl showing HTML ≠ working application
- For web apps, test in browser
- For APIs, test actual functionality not just HTTP responses

## Phase 2: Login & Dashboard Testing

### Prerequisites
- Backend running: http://localhost:8000
- Frontend running: http://localhost:5173
- Test user created: admin@example.com / admin123

### Test Cases

#### 1. Login Page (http://localhost:5173/login)
- [ ] Page loads without errors
- [ ] Form displays with email and password fields
- [ ] Submit button is present
- [ ] Invalid credentials show error message
- [ ] Valid credentials redirect to dashboard
- [ ] Token is stored in localStorage
- [ ] Network errors are handled gracefully

#### 2. Dashboard Page (http://localhost:5173/dashboard)
- [ ] Redirects to /login if not authenticated
- [ ] Header displays user name and logout button
- [ ] Analytics cards display (total, completed, avg score, avg maturity)
- [ ] Assessments list section displays
- [ ] "New Assessment" button is present
- [ ] Empty state shows when no assessments
- [ ] Logout button clears token and redirects to login

#### 3. Create Assessment Flow
- [ ] Click "New Assessment" shows form
- [ ] Team name input field appears
- [ ] Create button is disabled when field is empty
- [ ] Cancel button closes form
- [ ] Submit creates assessment and redirects to /assessment/:id

#### 4. Assessment List
- [ ] Assessments display with correct status badges
- [ ] Draft assessments show "Start" button
- [ ] In-progress assessments show "Continue" button
- [ ] Completed assessments show "View Results" button
- [ ] Completed assessments show score and maturity level
- [ ] Delete button prompts confirmation
- [ ] Delete removes assessment and refreshes list

## Browser Console Checks
- [ ] No JavaScript errors in console
- [ ] No 404 errors for assets
- [ ] API requests complete successfully
- [ ] No CORS errors

#### 5. Assessment Form (http://localhost:5173/assessment/:id)
- [ ] Redirects to /login if not authenticated
- [ ] Loads gates definitions from API
- [ ] Displays domain navigation sidebar
- [ ] Shows 5 domains with completion status
- [ ] Current domain is highlighted
- [ ] Displays gates and questions for current domain
- [ ] Score buttons (0-5) work correctly
- [ ] Selected score is highlighted
- [ ] Notes textarea accepts input
- [ ] "Save Progress" button saves responses
- [ ] Shows "✓ Saved" feedback after save
- [ ] Progress bar updates as questions are answered
- [ ] Progress counter shows X / 40 questions
- [ ] Domain completion checkmarks appear
- [ ] "Submit Assessment" button requires responses
- [ ] Submit confirmation dialog appears
- [ ] Successful submit redirects to results page
- [ ] Can navigate back to dashboard without losing progress

#### 6. Results Page (http://localhost:5173/results/:id)
- [ ] Redirects to /login if not authenticated
- [ ] Displays overall score prominently
- [ ] Shows maturity level with badge
- [ ] Domain breakdown displays all 5 domains
- [ ] Each domain shows score, maturity level, progress bar
- [ ] Strengths list displays per domain
- [ ] Gaps/improvements list displays per domain
- [ ] Gate performance section shows all 20 gates
- [ ] Each gate shows percentage and score
- [ ] Top strengths section displays
- [ ] Top gaps/improvements section displays
- [ ] Recommendations section displays
- [ ] "Back to Dashboard" button works

## Integration Testing
- [ ] Complete flow: Login → Dashboard → Create → Assessment → Submit → Results → Dashboard
- [ ] Data persistence: Refresh page during assessment, data is preserved
- [ ] Token expiry: Wait for token to expire, gets redirected to login
- [ ] API error handling: Disconnect backend, errors are displayed gracefully

## Manual Test Results
*To be filled in during testing:*

### Date: 2025-10-07
- Login Page:
- Dashboard Page:
- Create Assessment:
- Assessment Form:
- Submit Assessment:
- Results Page:
- Console Errors:
