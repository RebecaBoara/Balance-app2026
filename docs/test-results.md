# Test Results Log

Use this document to record each test execution run, pass/fail counts, defects, and evidence links.

## Run Summary

| Run ID | Date | Environment | Commit | Tester | Passed | Failed | Blocked | Notes |
|---|---|---|---|---|---:|---:|---:|---|
| TR-001 | 2026-05-26 | Local | `<fill-short-hash>` | Rebeca Boara | 22 | 1 | 2 | First structured test run for LO3 evidence |

## Unit Test Results

| Run ID | Test ID | Expected | Actual | Status (`Pass/Fail`) | Defect Ref |
|---|---|---|---|---|---|
| TR-001 | UT-01 | Exhausted mode surfaces high-priority and urgent (due today/overdue) tasks first, then easy tasks; medium/hard non-urgent tasks deferred | Manual logic check: two-bucket ordering confirmed — priority/urgent tasks appear before easy tasks; remaining deferred | Pass | |
| TR-001 | UT-02 | Stressed mode uses same two-bucket logic as exhausted: high-priority/urgent first, then easy tasks; non-urgent medium/hard tasks deferred | Manual logic check confirms stressed and exhausted share identical filtering and ordering | Pass | |
| TR-001 | UT-03 | Neutral mode surfaces high-priority and urgent tasks (any difficulty) first; then easy + medium tasks; hard non-urgent/non-priority tasks deferred | Manual logic check confirms mustDo bucket always surfaces regardless of difficulty; hard non-urgent tasks deferred | Pass | |
| TR-001 | UT-04 | Good and Energised modes show all tasks sorted: high-priority first, then by difficulty (hard → medium → easy), then by creation date | Manual logic check confirms sort order: `effectivePriority` (0 = priority, 1 = normal) → `diffOrder` (hard=0, medium=1, easy=2) → `createdAt` | Pass | |
| TR-001 | UT-05 | Date helpers correctly classify tasks as today / upcoming / overdue based on ISO date string comparison against current date | `isToday()`, `isUpcoming()`, `isOverdue()` cases validated in tasks UI filter flow | Pass | |
| TR-001 | UT-06 | Monthly recurrence on month-end dates clamps correctly — e.g. Jan 31 + 1 month = Feb 28 (not Mar 3) | `addMonths()` uses `Math.min(day, lastDay)` to clamp — validated manually with Jan 31 and Oct 31 edge cases | Pass | |
| TR-001 | UT-07 | AI route (`POST /api/ai/daily-message`) returns a `source: "fallback"` payload without crashing when OpenAI is unavailable | Fallback payload returned with correct structure; `source` field set to `"fallback"` | Pass | |

## Integration Test Results

| Run ID | Test ID | Expected | Actual | Status (`Pass/Fail`) | Defect Ref |
|---|---|---|---|---|---|
| TR-001 | IT-01 | Email signup creates Firebase Auth account and Firestore user profile, then redirects to `/onboarding` | Signup succeeded; profile document created with default fields; redirected to onboarding | Pass | |
| TR-001 | IT-02 | Duplicate email signup blocked with a clear error message; no second account created | "Email already in use" error displayed; account creation blocked | Pass | |
| TR-001 | IT-03 | Google OAuth creates or reuses a Firestore profile and logs the user in | Google popup login successful; profile created on first login and reused on subsequent logins | Pass | |
| TR-001 | IT-04 | Unauthenticated user accessing any `/app/*` route is redirected to `/auth/login` | Redirect to `/auth/login` confirmed for `/app/mood`, `/app/tasks`, `/app/dashboard` | Pass | |
| TR-001 | IT-05 | Onboarding final step saves `hasOnboarded: true` and `emailReminders: true/false` to Firestore, then routes to `/app/mood` | Both fields persisted after completing onboarding; user redirected to mood check-in | Pass | |
| TR-001 | IT-06 | Mood check-in saves a mood entry (mood, note, date, AI spark + suggestion) to Firestore and routes to `/app/tasks` | Mood entry saved with correct date; task list reflects mood-aware recommendations | Pass | |
| TR-001 | IT-07 | Completing a recurring task creates a new incomplete task instance with the correct next due date; duplicate guard prevents double-creation | Next task instance created with expected due date (daily +1 day, weekly +7 days, monthly clamped); duplicate check prevents re-creation if instance already exists | Pass | |
| TR-001 | IT-08 | Settings changes (display name, email reminder toggle) persist to Firestore and survive a page reload | Profile fields updated via `saveUserProfile` (merge); changes confirmed after reload | Pass | |
| TR-001 | IT-09 | `POST /api/ai/daily-message` without a valid Firebase ID token returns `401 Unauthorized` | 401 response confirmed when `Authorization: Bearer <invalid>` header is absent or invalid | Pass | |
| TR-001 | IT-10 | Cron route (`GET /api/notifications/cron`) sends daily check-in emails to all users with `emailReminders !== false`, sequentially with 300 ms delay to respect Resend rate limits | Emails sent successfully; sequential send with delay resolved earlier "Too many requests" errors from Resend | Blocked | DEF-001 |
| TR-001 | IT-11 | Deleting a participant via the admin panel removes both the Firebase Auth account and the Firestore profile via a secure server-side route (`DELETE /api/admin/delete-user`); email becomes immediately reusable | Both Auth account and Firestore profile deleted; re-registration with same email confirmed | Pass | |

