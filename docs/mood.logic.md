# Balance App — Mood Logic & API Documentation

**Project:** Balance — Productivity & Wellbeing  
**Author:** Rebeca Boara  
**University:** Southampton Solent University  
**Module:** QHO656 Dissertation Project 2025-26  
**Last updated:** April 2026

---

## Overview

This document describes the core logic of the Balance application — the emotion-aware task recommendation system. This is the primary research contribution of the dissertation, directly addressing the research question:

> *"How could emotional data input be used in a task management application to impact job prioritising and recommendations?"*

The recommendation logic lives in `lib/mood.ts` and is the heart of what makes Balance different from conventional task managers.

---

## Mood States

Balance uses five mood states, selected by the user during their daily check-in:

| Mood | Emoji | Colour | Rationale |
|---|---|---|---|
| Exhausted | 😴 | Purple | User has very low energy — protect wellbeing |
| Stressed | 😟 | Coral/Red | User is anxious — reduce cognitive load |
| Neutral | 😐 | Amber | User is steady — balanced workload |
| Good | 🙂 | Sage green | User is positive — full productivity |
| Energised | 😄 | Sky blue | User is at peak — maximise output |

These five states were informed by affective computing research, particularly Calvo and D'Mello (2010) who demonstrate that emotional states significantly influence cognitive performance and task engagement.

---

## Recommendation Logic

### Core function: `getRecommendedTasks(mood, tasks)`

Located in `lib/mood.ts`. Takes the user's current mood and their full task list, and returns two arrays: recommended tasks and deferred tasks.

```typescript
export function getRecommendedTasks(mood: MoodType, tasks: Task[]): {
  recommended: Task[]
  deferred:    Task[]
}
```

**Algorithm:**

1. Filter out completed tasks
2. Split remaining tasks into `allowed` (difficulty permitted for this mood) and `deferred` (difficulty too high)
3. Sort allowed tasks: easy first, then by creation date (oldest first)
4. Cap the recommended list at `maxTasks` for this mood
5. Return `{ recommended, deferred }`

### Mood configuration: `MOOD_CONFIG`

Each mood has a configuration object:

```typescript
interface MoodRecommendation {
  mood:              MoodType
  emoji:             string
  label:             string
  colour:            string
  maxTasks:          number       // max tasks shown in recommended list
  allowedDifficulty: DifficultyType[]  // which difficulties are surfaced
  suggestion:        string       // shown on task screen
  breakSuggestion:   string       // shown when breaks are recommended
  sparkMessage:      string       // shown on mood check-in
}
```

### Mood to task mapping

| Mood | Max tasks | Easy | Medium | Hard | Rationale |
|---|---|---|---|---|---|
| Exhausted | 3 | ✓ | ✗ | ✗ | Only smallest tasks — prevent overwhelm, support wellbeing |
| Stressed | 4 | ✓ | ✗ | ✗ | Light tasks only — reduce anxiety and cognitive pressure |
| Neutral | 5 | ✓ | ✓ | ✗ | Balanced — easy and medium tasks for steady progress |
| Good | 6 | ✓ | ✓ | ✓ | Full access — positive emotional state supports all task types |
| Energised | 8 | ✓ | ✓ | ✓ | Maximum tasks — leverage peak performance window |

---

## Daily Spark Messages

Each mood state has three rotating motivational messages shown on the check-in screen:

```typescript
export const SPARK_MESSAGES: Record<MoodType, string[]> = {
  exhausted: [
    "Rest is not giving up — it's part of the process.",
    "Even small steps forward count. Be kind to yourself today.",
    "Three small wins today is a great day.",
  ],
  // ... etc
}
```

The message rotates daily based on the day of the year (`Math.floor(Date.now() / 86400000) % messages.length`), so it feels fresh without requiring database storage.

**Design rationale:** Research by Norman (2005) supports the use of motivational feedback to maintain user engagement and positive affect. The tone of each message is calibrated to the mood — validating and gentle for low moods, energising and ambitious for high moods.

---

## Task Difficulty System

Tasks are assigned one of three difficulty levels when created:

| Difficulty | Estimated time | Cognitive demand | Example |
|---|---|---|---|
| Easy | < 20 minutes | Low | Reply to emails, review notes |
| Medium | 20–60 minutes | Moderate | Write a report section, implement a feature |
| Hard | > 60 minutes | High | Full dissertation chapter, complex development |

Difficulty is set by the user when creating a task. The recommendation engine uses this field to filter tasks based on mood.

---

## API Route: `/api/recommendations`

A Next.js API route that exposes the recommendation logic as a server-side endpoint. This can be used in the future to extend the recommendation engine with additional context (time of day, historical patterns, etc.) without changing the client-side code.

### Request

```http
POST /api/recommendations
Content-Type: application/json

{
  "mood": "exhausted",
  "tasks": [
    {
      "id": "abc",
      "title": "Write chapter",
      "difficulty": "hard",
      "completed": false,
      "createdAt": 1713254400000
    }
  ]
}
```

### Response

```json
{
  "recommended": [],
  "deferred": [
    {
      "id": "abc",
      "title": "Write chapter",
      "difficulty": "hard",
      "completed": false,
      "createdAt": 1713254400000
    }
  ],
  "config": {
    "mood": "exhausted",
    "maxTasks": 3,
    "allowedDifficulty": ["easy"],
    "suggestion": "You seem tired today..."
  }
}
```

In this example the "Write chapter" task is deferred because `hard` difficulty is not allowed when the mood is `exhausted`.

---

## Evaluation metrics

The following data points are stored and used to evaluate the emotion-aware recommendation system in the dissertation evaluation phase:

| Metric | How measured | Where stored |
|---|---|---|
| Task completion rate | `completed` field on tasks | Firestore `/tasks` |
| Mood check-in consistency | Count of `/moods` documents | Firestore `/moods` |
| Tasks completed per mood | Join tasks completion date with mood date | Computed in `getDashboardStats()` |
| Check-in streak | Consecutive days with mood entry | Computed in `getDashboardStats()` |
| Most common mood | Frequency count of mood values | Computed in `getDashboardStats()` |

These metrics directly answer the dissertation research questions:

- **RQ1** — "How do emotions influence user productivity?" → answered by comparing task completion rates across mood states
- **RQ2** — "How could emotional data be used to impact task prioritisation?" → demonstrated by the recommendation algorithm
- **RQ3** — "Do emotion-aware tools improve user experience?" → answered by usability testing questionnaire results
- **RQ4** — "What usability issues occur?" → answered by usability test observations

---
*This document was created as part of the Balance dissertation project (QHO656) at Southampton Solent University, 2025 - 26.*