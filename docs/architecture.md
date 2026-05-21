# Balance App — Architecture, Components & Style Documentation

**Project:** Balance — Productivity & Wellbeing  
**Author:** Rebeca Boara  
**University:** Southampton Solent University  
**Module:** Dissertation Project 2025-2026  
**Last updated:** May 2026

---

## Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [System Architecture](#2-system-architecture)
3. [Project Folder Structure](#3-project-folder-structure)
4. [Routing & Pages](#4-routing--pages)
5. [Component Library](#5-component-library)
6. [Design System & Styles](#6-design-system--styles)
7. [Authentication Flow](#7-authentication-flow)
8. [Data Flow](#8-data-flow)
9. [Environment & Deployment](#9-environment--deployment)
10. [Accessibility](#10-accessibility)

---

## 1. Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | Next.js | 16.2 | React framework with App Router |
| Language | TypeScript | 5.x | Type safety across all files |
| UI Library | React | 19.x | Component rendering |
| Styling | Tailwind CSS | 4.x | Utility-first CSS with custom design tokens |
| Icons | Lucide React | 1.x | Consistent SVG icon library |
| Authentication | Firebase Auth | 12.x | Email/password and Google sign-in |
| Database | Firebase Firestore | 12.x | NoSQL cloud document database |
| AI | OpenAI SDK | 6.x | GPT-4o-mini for personalised daily messages |
| Deployment | Vercel | — | Serverless Next.js hosting |
| Version control | GitHub | — | Source control and progress log |
| Fonts | Google Fonts | — | DM Serif Display, DM Sans, Dancing Script |

### Why Next.js App Router?

The App Router (introduced in Next.js 13) was chosen over the older Pages Router for the following reasons:

- **Layouts** — nested layouts mean the sidebar and bottom nav are defined once and apply to all app screens automatically
- **Server components** — non-interactive parts of the UI render on the server, reducing JavaScript sent to the browser
- **File-based routing** — the folder structure IS the URL structure, making the codebase easy to navigate
- **API routes** — backend logic lives in the same project, no separate server needed. Used for the OpenAI integration to keep the API key server-side only

---

## 2. System Architecture

```
┌────────────────────────────────────────────────────────┐
│                        CLIENT                          │
│                                                        │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │  Next.js     │    │  Tailwind    │                  │
│  │  App Router  │    │  CSS 4       │                  │
│  │  (React 19)  │    │  + Lucide    │                  │
│  └──────┬───────┘    └──────────────┘                  │
│         │                                              │
│         ▼                                              │
│  ┌──────────────────────────────────────┐              │
│  │           Component Tree             │              │
│  │                                      │              │
│  │  RootLayout                          │              │
│  │    └── ThemeProvider                 │              │
│  │          ├── Landing page (public)   │              │
│  │          └── AppLayout (protected)   │              │
│  │                ├── AuthProvider      │              │
│  │                └── AppShell          │              │
│  │                      ├── Sidebar     │              │
│  │                      ├── Page        │              │
│  │                      └── BottomNav   │              │
│  └──────────────────────────────────────┘              │
└─────────────────────┬──────────────────────────────────┘
                      │  Firebase SDK + fetch (API routes)
                      ▼
┌────────────────────────────────────────────────────────┐
│              NEXT.JS API ROUTES (server-side)          │
│                                                        │
│  POST /api/ai/daily-message                            │
│   └── Authenticated via Firebase ID token             │
│       └── Calls OpenAI GPT-4o-mini                    │
│           └── Returns { spark, suggestion }           │
└─────────────────────┬──────────────────────────────────┘
                      │
                      ▼
┌────────────────────────────────────────────────────────┐
│                    FIREBASE (Google Cloud)             │
│                    Region: europe-west2 (London)       │
│                                                        │
│  ┌─────────────────┐    ┌──────────────────────────┐   │
│  │  Firebase Auth  │    │  Firestore Database      │   │
│  │                 │    │                          │   │
│  │  • Email/pass   │    │  /users/{uid}            │   │
│  │  • Google OAuth │    │  /tasks/{taskId}         │   │
│  │                 │    │  /moods/{moodId}         │   │
│  └─────────────────┘    └──────────────────────────┘   │
└────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                      VERCEL                             │
│                                                         │
│  • Serverless Next.js hosting                           │
│  • Automatic deployments from GitHub                    │
│  • Environment variables management                     │
│  • Edge network (fast globally)                         │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Project Folder Structure

```
balance-app/
│
├── app/                          # Next.js App Router — pages and API
│   ├── layout.tsx                # Root layout — fonts, ThemeProvider
│   ├── page.tsx                  # Landing page (public)
│   ├── globals.css               # Global styles, CSS variables, Tailwind
│   │
│   ├── auth/                     # Public auth routes
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   └── signup/
│   │       └── page.tsx          # Sign up page (with consent checkbox)
│   │
│   ├── app/                      # Protected app routes (require auth)
│   │   ├── layout.tsx            # App layout — AuthProvider + AppShell
│   │   ├── mood/
│   │   │   └── page.tsx          # Mood check-in screen
│   │   ├── tasks/
│   │   │   └── page.tsx          # Task list with recommendations
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Dashboard and insights
│   │   └── settings/
│   │       └── page.tsx          # User settings
│   │
│   ├── api/                      # Next.js API routes (server-side only)
│   │   └── ai/
│   │       └── daily-message/
│   │           └── route.ts      # OpenAI: generates personalised spark + suggestion
│   │
│   ├── onboarding/
│   │   └── page.tsx              # First-time user onboarding flow
│   │
│   ├── privacy/
│   │   └── page.tsx              # Privacy Policy
│   └── terms/
│       └── page.tsx              # Terms of Service
│
├── components/                   # Reusable React components
│   ├── layout/                   # Layout and navigation components
│   │   ├── AppShell.tsx          # Main layout shell (sidebar + content + bottom nav)
│   │   ├── AuthProvider.tsx      # Firebase auth state guard
│   │   ├── BottomNav.tsx         # Mobile bottom navigation bar
│   │   ├── Sidebar.tsx           # Desktop/tablet sidebar navigation
│   │   └── ThemeProvider.tsx     # Light/dark/system theme manager
│   │
│   ├── mood/                     # Mood check-in components
│   │   ├── DailySparkCard.tsx    # Daily Spark message card
│   │   ├── MoodPill.tsx          # Individual mood selector pill
│   │   └── MoodRecommendations.tsx # Mental health resource links
│   │
│   ├── tasks/                    # Task management components
│   │   ├── TaskCard.tsx          # Individual task card with actions
│   │   ├── AddTaskModal.tsx      # Modal for creating tasks
│   │   └── EditTaskModal.tsx     # Modal for editing tasks
│   │
│   ├── dashboard/                # Dashboard components
│   │   ├── StatCard.tsx          # Individual stat display card
│   │   ├── MoodChart.tsx         # 7-day mood bar chart
│   │   └── InsightCard.tsx       # Productivity insight card
│   │
│   └── ui/                       # Generic UI building blocks
│       ├── Button.tsx            # Reusable button (primary/secondary/ghost/danger)
│       ├── ConfirmDialog.tsx     # Confirmation dialog modal
│       ├── DifficultyBadge.tsx   # Easy / Medium / Hard coloured badge
│       ├── EmptyState.tsx        # Empty list state with icon and CTA
│       ├── Logo.tsx              # Balance logo component
│       ├── MoodBadge.tsx         # Mood label with emoji and colour
│       ├── Spinner.tsx           # Loading indicator (sm / md / lg)
│       ├── ThemeToggle.tsx       # Light / System / Dark toggle button
│       └── UserAvatarMenu.tsx    # User avatar dropdown menu
│
├── lib/                          # Shared utilities and services
│   ├── db.ts                     # All Firestore database operations
│   ├── firebase.ts               # Firebase client SDK initialisation
│   └── mood.ts                   # Emotion-aware recommendation logic + MOOD_CONFIG
│
├── hooks/                        # Custom React hooks
│   └── useAuth.ts                # Firebase auth state hook
│
├── types/                        # TypeScript type definitions
│   └── index.ts                  # All shared types: Task, MoodEntry, UserProfile, etc.
│
├── docs/                         # Project documentation
│   ├── requirements.md           # Functional and non-functional requirements
│   ├── mood.logic.md             # Recommendation algorithm documentation
│   ├── database.md               # Database schema and security rules
│   └── architecture.md           # This file
│
├── public/                       # Static assets
│   └── favicon.ico               # Browser tab icon
│
├── .env.local                    # Local environment variables (never committed)
├── .gitignore                    # Files excluded from Git
├── firestore.rules               # Firestore security rules reference
├── middleware.ts                 # Route protection
├── next.config.ts                # Next.js configuration
├── package.json                  # Dependencies and scripts
└── tsconfig.json                 # TypeScript configuration
```

---

## 4. Routing & Pages

Next.js App Router uses the filesystem as the router. Every `page.tsx` file inside `app/` becomes a URL route.

### Public routes (no auth required)

| URL | File | Description |
|---|---|---|
| `/` | `app/page.tsx` | Landing page |
| `/auth/login` | `app/auth/login/page.tsx` | Login screen |
| `/auth/signup` | `app/auth/signup/page.tsx` | Sign up screen (with explicit consent checkbox) |
| `/privacy` | `app/privacy/page.tsx` | Privacy Policy |
| `/terms` | `app/terms/page.tsx` | Terms of Service |

### Protected routes (auth required)

| URL | File | Description |
|---|---|---|
| `/onboarding` | `app/onboarding/page.tsx` | First-time onboarding flow |
| `/app/mood` | `app/app/mood/page.tsx` | Daily mood check-in |
| `/app/tasks` | `app/app/tasks/page.tsx` | Task list with mood recommendations |
| `/app/dashboard` | `app/app/dashboard/page.tsx` | Productivity and mood insights |
| `/app/settings` | `app/app/settings/page.tsx` | User preferences |

### API routes

| URL | File | Method | Description |
|---|---|---|---|
| `/api/ai/daily-message` | `app/api/ai/daily-message/route.ts` | `POST` | Generates personalised spark + suggestion via OpenAI GPT-4o-mini. Requires Firebase ID token in Authorization header. |

### Layouts

Next.js supports nested layouts — each layout wraps all pages in its folder:

```
app/layout.tsx          → wraps ALL pages (fonts, ThemeProvider)
app/app/layout.tsx      → wraps /app/* pages (AuthProvider, AppShell)
```

This means you only write the sidebar and bottom nav once — they automatically appear on every protected screen.

---

## 5. Component Library

### Layout components

#### `AppShell.tsx`
The main layout wrapper for all authenticated screens.

```tsx
<AppShell>
  <YourPageContent />
</AppShell>
```

- On mobile (< 768px): full-width content + fixed bottom nav
- On tablet/desktop (≥ 768px): sidebar on left, content shifted right
- Adds padding at bottom so content isn't hidden by bottom nav

#### `AuthProvider.tsx`
Protects all `/app/*` routes from unauthenticated access.

```tsx
<AuthProvider>
  <ProtectedContent />
</AuthProvider>
```

- Uses `useAuth` hook to check Firebase auth state
- Shows Balance logo + spinner while checking
- Redirects to `/auth/login` if not authenticated
- Checks `hasOnboarded` flag on user profile — redirects to `/onboarding` if false
- Renders children only when user is confirmed signed in and onboarded

#### `BottomNav.tsx`
Fixed bottom navigation bar. Mobile only (`md:hidden`).

- Four nav items: Check in, Tasks, Dashboard, Settings
- Uses `usePathname()` to highlight active route
- Lucide React icons with ARIA labels
- `aria-current="page"` on active item for screen readers

#### `Sidebar.tsx`
Left sidebar navigation. Tablet and desktop only (`hidden md:flex`).

- Balance logo at top
- Four nav items with active left border indicator
- Sign out button with confirmation dialog
- Theme toggle (Light/System/Dark)

#### `ThemeProvider.tsx`
Manages light/dark/system theme for the entire app.

- Reads saved preference from `localStorage` on mount
- Applies `dark` class to `<html>` element
- Listens to `prefers-color-scheme` media query for system preference
- Exposes `{ theme, setTheme, isDark }` via React context

### UI components

#### `Button.tsx`

```tsx
<Button variant="primary" size="md">Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="ghost">Skip</Button>
<Button variant="danger">Delete</Button>
<Button href="/app/tasks">Link button</Button>
```

Five variants: `primary` (sage green), `secondary` (outlined), `ghost` (transparent), `danger` (red filled), `outlineDanger` (red outlined). Two sizes: `sm` and `md`. Supports `href` to render as a Next.js `<Link>`.

#### `DifficultyBadge.tsx`

```tsx
<DifficultyBadge difficulty="easy" />
<DifficultyBadge difficulty="medium" />
<DifficultyBadge difficulty="hard" />
```

Coloured pill badge showing task difficulty: Easy → sage green, Medium → amber, Hard → coral/red.

#### `MoodBadge.tsx`

```tsx
<MoodBadge mood="exhausted" />
<MoodBadge mood="good" />
```

Coloured pill showing current mood with emoji. Five variants matching the five mood states.

#### `Spinner.tsx`

```tsx
<Spinner size="sm" />   // 16px — inside buttons
<Spinner size="md" />   // 24px — full page loading
<Spinner size="lg" />   // 32px — section loading
```

Accessible loading indicator with `role="status"` and `aria-label="Loading"`.

#### `EmptyState.tsx`

Used when a list has no items — tasks screen when no tasks exist, dashboard on first use.

#### `ConfirmDialog.tsx`

Modal dialog for destructive actions (sign out, task deletion). Renders with a message and two buttons: confirm and cancel.

#### `UserAvatarMenu.tsx`

Avatar button showing the user's initial. Appears in the mood check-in header on mobile (the sidebar handles this on desktop).

---

## 6. Design System & Styles

### Fonts

| Font | Weight | Usage |
|---|---|---|
| Dancing Script | 700 | Logo wordmark only (`font-script`) |
| DM Serif Display | 400 | Page headings and hero text only (`font-serif`) — not italic in body content |
| DM Sans | 300, 400, 500, 600 | All body text, labels, UI, navigation (`font-sans`) |

Loaded from Google Fonts in `app/layout.tsx`. The anti-flash script in `<head>` ensures the correct theme is applied before fonts load.

**Typography scale:** All visible body text uses `text-sm` (14px) as the minimum. `text-xs` (12px) is reserved for non-content elements such as difficulty badge pills. Arbitrary pixel sizes (`text-[10px]`, `text-[0.95rem]`) are not used — only Tailwind's standard scale.

### Colour system

#### Light theme

| Token | Hex | Tailwind class | Usage |
|---|---|---|---|
| Page background | `#F5F0E8` | `bg-warm-100` | Page backgrounds |
| Surface | `#EDE6D6` | `bg-warm-200` | Sections, secondary surfaces |
| Card | `#FFFFFF` | `bg-white` | Cards, inputs, modals |
| Primary sage | `#5C7A6A` | `bg-sage-500` | Buttons, active states, accents |
| Primary dark | `#3D5248` | `bg-sage-700` | Hover states, dark accents |
| Primary light | `#8FAF9F` | `bg-sage-300` | Subtle fills, borders |
| Primary pale | `#E8F0EC` | `bg-sage-50` | Hover backgrounds, badges |
| Text primary | `#1E2822` | `text-sage-900` | Main body text |
| Text muted | `#6B7D74` | `text-sage-500` | Labels, descriptions |
| Amber | `#D4924A` | `text-amber-app` | Medium difficulty, warnings |
| Coral | `#C5614A` | `text-coral-app` | Hard difficulty, errors |
| Border | `rgba(92,122,106,0.15)` | `border-sage-100` | Subtle borders |

#### Dark theme

| Token | Hex | Tailwind class | Usage |
|---|---|---|---|
| Page background | `#0F1419` | `dark:bg-ocean-900` | Page backgrounds |
| Surface | `#161E26` | `dark:bg-ocean-800` | Secondary surfaces |
| Card | `#1E2A35` | `dark:bg-ocean-700` | Cards, inputs |
| Primary teal | `#4ECBA3` | `dark:text-teal-400` | Accents, active states |
| Sky blue | `#6BAED6` | `dark:text-teal-300` | Secondary accents |
| Text primary | `#E8EFF5` | `dark:text-white` | Main body text |
| Text muted | `#7A9BB5` | `dark:text-ocean-300` | Labels, descriptions |
| Border | `rgba(78,203,163,0.12)` | `dark:border-ocean-600` | Subtle borders |

### CSS variables

Defined in `app/globals.css` using Tailwind 4's `@theme` block. Override in `.dark` selector for dark mode.

### Spacing scale

| Value | px | Usage |
|---|---|---|
| 1 | 4px | Tight gaps between inline elements |
| 2 | 8px | Gap between icon and label |
| 3 | 12px | Internal component padding |
| 4 | 16px | Standard padding |
| 5 | 20px | Section gaps |
| 6 | 24px | Page horizontal padding |
| 8 | 32px | Large section gaps |
| 10 | 40px | Section top padding |

### Border radius

| Token | Value | Usage |
|---|---|---|
| `rounded-sm` | 8px | Small elements (badges, inputs) |
| `rounded-md` | 12px | Buttons, small cards |
| `rounded-lg` | 16px | Cards, main containers |
| `rounded-xl` | 20px | Hero sections |
| `rounded-full` | 999px | Pill badges, avatars |

### Shadows

| Token | Value | Usage |
|---|---|---|
| `shadow-card` | `0 2px 8px rgba(30,40,34,0.06)` | Default card shadow |
| `shadow-raised` | `0 4px 24px rgba(30,40,34,0.08)` | Elevated cards |
| `shadow-lifted` | `0 8px 32px rgba(30,40,34,0.12)` | Modals, dropdowns |

### Utility component classes

Defined in `app/globals.css` under `@layer components`:

```css
.card          /* White card with border and shadow */
.input         /* Form input with focus state */
.label         /* Form label — text-sm, muted colour */
```

### Animations

| Name | Duration | Usage |
|---|---|---|
| `animate-fade-in` | 250ms | Page sections, banners appearing |
| `animate-slide-up` | 300ms | Modals, bottom sheets |
| `animate-spin` | 1s linear | Loading spinners |
| `animate-pulse-soft` | 2s | Subtle pulsing elements |

All animations respect `prefers-reduced-motion` — users who have enabled reduced motion in their OS settings will not see animations.

### Responsive breakpoints

| Prefix | Min-width | Layout change |
|---|---|---|
| (default) | 0px | Mobile: full-width, bottom nav |
| `md:` | 768px | Tablet: sidebar appears, bottom nav hidden |
| `lg:` | 1024px | Desktop: wider sidebar, max-width content |

---

## 7. Authentication Flow

```
User visits /auth/signup
        │
        ▼
User fills email, password, ticks consent checkbox
        │
        ▼
Client validates: 8+ chars, uppercase, number, symbol (mirrors Firebase policy)
        │
        ▼
createUserWithEmailAndPassword() called
        │
        ├── auth/email-already-in-use → friendly error shown
        ├── auth/password-does-not-meet-requirements → friendly error shown
        │
        └── Success → createUserProfile() creates /users/{uid}
                │
                └── router.push('/onboarding')

---

User visits /app/*
        │
        ▼
AuthProvider checks onAuthStateChanged
        │
        ├── Loading → show spinner
        │
        ├── Not signed in → redirect to /auth/login
        │
        └── Signed in → check hasOnboarded flag
                │
                ├── hasOnboarded === false → redirect to /onboarding
                │
                └── hasOnboarded === true → render page
```

### Google sign-in error handling

`auth/cancelled-popup-request` and `auth/popup-closed-by-user` are silently swallowed — these occur when the user opens the Google popup twice or closes it before completing sign-in, and are not errors from the user's perspective.

### Sign out flow

```
User clicks Sign out (Sidebar or Settings)
        │
        ▼
ConfirmDialog prompts for confirmation
        │
        ▼
signOut(auth) — Firebase clears auth state
        │
        ▼
onAuthStateChanged fires with null user
        │
        ▼
AuthProvider detects no user → redirects to /auth/login
```

---

## 8. Data Flow

### Mood check-in → AI generation → task recommendations

```
User selects mood on /app/mood
        │
        ├── fetchAiForMood(mood) — POST /api/ai/daily-message
        │       │
        │       ├── Server verifies Firebase ID token
        │       ├── Calls OpenAI GPT-4o-mini
        │       └── Returns { spark?, suggestion? }
        │               │
        │               └── Cached in React useRef<Map> for session
        │
        ▼
User clicks "See my recommended tasks"
        │
        ▼
saveMoodEntry(userId, mood, note, aiSpark, aiSuggestion)
        → writes to Firestore /moods (with AI content if available)
        │
        ▼
router.push('/app/tasks')
        │
        ▼
/app/tasks loads
        │
        ├── getTodaysMood(userId) → reads mood from /moods
        │
        └── getTasks(userId) → reads all tasks from /tasks
                │
                ▼
        getRecommendedTasks(mood, tasks) — lib/mood.ts
                │
                ├── Exhausted / Stressed:
                │     mustDo  = high-priority OR overdue tasks (any difficulty)
                │     easy    = easy tasks not in mustDo
                │     deferred = everything else
                │     sorted by priority then creation date
                │
                ├── Neutral:
                │     allowed  = easy + medium tasks
                │     deferred = hard tasks
                │
                └── Good / Energised:
                      sorted = all tasks, by priority → difficulty → creation date
                      deferred = []
                        │
                        ▼
                Task list renders two sections:
                "Recommended" and "Saved for later"
```

### Mood to difficulty mapping

| Mood | Recommended | Deferred | Sort order |
|---|---|---|---|
| Exhausted | High-priority + overdue (any difficulty), then easy tasks | Medium/hard without urgency | Priority → creation date |
| Stressed | High-priority + overdue (any difficulty), then easy tasks | Medium/hard without urgency | Priority → creation date |
| Neutral | Easy + medium tasks | Hard tasks only | Creation date |
| Good | All tasks | None | Priority → difficulty (hard first) → creation date |
| Energised | All tasks | None | Priority → difficulty (hard first) → creation date |

---

## 9. Environment & Deployment

### Local development

```bash
npm run dev        # Start development server at localhost:3000
npm run build      # Build production bundle
npm run start      # Start production server locally
npm run lint       # Run ESLint
```

### Deployment pipeline

```
Developer pushes to GitHub (main branch)
        │
        ▼
Vercel detects push → triggers automatic build
        │
        ▼
Next.js build runs (npm run build)
        │
        ▼
Vercel deploys to edge network
        │
        ▼
Live at: https://balance-app.vercel.app
```

### Environment variables

Set in `.env.local` for local development and in Vercel dashboard for production:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
OPENAI_API_KEY          ← server-side only, never exposed to client
```

See `.env.local.example` for the full list of required variables.

---

## 10. Accessibility

Balance is designed to meet **WCAG 2.1 Level AA** standards. The following measures have been implemented:

### Colour contrast
All text colour combinations meet the minimum 4.5:1 contrast ratio for normal text and 3:1 for large text. Verified using the WebAIM Contrast Checker.

| Combination | Ratio | Result |
|---|---|---|
| `#1E2822` on `#FFFFFF` | 16.1:1 | ✓ AAA |
| `#1E2822` on `#F5F0E8` | 13.4:1 | ✓ AAA |
| `#FFFFFF` on `#5C7A6A` | 4.8:1 | ✓ AA |
| `#E8EFF5` on `#1E2A35` | 11.2:1 | ✓ AAA |
| `#4ECBA3` on `#0F1419` | 5.8:1 | ✓ AA |

### Keyboard navigation
- All interactive elements are reachable by `Tab` key
- Focus ring: `2px solid var(--sage)` with `2px offset` on all focusable elements
- Logical tab order follows visual layout

### Screen reader support
- All navigation items have `aria-label` attributes
- Active nav items have `aria-current="page"`
- Icons have `aria-hidden="true"` so they are not announced
- Spinner has `role="status"` and `aria-label="Loading"`
- Form inputs have associated `<label>` elements
- Mood pills have `aria-pressed` for toggle state
- Error messages are associated with their inputs

### Touch targets
All interactive elements have a minimum touch target size of 44×44px as recommended by WCAG 2.5.5.

### Reduced motion
All CSS animations are wrapped in:
```css
@media (prefers-reduced-motion: no-preference) {
  /* animation here */
}
```

### Semantic HTML
- Page navigation uses `<nav>` with `aria-label`
- Sidebar uses `<aside>` with `aria-label`
- Page content uses `<main>`
- Form elements use `<form>`, `<label>`, `<input>`
- Headings follow a logical hierarchy (h1 → h2 → h3)

---

## Revision history

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | April 2026 | Rebeca Boara | Initial version |
| 1.1 | May 2026 | Rebeca Boara | Updated tech stack versions (Next.js 16.2, React 19, Tailwind 4, Firebase 12); added OpenAI SDK row; replaced `/api/recommendations` with `/api/ai/daily-message`; updated folder structure; updated auth flow (consent checkbox, hasOnboarded redirect, Google popup error handling); updated data flow diagram (priority-based algorithm, no maxTasks caps, AI integration); updated mood-to-difficulty mapping table; updated font usage notes (no serif italic in body); updated typography notes (text-sm minimum for body) |

---

*This document was created as part of the dissertation project at Solent University, 2025–2026.*
