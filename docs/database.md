# Balance App — Database Documentation

**Project:** Balance — Productivity & Wellbeing  
**Author:** Rebeca Boara  
**University:** Southampton Solent University  
**Module:** QHO656 Dissertation Project 2025–26 
**Last updated:** May 2026

---

## Overview

Balance uses **Firebase Firestore** as its database — a NoSQL cloud-hosted document database provided by Google. Firestore stores data as **collections** of **documents**, where each document contains fields of various types (string, number, boolean, array, timestamp).

The database has three collections:

| Collection | Purpose | Documents |
|---|---|---|
| `users` | User profiles and app preferences | One per registered user |
| `tasks` | Task management data | Many per user |
| `moods` | Daily mood check-in entries | One per user per day |

All data is private to each user and protected by Firestore Security Rules. No user can read or write another user's data under any circumstances.

---

## Why Firebase Firestore?

Firestore was selected for the following reasons:

- **Real-time sync** — data updates instantly across devices without page refresh
- **Serverless** — no backend server required, reducing infrastructure complexity
- **Authentication integration** — works natively with Firebase Auth so user identity is always verified
- **Free tier** — the Spark plan supports up to 50,000 reads and 20,000 writes per day, more than sufficient for a dissertation prototype with 10–20 test participants
- **GDPR compliance** — Firebase is hosted on Google Cloud with data residency options. The Balance project uses the **europe-west2 (London)** region to keep data within the UK/EU
- **Security Rules** — server-side access control that enforces data ownership at the database level

---

## Collections

### 1. `users`

Stores user profile information and app preferences. Created automatically when a user registers. The document ID is the user's Firebase Auth UID, which means no query is needed to fetch it — you always know the document path.

#### Document structure

| Field | Type | Description | Example |
|---|---|---|---|
| `uid` | string | Firebase Auth user ID | `"abc123xyz"` |
| `email` | string | User's email address | `"rebeca@email.com"` |
| `displayName` | string | User's display name | `"Rebeca"` |
| `reminderTime` | string | Daily reminder time (HH:MM) | `"08:00"` |
| `reminders` | boolean | Whether daily reminders are enabled | `true` |
| `breakSuggestions` | boolean | Whether break suggestions are enabled | `true` |
| `theme` | string | UI theme preference | `"system"` \| `"light"` \| `"dark"` |
| `createdAt` | number | Account creation timestamp (ms) | `1713254400000` |

#### Example document

```json
{
  "uid": "abc123xyz",
  "email": "rebeca@email.com",
  "displayName": "Rebeca",
  "reminderTime": "08:00",
  "reminders": true,
  "breakSuggestions": true,
  "theme": "system",
  "createdAt": 1713254400000
}
```

#### Document path

```
/users/{userId}
```

#### Security rule

```javascript
match /users/{userId} {
  allow read, write: if request.auth != null
    && request.auth.uid == userId;
}
```

The document ID is the userId itself — no field comparison needed. A user can only access their own profile document.

#### Functions in `lib/db.ts`

| Function | Description |
|---|---|
| `getUserProfile(userId)` | Fetches the user's profile document |
| `saveUserProfile(userId, data)` | Updates specific fields (merge — never overwrites) |
| `createUserProfile(userId, email, displayName)` | Creates default profile on first signup |

---

### 2. `tasks`

Stores all tasks created by users. Each task belongs to one user identified by the `userId` field. Tasks persist indefinitely until deleted by the user.

#### Document structure

| Field | Type | Required | Description | Example |
|---|---|---|---|---|
| `userId` | string | Yes | Firebase Auth UID of the owner | `"abc123xyz"` |
| `title` | string | Yes | Task name/description | `"Write dissertation chapter"` |
| `difficulty` | string | Yes | Task difficulty level | `"easy"` \| `"medium"` \| `"hard"` |
| `estimatedMin` | number | Yes | Estimated completion time in minutes | `30` |
| `priority` | string | No | Task priority level | `"high"` \| `"medium"` \| `"low"` |
| `completed` | boolean | Yes | Whether task is done | `false` |
| `dueDate` | string \| null | No | Optional due date (YYYY-MM-DD) | `"2026-04-20"` |
| `dueTime` | string \| null | No | Optional due time (HH:mm) | `"14:00"` |
| `notes` | string | No | Optional additional notes | `"Check references"` |
| `createdAt` | number | Yes | Creation timestamp (ms) | `1713254400000` |
| `completedAt` | number \| null | No | Completion timestamp (ms) | `null` |

#### Example document