## UAT Results

| Run ID | UAT ID | Scenario Outcome | Status (`Pass/Fail`) | Feedback Summary | Action |
|---|---|---|---|---|---|
| TR-001 | UAT-01 | Mood check-in completed quickly and clearly | Pass | Daily flow is simple and easy to understand | Keep as is |
| TR-001 | UAT-02 | High-priority and overdue tasks visible even on exhausted/stressed days | Pass | Priority tasks (marked by toggle) and overdue tasks now always surface first regardless of mood — non-urgent medium/hard tasks still deferred | Fix applied in TR-001 — see DEF-003 |
| TR-001 | UAT-03 | Returning after a missed day was smooth with no friction | Pass | No error state or forced flow when skipping a day; full task list shows without mood filtering | Keep as is |
| TR-001 | UAT-04 | First-time onboarding reached core value in one session | Pass | Onboarding clarity generally strong; two-button reminder step now advances immediately on selection | Minor wording polish applied |
| TR-001 | UAT-05 | Privacy information discoverable and understandable | Pass | Legal pages clear and accessible from footer; data handling explained in FAQ | Keep as is |

## Defect Log

| Defect ID | Date | Found In (Test ID) | Severity (`Low/Med/High`) | Description | Status | Fix Commit |
|---|---|---|---|---|---|---|
| DEF-001 | 2026-05-26 | IT-10 | High | Cron email delivery unreliable in production: no per-user timezone awareness (all emails sent at cron fire time, currently 7 AM BST via `0 6 * * *`), no one-send-per-day guard to prevent duplicate sends on cron retries. Rate limit issue resolved via sequential send + 300 ms delay. | Open — partial fix applied | |
| DEF-002 | 2026-05-26 | UT-06 | Low | Monthly recurrence month-end edge case had no automated test evidence; manual validation added. `addMonths()` correctly clamps using `Math.min(day, lastDay)`. | Closed — resolved by code review | |
| DEF-003 | 2026-05-26 | UAT-02 | Medium | On exhausted and stressed days, high-priority and overdue tasks were not surfaced — users with non-postponable work had no way to surface urgent items. | Closed — fixed in TR-001: `isHighPriority(t) \|\| isUrgent(t)` mustDo bucket added to exhausted, stressed, and neutral mood algorithms | |

## Evidence Links

| Evidence Type | Link / Path | Notes |
|---|---|---|
| Screenshot | `/docs/evidence/signup-success.png` | Successful signup + onboarding redirect |
| Screenshot | `/docs/evidence/check-in-mood.png` | Check-in to tasks transition |
| Screenshot | `/docs/evidence/domain check.png` | Resend sender domain `balance-mood.co.uk` verified — confirms emails are sent from an authenticated domain |
| Screenshot | `/docs/evidence/postman-error-emails.png` | Cron route response showing rate limit failure: `{sent: 5, failed: 2, errors: ["Too many requests"]}` — triggered when emails sent in parallel |
| Screenshot | `/docs/evidence/postman-sent-emails.png` | Cron route response after fix: sequential send with 300 ms delay — all emails delivered successfully |



## Known Limitations


- **One-send-per-day guard**: The cron has no deduplication guard — if Vercel retries the cron job, a user could receive two emails on the same day. Acceptable risk for a research prototype.
- **AI suggestion quality**: GPT-4o-mini is used via a server-side route with a hardcoded fallback. AI output quality is strong but prompt and tone may need iteration based on participant feedback.
