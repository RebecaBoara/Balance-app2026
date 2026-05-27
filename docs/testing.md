# Testing Strategy

This document defines the testing approach for Balance across unit, integration, and user acceptance testing (UAT), including edge-case coverage and traceability to requirements.

## Scope

- Functional behavior of mood-aware recommendations
- Authentication and onboarding flow
- Task CRUD and recurrence behavior
- AI messaging flow (daily spark + mood suggestion)
- Settings persistence and reminder configuration
- Notification cron behavior

## Test Environments

| Environment | Purpose | Notes |
|---|---|---|
| Local (`npm run dev`) | Developer validation | Fast iteration and debugging |
| Staging (Vercel preview) | Integration checks | Production-like behavior |
| Production (Vercel) | Final verification | Limited smoke checks only |

## Unit Tests

Focus: deterministic logic and helper functions.

### Unit Test Cases

| Test ID | Module / Function | Scenario | Expected Result | Priority |
|---|---|---|---|---|
| UT-01 | `lib/mood.ts` `getRecommendedTasks` | `exhausted` with mixed difficulty tasks | Only allowed tasks recommended, disallowed deferred | High |
| UT-02 | `lib/mood.ts` `getRecommendedTasks` | `stressed` with mixed difficulty tasks | Easy tasks surfaced first | High |
| UT-03 | `lib/mood.ts` `getRecommendedTasks` | `neutral` tasks | Balanced filtering behavior, no regression in ordering rule | High |
| UT-04 | `lib/mood.ts` `getRecommendedTasks` | `energised` tasks | Hard tasks prioritised | High |
| UT-05 | Tasks date helpers | `isToday/isUpcoming/isOverdue` with valid and empty dates | Correct boolean outputs | High |
| UT-06 | Recurrence helpers | Monthly recurrence on month-end dates | Next date remains valid calendar day | High |
| UT-07 | AI route fallback | Missing API key / API failure | Fallback payload returned safely | High |

### Unit Edge Cases

| Edge ID | Case | Expected Result |
|---|---|---|
| UE-01 | Empty task list | No crash; empty recommended/deferred |
| UE-02 | All tasks hard + low-energy mood | Deferred list populated correctly |
| UE-03 | Task with no due date | Date helpers handle undefined safely |
| UE-04 | Invalid mood payload to AI route | Safely normalized to general/fallback behavior |

## Integration Tests

Focus: feature flow across UI, Firebase, and APIs.

### Integration Scenarios

| Test ID | Flow | Steps | Expected Result | Priority |
|---|---|---|---|---|
| IT-01 | Email signup | Create new account | User created, profile doc created, onboarding shown | High |
| IT-02 | Duplicate signup block | Reuse existing email | Error shown, no duplicate account | High |
| IT-03 | Google login/signup | Continue with Google | Successful auth + profile provisioning | High |
| IT-04 | Auth guard | Access `/app/*` when logged out | Redirect to `/auth/login` | High |
| IT-05 | Onboarding completion | Save reminder time + continue | `hasOnboarded` and reminder fields persisted | High |
| IT-06 | Mood check-in to tasks | Select mood and submit | Entry saved; tasks page uses saved suggestion/mood context | High |
| IT-07 | Task recurrence | Complete repeating task | Next instance created with correct date | High |
| IT-08 | Settings persistence | Change theme/reminder/profile options | Values persist after refresh | Medium |
| IT-09 | AI route auth | Call AI route without token | `401 Unauthorized` | High |
| IT-10 | Notification cron | Trigger cron route with valid secret | Due users processed, send counts returned | High |

## UAT (User Acceptance Testing)

Focus: real-world usability and acceptance.

### UAT Scenarios

| UAT ID | Persona / Context | User Goal | Acceptance Criteria |
|---|---|---|---|
| UAT-01 | Student, low energy | Complete daily check-in quickly | Can select mood and get understandable guidance in under 30 seconds |
| UAT-02 | Worker, high task load | Manage non-postponable day | App guidance feels supportive and practical, not unrealistic |
| UAT-03 | Returning user | Continue routine after missed day | Can check in and recover flow without confusion |
| UAT-04 | New user | Setup and first task plan | Onboarding clear; first value delivered in one session |
| UAT-05 | Privacy-conscious user | Understand data use | Can find and understand Terms/Privacy information |

### UAT Feedback Log Template

| Date | Tester | Scenario | Feedback | Severity (`Low/Med/High`) | Action |
|---|---|---|---|---|---|
| YYYY-MM-DD | Initials | UAT-0X |  |  |  |