```json
{
  "userId": "abc123xyz",
  "title": "Write dissertation chapter",
  "difficulty": "hard",
  "estimatedMin": 90,
  "priority": "high",
  "completed": false,
  "dueDate": "2026-04-20",
  "dueTime": "14:00",
  "notes": "Focus on methodology section first",
  "createdAt": 1713254400000,
  "completedAt": null
}
```

#### Document path

```
/tasks/{taskId}
```
Where `taskId` is auto-generated by Firestore on document creation.

#### Security rules

```javascript
match /tasks/{taskId} {
  allow read, delete: if request.auth != null
    && request.auth.uid == resource.data.userId;

  allow create: if request.auth != null
    && request.auth.uid == request.resource.data.userId;

  allow update: if request.auth != null
    && request.auth.uid == resource.data.userId
    && request.auth.uid == request.resource.data.userId;
}
```

The `update` rule checks both the existing document (`resource`) and the incoming data (`request.resource`) to prevent ownership transfer — a user cannot change a task's `userId` to assign it to someone else.

#### Functions in `lib/db.ts`

| Function | Description |
|---|---|
| `getTasks(userId)` | Fetches all tasks for a user, ordered by `createdAt` descending |
| `addTask(userId, title, difficulty, estimatedMin, dueDate?, dueTime?, notes?, priority?)` | Creates a new task document |
| `toggleTask(taskId, completed)` | Marks a task complete or incomplete |
| `deleteTask(taskId)` | Permanently deletes a task |

#### Firestore index required

The `getTasks` query uses `where` + `orderBy` on different fields, which requires a composite index:

| Collection | Fields | Order |
|---|---|---|
| `tasks` | `userId` (Ascending), `createdAt` (Descending) | Composite |

Create this in Firebase Console → Firestore → Indexes → Add index.

---

### 3. `moods`

Stores daily mood check-in entries. One entry per user per day — if a user checks in twice on the same day the existing document is updated rather than a new one created.

#### Document structure

| Field | Type | Required | Description | Example |
|---|---|---|---|---|
| `userId` | string | Yes | Firebase Auth UID of the owner | `"abc123xyz"` |
| `mood` | string | Yes | Selected mood state | `"exhausted"` \| `"stressed"` \| `"neutral"` \| `"good"` \| `"energised"` |
| `note` | string | No | Optional user note | `"Didn't sleep well"` |
| `date` | string | Yes | ISO date string (YYYY-MM-DD) | `"2026-04-09"` |
| `createdAt` | number | Yes | Entry creation timestamp (ms) | `1713254400000` |
| `aiSpark` | string | No | AI-generated daily spark quote for this entry | `"One step at a time is still forward."` |
| `aiSuggestion` | string | No | AI-generated Balance suggests message for this entry | `"Start with one small task to build momentum..."` |

#### Example document

```json
{
  "userId": "abc123xyz",
  "mood": "exhausted",
  "note": "Didn't sleep well last night",
  "date": "2026-04-09",
  "createdAt": 1713254400000,
  "aiSpark": "One step at a time is still forward. You've got this.",
  "aiSuggestion": "You're doing enough. Start with one small task to build momentum — even one thing crossed off makes the day count. Try 15 minutes on, 10 minutes off to protect your energy."
}
```

`aiSpark` and `aiSuggestion` are optional — they are only present when AI generation succeeded. If the AI request fails, the fields are omitted and the UI falls back to static messages from `MOOD_CONFIG`.

#### Document path

```
/moods/{moodId}
```
Where `moodId` is auto-generated by Firestore on document creation.

#### Security rules

```javascript
match /moods/{moodId} {
  allow read, delete: if request.auth != null
    && request.auth.uid == resource.data.userId;

  allow create: if request.auth != null
    && request.auth.uid == request.resource.data.userId;

  allow update: if request.auth != null
    && request.auth.uid == resource.data.userId
    && request.auth.uid == request.resource.data.userId;
}
```

#### Functions in `lib/db.ts`

| Function | Description |
|---|---|
| `saveMoodEntry(userId, mood, note?, aiSpark?, aiSuggestion?)` | Creates or updates today's mood entry; persists AI content when available |
| `getTodaysMood(userId)` | Fetches today's mood entry if it exists |
| `getMoodHistory(userId, days?)` | Fetches mood entries for the last N days (default 7) |
| `getDashboardStats(userId)` | Aggregates tasks and moods into dashboard statistics |

#### Firestore indexes required

Two composite indexes are needed for mood queries:

