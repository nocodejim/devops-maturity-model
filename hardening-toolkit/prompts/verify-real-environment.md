# Verify Real Environment — Agent Prompt

**Role:** You are an engineering agent executing the "verify-real-environment" playbook below.

**When to use this prompt:** Prove a change works by exercising it in the running application before claiming completion — build success, exit code 0, and HTTP 200 are not verification. Use when completing any feature or fix, when reviewing a claim that something "works," or when writing a completion report.

---


# Verify in the Real Environment

The founding incident for this skill: a frontend was declared working because
`curl` returned HTML — the browser showed a broken app. The directive that
came out of it: **always test by actually accessing the application in its
intended environment, not by checking that endpoints respond.** curl showing
HTML ≠ working application.

"It compiles," "the container started," and "the endpoint returns 200" are
necessary conditions, not evidence. Evidence is the application observably
doing the new thing.

## The verification ladder

Each rung subsumes the ones below it. Claiming completion requires stating
which rung you reached — and the rung must match the change (see the matrix).

1. **Build/type-check passes.** Floor, not verification. Catches syntax, not
   behavior.
2. **Unit tests pass.** Verifies logic in isolation. Cannot catch wiring
   errors: wrong URL, missing router registration, CORS, migrations not
   applied, env vars unset.
3. **Functional API verification.** Real HTTP against the running app,
   asserting on the **response body**, not the status code. A 200 with the
   wrong payload passes rung-2 thinking and is still a bug. Exercise the
   failure paths too (invalid input → 422, missing resource → 404, other
   user's resource → denied).
4. **Browser verification.** Perform the user action in a real browser
   against the running stack. Observe: the UI change happened, the data
   persisted (reload the page), and the **console shows no new errors** — a
   feature that "works" while throwing console errors is not done.

## Minimum rung by change type

| Change | Minimum verification |
|---|---|
| New/changed API endpoint | Rung 3: authenticated request; assert payload fields and values; exercise at least one failure path |
| Database migration | Apply against a realistic DB, then query the changed structure; restart the app and hit an endpoint that uses it |
| Frontend feature/fix | Rung 4: perform the action, observe the result, reload to confirm persistence, check console |
| Auth-adjacent change | Rung 4 as the affected user; plus rung 3 proving the *denied* case still denies |
| Config/env/compose change | Boot from a clean state (down + up, fresh shell); stale state hides config bugs |
| Bug fix | Reproduce the bug first, then verify the same steps no longer reproduce it |
| Pure refactor | Rungs 1–2 plus a rung-3/4 spot check of the most affected flow |

## Evidence rule

The completion report contains **observed output, pasted** — the actual JSON
body, the actual console state, the actual test summary — not paraphrase.
Writing "should work" or "works as expected" without pasted evidence means
verification did not happen.

```markdown
## Verification
- Rung reached: 3 (functional API)
- Command: <the actual request made>
- Observed: <the actual response body>
- Failure path: <request> → <observed rejection>
- Console/log state: <clean, or the exact new lines>
```

## Traps this ladder exists to catch

- **The curl-HTML trap:** the server returning *a* response says nothing
  about the app working. Assert on content, or use a browser.
- **The 200-with-wrong-body trap:** status codes lie by omission; bodies
  don't.
- **The stale-state trap:** it works in your running container because of
  state that a fresh deployment won't have (hand-applied schema tweaks,
  cached bundles, exported env vars). When config or schema changed, verify
  from clean state.
- **The happy-path-only trap:** the demo path works; the validation and
  denial paths were never exercised. Failure paths are part of the feature.
- **The silent-console trap:** the page renders while errors stream by in
  the console. Open it. Every time.

## When the environment can't be reached

If real verification is impossible in the session (no browser, no running
stack), the honest report is: "implemented; NOT verified in the real
environment — verification steps for a human: 1) … 2) …". Never let an
unverified change be recorded as done. Downgraded claims cost a sentence;
false "working" claims cost a debugging session and trust.
