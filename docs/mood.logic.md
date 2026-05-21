# Balance App — Mood Logic & API Documentation

**Project:** Balance — Productivity & Wellbeing  
**Author:** Rebeca Boara  
**University:** Southampton Solent University  
**Module:** QHO656 Dissertation Project 2025-26  
**Last updated:** May 2026

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

**Algorithm — three mood tiers:**

#### Tier 1: Exhausted / Stressed

For low-energy moods the algorithm uses a two-bucket approach:

1. **Must-do bucket** — any task that is high-priority (`priority === 'high'`) or overdue/due today. These surface regardless of difficulty because they cannot be ignored.
2. **Easy bucket** — easy tasks not already in the must-do bucket. Surfaced second.
3. **Deferred** — all remaining tasks (medium/hard tasks without high priority or urgency).

Both buckets are sorted by priority (high → medium → low) then by creation date (oldest first).

#### Tier 2: Neutral

Easy and medium tasks are shown in the recommended list, sorted by creation date. Hard tasks are deferred. No artificial cap on task count.

#### Tier 3: Good / Energised

All tasks are recommended. Sorted first by priority (high → medium → low), then by difficulty (hard → medium → easy), then by creation date. No tasks are deferred — the user is at full capacity.

### Task Priority field

Each task now has an optional `priority` field (`'high' | 'medium' | 'low'`). When not set, it defaults to `'medium'` inside the algorithm. Priority interacts with difficulty in the recommendation engine to produce a more nuanced ordering that respects urgency.

### Mood configuration: `MOOD_CONFIG`

Each mood has a configuration object:

```typescript
interface MoodRecommendation {
  mood:            MoodType
  emoji:           string
  label:           string
  colour:          string
  suggestion:      string       // shown on mood check-in screen (Balance suggests banner)
  breakSuggestion: string       // break advice woven into AI suggestion fallback
  sparkMessage:    string       // shown on mood check-in as daily spark fallback
}
```

Note: `maxTasks` (task cap) and `allowedDifficulty` (difficulty whitelist) were removed from this interface. The algorithm now uses priority and urgency to surface appropriate tasks rather than hard limits.

### Mood to task mapping

| Mood | Recommended tasks | Deferred tasks | Rationale |
|---|---|---|---|
| Exhausted | High-priority + overdue (any difficulty), then easy tasks | Medium/hard tasks without urgency | Protects wellbeing while ensuring critical items are not missed |
| Stressed | High-priority + overdue (any difficulty), then easy tasks | Medium/hard tasks without urgency | Reduces cognitive load while surfacing urgent items |
| Neutral | Easy + medium tasks | Hard tasks only | Balanced workload for a steady day |
| Good | All tasks (sorted: high-priority and hard first) | None | Full task access, best items surfaced first |
| Energised | All tasks (sorted: high-priority and hard first) | None | Leverage peak performance — hardest and most important work first |

---

## Daily Spark Messages

Each mood state has multiple rotating motivational messages shown on the check-in screen (as a fallback when AI generation is unavailable):

```typescript
export const SPARK_MESSAGES: Record<MoodType, string[]> = {
  exhausted: [
    "Rest is not giving up — it's part of the process.",
    "Even small steps forward count. Be kind to yourself today.",
    "Focus on just 3 easy wins today. You've got this.",
    // ... more messages
  ],
  // ... other moods
}
```

A general spark pool (`GENERAL_SPARKS`) is also used when no mood has been selected yet — shown on the check-in screen before the user picks a mood.

Messages rotate daily based on the day of the year (`Math.floor(Date.now() / 86400000) % messages.length`), so they feel fresh without requiring database storage.

**Design rationale:** Research by Norman (2005) supports the use of motivational feedback to maintain user engagement and positive affect. The tone of each message is calibrated to the mood — validating and gentle for low moods, energising and ambitious for high moods.

---

## AI-Enhanced Suggestions

Balance uses OpenAI (GPT-4o-mini) to generate personalised daily spark messages and mood-specific suggestions via the `/api/ai/daily-message` API route.

### `/api/ai/daily-message`

```http
POST /api/ai/daily-message
Authorization: Bearer {firebaseIdToken}
Content-Type: application/json

{
  "mood": "exhausted"
}
```

**Response:**

```json
{
  "spark": "One step at a time is still forward. You've got this.",
  "suggestion": "You're doing enough. Start with one small task to build momentum — even one thing crossed off makes the day count. Try 15 minutes on, 10 minutes off to protect your energy."
}
```

- `mood` can be any of the five mood types, or `"general"` (pre-mood-selection).
- The API is authenticated using Firebase ID tokens — unauthenticated requests are rejected.
- Responses are cached in the React component (`useRef<Map>`) for the session to avoid redundant API calls.
- When AI generation succeeds, the `aiSpark` and `aiSuggestion` values are persisted to Firestore alongside the mood entry so returning users see their personalised content immediately.
- If AI generation fails, static fallbacks from `MOOD_CONFIG` are used instead — the UI degrades gracefully.

The system prompt instructs the model to produce 2–3 short, warm sentences (not clinical, not generic), with a concrete break tip woven into the last sentence.

---

## Task Difficulty System

Tasks are assigned one of three difficulty levels when created:

| Difficulty | Estimated time | Cognitive demand | Example |
|---|---|---|---|
| Easy | < 20 minutes | Low | Reply to emails, review notes |
| Medium | 20–60 minutes | Moderate | Write a report section, implement a feature |
| Hard | > 60 minutes | High | Full dissertation chapter, complex development |

Difficulty is set by the user when creating a task. The recommendation engine uses difficulty as one signal — alongside priority and due date — to order and filter tasks.

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
- **RQ2** — "How could emotional data be used to impact task prioritisation?" → demonstrated by the priority + urgency + mood recommendation algorithm
- **RQ3** — "Do emotion-aware tools improve user experience?" → answered by usability testing questionnaire results
- **RQ4** — "What usability issues occur?" → answered by usability test observations

---
*This document was created as part of the Balance dissertation project (QHO656) at Southampton Solent University, 2025–26.*