| Collection | Fields | Order | Used by |
|---|---|---|---|
| `moods` | `userId` (Ascending), `date` (Descending) | Composite | `getMoodHistory` |
| `moods` | `userId` (Ascending), `date` (Ascending) | Composite | `getDashboardStats` |

---

## Security Rules (complete)

Paste the following into Firebase Console → Firestore Database → Rules → Publish:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users — document ID is the userId
    match /users/{userId} {
      allow read, write: if request.auth != null
        && request.auth.uid == userId;
    }

    // Tasks
    match /tasks/{taskId} {
      allow read, delete: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null
        && request.auth.uid == resource.data.userId
        && request.auth.uid == request.resource.data.userId;
    }

    // Moods
    match /moods/{moodId} {
      allow read, delete: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null
        && request.auth.uid == resource.data.userId
        && request.auth.uid == request.resource.data.userId;
    }

  }
}
```

---

## Indexes (complete list)

Create all of these in Firebase Console → Firestore → Indexes → Add index:

| # | Collection | Field 1 | Field 2 | Type |
|---|---|---|---|---|
| 1 | `tasks` | `userId` (Asc) | `createdAt` (Desc) | Composite |
| 2 | `moods` | `userId` (Asc) | `date` (Desc) | Composite |
| 3 | `moods` | `userId` (Asc) | `date` (Asc) | Composite |

---

## Data flow diagram

```
User signs up / logs in
        │
        ▼
Firebase Auth (manages identity)
        │
        ├──► /users/{uid}        ← profile + preferences created
        │
        ▼
User checks in mood
        │
        ├──► /api/ai/daily-message  ← AI generates spark + suggestion
        │
        ▼
/moods/{moodId}                  ← mood entry saved with date, aiSpark, aiSuggestion
        │
        ▼
Recommendation engine (lib/mood.ts)
        │
        ├── reads mood + task priority + due dates
        └── filters and sorts /tasks/{taskId} based on mood tier
                │
                ▼
        Task list displayed to user
                │
                ▼
        User completes tasks → toggleTask() updates /tasks/{taskId}
                │
                ▼
        Dashboard reads both collections → getDashboardStats()
```

---

## GDPR compliance

In accordance with the General Data Protection Regulation (GDPR) and the project's ethical clearance from Southampton Solent University:

- **Data minimisation** — only the minimum necessary data is collected (mood, tasks, preferences, AI-generated content). No location data, biometric data, or behavioural tracking is stored.
- **Purpose limitation** — data is used solely for providing mood-aware task recommendations and productivity insights within the Balance application.
- **Data residency** — Firestore is configured to use the `europe-west2 (London)` region, keeping all data within UK/EU jurisdiction.
- **User control** — users can delete their account and all associated data at any time via the Settings screen. The delete function removes documents from all three collections.
- **Access control** — Firestore Security Rules ensure no user can access another user's data. All rules require `request.auth != null` confirming the user is authenticated before any read or write is permitted.
- **Encryption** — all data is encrypted at rest and in transit by Firebase/Google Cloud by default. No additional encryption configuration is required.
- **Explicit consent** — users must tick an explicit consent checkbox during registration confirming they agree to the Terms of Service and Privacy Policy before an account is created.

---

## Environment variables

The following environment variables must be set in `.env.local` (local development) and in Vercel dashboard (production). These connect the app to the Firebase project and OpenAI API.

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
OPENAI_API_KEY
```

> ⚠️ Never commit `.env.local` to GitHub. It is listed in `.gitignore` by default.

---

## Firebase free tier limits (Spark plan)

The dissertation prototype operates within Firebase's free Spark plan. The following limits apply:

| Resource | Free limit | Expected usage (10–20 test users) |
|---|---|---|
| Firestore reads | 50,000 / day | ~500–1,000 / day |
| Firestore writes | 20,000 / day | ~100–200 / day |
| Firestore deletes | 20,000 / day | Minimal |
| Stored data | 1 GB | < 1 MB |
| Authentication | Unlimited | 10–20 users |

Usage is well within free tier limits for the evaluation phase of the dissertation.

---

## Revision history

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | April 2026 | Rebeca Boara | Initial version |
| 1.1 | May 2026 | Rebeca Boara | Added `priority` and `dueTime` fields to tasks; added `aiSpark` and `aiSuggestion` fields to moods; updated `saveMoodEntry` signature; added OPENAI_API_KEY to environment variables; updated data flow diagram; added explicit consent to GDPR section |

---

*This document was created as part of the dissertation project (QHO656) at Southampton Solent University, 2025–26.*
