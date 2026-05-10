# Balance Web App — Requirements Specification

**Project:** Balance — Productivity & Wellbeing  
**Author:** Rebeca Boara  
**University:** Southampton Solent University  
**Module:** QHO656 Dissertation Project 2025-26  
**Version:** 1.0  
**Last updated:** April 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Stakeholders](#2-stakeholders)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [MoSCoW Prioritisation](#5-moscow-prioritisation)
6. [Use Cases](#6-use-cases)
7. [Constraints and Assumptions](#7-constraints-and-assumptions)
8. [Out of Scope](#8-out-of-scope)

---

## 1. Project Overview

### 1.1 Purpose

Balance is a web-based emotion-aware productivity planner that recommends tasks based on the user's daily emotional state. The application bridges the gap between conventional task management tools — which treat all tasks equally regardless of the user's mental state — and emotional wellbeing support systems.

### 1.2 Problem statement

Existing productivity tools such as Todoist, Notion, and Trello are task-centric and emotion-blind. They do not account for the user's cognitive or emotional capacity when presenting tasks, which can lead to increased stress, reduced productivity, and digital wellbeing issues. Research in affective computing (Calvo & D'Mello, 2010) demonstrates that emotional state significantly influences a person's ability to engage with cognitively demanding tasks.

### 1.3 Proposed solution

Balance provides a daily mood check-in mechanism that feeds into an emotion-aware task recommendation algorithm. Tasks are filtered and prioritised based on the user's current emotional state, ensuring that the right tasks are presented at the right time. The application also provides a dashboard with insights into the relationship between mood and productivity over time.

### 1.4 Research objectives

This application is developed as the primary artefact for a dissertation investigating:

> *"The Role of Emotion-Aware Task Recommendations in Enhancing Digital Productivity and Mental Health"*

The application must directly address the following research questions:

- **RQ1:** How do emotions influence user productivity during interactions with digital task management systems?
- **RQ2:** How could emotional data input be used in a task management application to impact job prioritising and recommendations?
- **RQ3:** Do emotion-aware productivity systems improve user experience compared to traditional task management?
- **RQ4:** What usability issues occur when designing emotion-aware productivity systems?

---

## 2. Stakeholders

| Stakeholder | Role | Interest |
|---|---|---|
| Rebeca Boara | Developer / Researcher | Build and evaluate the artefact |
| Chathurika Goonawardane | Dissertation Supervisor | Ensure academic quality and research integrity |
| COM629 Markers | Assessors | Evaluate technical implementation and documentation |
| Usability test participants (10–20) | End users | Test the application during evaluation phase |
| Southampton Solent University | Institution | Ensure ethical and academic compliance |

---

## 3. Functional Requirements

Functional requirements describe what the system must do. Each requirement has a unique ID, priority (using MoSCoW), and a description.

### 3.1 Authentication

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | The system shall allow users to register with an email address and password | Must have |
| FR-02 | The system shall allow users to sign in using Google OAuth | Must have |
| FR-03 | The system shall validate email format and password length (minimum 6 characters) on registration | Must have |
| FR-04 | The system shall display friendly error messages for invalid credentials | Must have |
| FR-05 | The system shall redirect authenticated users away from login/signup pages | Must have |
| FR-06 | The system shall redirect unauthenticated users away from protected pages | Must have |
| FR-07 | The system shall allow users to sign out from any screen | Must have |
| FR-08 | The system shall persist authentication state across browser sessions | Must have |
| FR-09 | The system shall display a password strength indicator during registration | Should have |
| FR-10 | The system shall provide a show/hide password toggle on all password fields | Should have |

### 3.2 User profile

| ID | Requirement | Priority |
|---|---|---|
| FR-11 | The system shall create a user profile document in Firestore on first registration | Must have |
| FR-12 | The system shall store user preferences (reminder time, notifications, break suggestions, theme) | Must have |
| FR-13 | The system shall display the user's first name in personalised greetings | Should have |
| FR-14 | The system shall display the user's avatar initial in the navigation | Should have |

### 3.3 Mood check-in

| ID | Requirement | Priority |
|---|---|---|
| FR-15 | The system shall present five mood options: Exhausted, Stressed, Neutral, Good, Energised | Must have |
| FR-16 | The system shall allow users to select exactly one mood per check-in | Must have |
| FR-17 | The system shall save the mood entry to Firestore with the current date | Must have |
| FR-18 | The system shall allow users to add an optional text note with their check-in | Must have |
| FR-19 | The system shall display a personalised motivational message (Daily Spark) based on the selected mood | Must have |
| FR-20 | The system shall display a suggestion explaining what Balance recommends for the selected mood | Must have |
| FR-21 | The system shall allow only one mood check-in per day per user | Must have |
| FR-22 | The system shall pre-fill the mood form if the user has already checked in today | Must have |
| FR-23 | The system shall allow users to update their mood on the same day | Should have |
| FR-24 | The system shall display a time-appropriate greeting (Good morning / afternoon / evening) | Should have |
| FR-25 | The system shall allow users to skip the mood check-in and proceed to tasks | Should have |
| FR-26 | The system shall show the current date on the check-in screen | Should have |

### 3.4 Task management

| ID | Requirement | Priority |
|---|---|---|
| FR-27 | The system shall allow users to create tasks with a title | Must have |
| FR-28 | The system shall allow users to assign a difficulty level (Easy, Medium, Hard) to each task | Must have |
| FR-29 | The system shall allow users to set an estimated completion time (minutes) for each task | Must have |
| FR-30 | The system shall allow users to set an optional due date for each task | Should have |
| FR-31 | The system shall allow users to add optional notes to each task | Should have |
| FR-32 | The system shall allow users to mark tasks as complete | Must have |
| FR-33 | The system shall allow users to delete tasks | Must have |
| FR-34 | The system shall persist all tasks in Firestore linked to the authenticated user | Must have |
| FR-35 | The system shall display completed tasks with a strikethrough style | Should have |
| FR-36 | The system shall show a celebration animation when a task is completed | Could have |
| FR-37 | The system shall keep completed tasks visible for the rest of the day | Should have |
| FR-38 | The system shall remove completed tasks from the active list the following day | Should have |
| FR-39 | The system shall support optimistic UI updates (instant feedback before Firestore confirms) | Should have |

### 3.5 Emotion-aware recommendations

| ID | Requirement | Priority |
|---|---|---|
| FR-40 | The system shall filter the task list based on the user's current mood | Must have |
| FR-41 | The system shall only recommend Easy tasks when mood is Exhausted or Stressed | Must have |
| FR-42 | The system shall recommend Easy and Medium tasks when mood is Neutral | Must have |
| FR-43 | The system shall recommend all difficulty levels when mood is Good or Energised | Must have |
| FR-44 | The system shall cap the number of recommended tasks based on mood (3–8 tasks) | Must have |
| FR-45 | The system shall display non-recommended tasks in a "Saved for later" section | Must have |
| FR-46 | The system shall display a mood-based suggestion banner on the task screen | Must have |
| FR-47 | The system shall display a prompt to check in if no mood entry exists for today | Must have |
| FR-48 | The system shall sort recommended tasks with Easy tasks first | Should have |
| FR-49 | The system shall include a break suggestion message for low-energy moods | Should have |

### 3.6 Task filtering

| ID | Requirement | Priority |
|---|---|---|
| FR-50 | The system shall provide an All tasks filter showing all incomplete tasks | Must have |
| FR-51 | The system shall provide a Today filter showing tasks due today or with no due date | Should have |
| FR-52 | The system shall provide an Upcoming filter showing tasks with future due dates | Should have |
| FR-53 | The system shall highlight tasks due today with an amber colour indicator | Should have |
| FR-54 | The system shall display an empty state message when no tasks match the current filter | Should have |

### 3.7 Dashboard

| ID | Requirement | Priority |
|---|---|---|
| FR-55 | The system shall display the number of tasks completed this week | Must have |
| FR-56 | The system shall display the task completion rate as a percentage | Must have |
| FR-57 | The system shall display the number of mood check-ins this week | Must have |
| FR-58 | The system shall display the user's most common mood this week | Must have |
| FR-59 | The system shall display a mood bar chart for the last 7 days | Must have |
| FR-60 | The system shall display the user's current check-in streak (consecutive days) | Should have |
| FR-61 | The system shall display a personalised productivity insight | Should have |
| FR-62 | The system shall display an empty state for new users with no data | Should have |

### 3.8 Settings

| ID | Requirement | Priority |
|---|---|---|
| FR-63 | The system shall allow users to toggle daily reminder notifications | Should have |
| FR-64 | The system shall allow users to set their preferred reminder time | Should have |
| FR-65 | The system shall allow users to toggle break suggestions | Should have |
| FR-66 | The system shall allow users to switch between Light, Dark, and System themes | Must have |
| FR-67 | The system shall display the user's profile information (name, email) | Should have |
| FR-68 | The system shall allow users to sign out | Must have |
| FR-69 | The system shall persist theme preference in localStorage | Must have |

### 3.9 Navigation

| ID | Requirement | Priority |
|---|---|---|
| FR-70 | The system shall display a bottom navigation bar on mobile devices | Must have |
| FR-71 | The system shall display a sidebar navigation on tablet and desktop devices | Must have |
| FR-72 | The system shall highlight the active navigation item | Must have |
| FR-73 | The system shall provide navigation to: Check in, Tasks, Dashboard, Settings | Must have |

### 3.10 Landing page

| ID | Requirement | Priority |
|---|---|---|
| FR-74 | The system shall display a public landing page at the root URL | Must have |
| FR-75 | The landing page shall include a hero section with CTA linking to sign up | Must have |
| FR-76 | The landing page shall include a How it works section with three steps | Must have |
| FR-77 | The landing page shall include a Features section | Should have |
| FR-78 | The landing page shall include an interactive mood demo | Should have |
| FR-79 | The landing page shall include a FAQ section with accordion behaviour | Should have |
| FR-80 | The landing page shall include a footer with legal links | Must have |
| FR-81 | The system shall provide a Privacy Policy page | Must have |
| FR-82 | The system shall provide a Terms of Service page | Must have |

---

## 4. Non-Functional Requirements

Non-functional requirements describe how the system behaves rather than what it does.

### 4.1 Performance

| ID | Requirement | Target |
|---|---|---|
| NFR-01 | Page load time | Under 3 seconds on a standard broadband connection |
| NFR-02 | Firestore read response | Under 1 second for task list load |
| NFR-03 | UI interaction feedback | Optimistic updates provide instant visual feedback |
| NFR-04 | Authentication | Login/signup completes within 2 seconds |

### 4.2 Accessibility (WCAG 2.1 Level AA)

| ID | Requirement | Standard |
|---|---|---|
| NFR-05 | Colour contrast — body text | Minimum 4.5:1 ratio |
| NFR-06 | Colour contrast — large text and UI | Minimum 3:1 ratio |
| NFR-07 | Touch targets | Minimum 44×44px for all interactive elements |
| NFR-08 | Focus indicators | Visible 2px focus ring on all keyboard-focusable elements |
| NFR-09 | Screen reader support | All interactive elements have aria-labels |
| NFR-10 | Keyboard navigation | Full tab-order support across all screens |
| NFR-11 | Reduced motion | All animations respect prefers-reduced-motion |
| NFR-12 | Semantic HTML | Correct use of nav, main, aside, section, h1-h3 |
| NFR-13 | Form labels | All inputs have associated label elements |
| NFR-14 | Error identification | All form errors are clearly identified and described |

### 4.3 Security

| ID | Requirement | Implementation |
|---|---|---|
| NFR-15 | Data isolation | Firestore Security Rules prevent cross-user data access |
| NFR-16 | Authentication | All /app/* routes require valid Firebase Auth session |
| NFR-17 | Input validation | All user inputs validated client-side and server-side |
| NFR-18 | Environment variables | Firebase credentials never exposed in source code |
| NFR-19 | HTTPS | All production traffic served over HTTPS via Vercel |

### 4.4 Usability

| ID | Requirement | Target |
|---|---|---|
| NFR-20 | Learnability | New users complete first mood check-in without instruction |
| NFR-21 | Error recovery | All error states provide clear recovery instructions |
| NFR-22 | Consistency | All UI components follow the same design system |
| NFR-23 | Feedback | All user actions receive visual confirmation within 200ms |
| NFR-24 | Simplicity | Core user journey (check in → view tasks) completable in under 60 seconds |

### 4.5 Compatibility

| ID | Requirement | Target |
|---|---|---|
| NFR-25 | Browsers | Chrome, Firefox, Safari, Edge — latest two versions |
| NFR-26 | Mobile | iOS Safari 15+, Chrome Android |
| NFR-27 | Screen sizes | 375px (mobile) to 1440px (desktop) |
| NFR-28 | Responsive | Full functionality on all screen sizes |

### 4.6 Data and privacy (GDPR)

| ID | Requirement | Implementation |
|---|---|---|
| NFR-29 | Data minimisation | Only mood, tasks, and preferences collected |
| NFR-30 | Data residency | Firestore hosted in europe-west2 (London) region |
| NFR-31 | Right to erasure | Users can delete their account and all data |
| NFR-32 | Transparency | Privacy Policy clearly states all data collected |
| NFR-33 | Consent | Users agree to Terms and Privacy Policy on registration |
| NFR-34 | No third-party sharing | User data is not shared with any third parties |

### 4.7 Reliability

| ID | Requirement | Target |
|---|---|---|
| NFR-35 | Uptime | 99%+ via Firebase and Vercel infrastructure |
| NFR-36 | Offline handling | Graceful error messages if connection is lost |
| NFR-37 | Data integrity | Optimistic updates revert on Firestore failure |

---

## 5. MoSCoW Prioritisation

### Must have — core functionality, dissertation fails without these

- User registration and login (email + Google)
- Route protection for authenticated screens
- Daily mood check-in with five mood states
- Mood-based task recommendations (correct filtering by difficulty and count)
- Task creation with title, difficulty, estimated time
- Task completion and deletion
- Mood and task data stored in Firestore
- Dashboard with weekly stats and mood chart
- Light and dark theme
- Mobile bottom navigation and desktop sidebar
- Landing page with sign up CTA
- Privacy Policy and Terms of Service pages
- Firestore Security Rules protecting user data

### Should have — important for quality evaluation and marks

- Due dates and task filter tabs (All / Today / Upcoming)
- Optional task notes
- Password strength indicator
- Daily Spark motivational message
- Break suggestion messages
- Check-in streak tracker
- Completed tasks visible for one day then hidden
- Reminder settings in preferences
- User profile with name display
- Celebration animation on task completion

### Could have — nice to have if time allows

- Browser push notifications for daily reminder
- Weekly summary screen
- 30-day mood history chart
- Task completion statistics by mood state

### Won't have — explicitly out of scope

- Recurring tasks
- Task sharing or collaboration
- AI-generated task suggestions
- Facial recognition or biometric mood detection
- Calendar integration (Google Calendar, Outlook)
- Mobile native app (iOS/Android)
- Paid subscription tiers
- Admin dashboard

---

## 6. Use Cases

### UC-01: Daily mood check-in

**Actor:** Authenticated user  
**Precondition:** User is signed in, navigates to /app/mood  
**Main flow:**
1. System displays greeting with user's first name and current date
2. User selects one of five mood options
3. System displays Daily Spark message and mood suggestion
4. User optionally adds a note
5. User clicks "See my recommended tasks"
6. System saves mood entry to Firestore
7. System redirects to task list screen

**Alternative flow — already checked in:**
- At step 2, system pre-fills previously selected mood
- System shows "already checked in" banner
- Button changes to "Update my mood"

**Alternative flow — skip:**
- At step 4, user clicks "Skip for today"
- System redirects to task list without saving

---

### UC-02: Adding a task

**Actor:** Authenticated user  
**Precondition:** User is on the task list screen  
**Main flow:**
1. User clicks "Add task" button
2. System displays add task modal
3. User enters task title (required)
4. User selects difficulty level
5. User sets estimated time
6. User optionally sets due date and notes
7. User clicks "Add task"
8. System saves task to Firestore
9. System closes modal and adds task to list

**Alternative flow — validation error:**
- If title is empty, submit button is disabled
- User cannot proceed without entering a title

---

### UC-03: Viewing mood-based recommendations

**Actor:** Authenticated user  
**Precondition:** User has completed mood check-in, navigates to /app/tasks  
**Main flow:**
1. System loads user's tasks and today's mood from Firestore
2. System runs recommendation algorithm
3. System displays "Recommended first" section with allowed tasks
4. System displays "Saved for later" section with deferred tasks
5. System displays mood badge and suggestion banner

**Alternative flow — no mood check-in:**
- System displays amber banner prompting check-in
- All tasks shown without filtering

---

### UC-04: Completing a task

**Actor:** Authenticated user  
**Precondition:** User has at least one incomplete task  
**Main flow:**
1. User clicks the circle checkbox on a task card
2. System immediately updates UI (optimistic update)
3. Task shows strikethrough and moves to "Completed today" section
4. Brief celebration animation plays
5. System updates Firestore in background
6. Task remains visible until end of day

**Alternative flow — Firestore error:**
- If save fails, task reverts to incomplete state
- No error shown to user (silent revert)

---

### UC-05: Viewing dashboard

**Actor:** Authenticated user  
**Precondition:** User has at least one mood check-in  
**Main flow:**
1. User navigates to /app/dashboard
2. System fetches tasks and mood history from Firestore
3. System calculates stats (completed tasks, completion rate, streak)
4. System renders stat cards, mood chart, and insight
5. User views their weekly productivity and mood patterns

**Alternative flow — new user:**
- No data available
- System displays empty state with encouragement to start checking in

---

## 7. Constraints and Assumptions

### Constraints

- **Time:** The artefact must be complete before the AE2 submission deadline (12th June 2026)
- **Budget:** Zero budget — all services must use free tiers (Firebase Spark, Vercel Hobby)
- **Solo development:** The application is developed by one person
- **Participants:** Usability testing limited to 10–20 volunteer participants
- **Platform:** Web only — no native mobile app in scope

### Assumptions

- Users have access to a modern web browser on any device
- Users have a valid email address or Google account
- Users are comfortable with basic web application interaction patterns
- Firestore free tier limits (50,000 reads/day, 20,000 writes/day) will not be exceeded during testing
- Participants will test the app on their own devices in their own environment

### Technical assumptions

- Next.js App Router is the correct framework choice for the described feature set
- Firebase Authentication handles all auth edge cases (email verification, password reset) adequately for a prototype
- Tailwind CSS 4 utility classes are sufficient for all styling requirements
- Lucide React provides adequate icon coverage for all UI needs

---

## 8. Out of Scope

The following were considered but explicitly excluded from this version of the application:

| Feature | Reason excluded |
|---|---|
| Facial emotion recognition | Requires camera access, complex ML model, raises significant privacy concerns. Beyond dissertation scope. |
| Push notifications | Requires service worker and VAPID key setup. Too complex for dissertation timeline. Reminder setting in UI retained for future development. |
| Recurring tasks | Adds significant database and UI complexity for marginal research benefit. |
| Task sharing / collaboration | Outside the scope of personal productivity research questions. |
| Google Calendar integration | Significantly increases scope. Noted in EmotiPlan paper as a feature — Balance deliberately focuses on internal task management. |
| Data export | GDPR right to portability noted. Deferred to future development. |
| Paid features / subscription | This is an academic prototype. No commercial features in scope. |
| Native iOS / Android app | Web-first approach was chosen for ease of participant access during usability testing. |
| AI-generated task suggestions | Beyond scope. Mood-based recommendation logic is rule-based by design to ensure explainability. |

---

## Revision history

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | April 2026 | Rebeca Boara | Initial version |

---

*This document was created as part of the Balance dissertation project (QHO656) at Southampton Solent University, 2025-26.*