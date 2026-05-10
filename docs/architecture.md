# Balance App — Architecture, Components & Style Documentation

**Project:** Balance — Productivity & Wellbeing  
**Author:** Rebeca Boara  
**University:** Southampton Solent University  
**Module:** QHO656 Dissertation Project 2025-26  
**Last updated:** April 2026

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
| Framework | Next.js | 14.2 | React framework with App Router |
| Language | TypeScript | 5.x | Type safety across all files |
| Styling | Tailwind CSS | 3.4 | Utility-first CSS with custom design tokens |
| Icons | Lucide React | Latest | Consistent SVG icon library |
| Authentication | Firebase Auth | 10.x | Email/password and Google sign-in |
| Database | Firebase Firestore | 10.x | NoSQL cloud document database |
| Deployment | Vercel | — | Serverless Next.js hosting |
| Version control | GitHub | — | Source control and progress log |
| Fonts | Google Fonts | — | DM Serif Display, DM Sans, Dancing Script |

### Why Next.js 14 App Router?

The App Router (introduced in Next.js 13) was chosen over the older Pages Router for the following reasons:

- **Layouts** — nested layouts mean the sidebar and bottom nav are defined once and apply to all app screens automatically
- **Server components** — non-interactive parts of the UI render on the server, reducing JavaScript sent to the browser
- **File-based routing** — the folder structure IS the URL structure, making the codebase easy to navigate
- **API routes** — backend logic lives in the same project, no separate server needed

---

## 2. System Architecture

```
┌────────────────────────────────────────────────────────┐
│                        CLIENT                          │
│                                                        │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │  Next.js     │    │  Tailwind    │                  │
│  │  App Router  │    │  CSS         │                  │
│  │  (React)     │    │  + Lucide    │                  │
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
                      │  Firebase SDK
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
│   │       └── page.tsx          # Sign up page
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
│   ├── api/                      # Next.js API routes (server-side)
│   │   └── recommendations/
│   │       └── route.ts          # Mood-based task recommendation API
│   │
│   └── privacy/                  # Public legal pages
│       └── page.tsx              # Privacy Policy
│   terms/
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
│   └── ui/                       # Generic UI building blocks
│       ├── DifficultyBadge.tsx   # Easy / Medium / Hard coloured badge
│       ├── EmptyState.tsx        # Empty list state with icon and CTA
│       ├── MoodBadge.tsx         # Mood label with emoji and colour
│       ├── PageHeader.tsx        # Consistent page title + subtitle + action
│       ├── Spinner.tsx           # Loading indicator (sm / md / lg)
│       ├── ThemeToggle.tsx       # Light / System / Dark toggle button
│       └── TaskCard.tsx          # Individual task card (coming soon)
│
├── lib/                          # Shared utilities and services
│   ├── db.ts                     # All Firestore database operations
│   ├── firebase.ts               # Firebase client SDK initialisation
│   └── mood.ts                   # Emotion-aware recommendation logic
│
├── hooks/                        # Custom React hooks
│   └── useAuth.ts                # Firebase auth state hook
│
├── types/                        # TypeScript type definitions
│   └── index.ts                  # All shared types: Task, MoodEntry, etc.
│
├── docs/                         # Project documentation
│   ├── DATABASE.md               # Database schema and security rules
│   └── ARCHITECTURE.md           # This file
│
├── public/                       # Static assets
│   ├── favicon.ico               # Browser tab icon
│   └── logo.svg                  # Balance logo SVG
│
├── .env.local                    # Local environment variables (never committed)
├── .env.local.example            # Template showing required variables
├── .gitignore                    # Files excluded from Git
├── firestore.rules               # Firestore security rules reference
├── middleware.ts                 # Route protection (currently minimal)
├── next.config.js                # Next.js configuration
├── package.json                  # Dependencies and scripts
├── postcss.config.js             # PostCSS for Tailwind
├── tailwind.config.js            # Tailwind with custom design tokens
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
| `/auth/signup` | `app/auth/signup/page.tsx` | Sign up screen |
| `/privacy` | `app/privacy/page.tsx` | Privacy Policy |
| `/terms` | `app/terms/page.tsx` | Terms of Service |

### Protected routes (auth required)

| URL | File | Description |
|---|---|---|
| `/app/mood` | `app/app/mood/page.tsx` | Daily mood check-in |
| `/app/tasks` | `app/app/tasks/page.tsx` | Task list with mood recommendations |
| `/app/dashboard` | `app/app/dashboard/page.tsx` | Productivity and mood insights |
| `/app/settings` | `app/app/settings/page.tsx` | User preferences |

### API routes

| URL | File | Method | Description |
|---|---|---|---|
| `/api/recommendations` | `app/api/recommendations/route.ts` | `POST` | Returns mood-filtered task recommendations |

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
- Adds `pb-20` padding at bottom so content isn't hidden by bottom nav

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
- Renders children only when user is confirmed signed in

#### `BottomNav.tsx`
Fixed bottom navigation bar. Mobile only (`md:hidden`).

- Four nav items: Check in, Tasks, Dashboard, Settings
- Uses `usePathname()` to highlight active route
- Lucide React icons with ARIA labels
- `aria-current="page"` on active item for screen readers

#### `Sidebar.tsx`
Left sidebar navigation. Tablet and desktop only (`hidden md:flex`).

- Balance logo and tagline at top
- Four nav items with description text and active left border
- User profile (avatar, name, email) at bottom
- Theme toggle (Light/System/Dark)
- Sign out button with `signOut()` from Firebase Auth

#### `ThemeProvider.tsx`
Manages light/dark/system theme for the entire app.

- Reads saved preference from `localStorage` on mount
- Applies `dark` class to `<html>` element
- Listens to `prefers-color-scheme` media query for system preference
- Exposes `{ theme, setTheme, isDark }` via React context

### UI components

#### `DifficultyBadge.tsx`

```tsx
<DifficultyBadge difficulty="easy" />
<DifficultyBadge difficulty="medium" />
<DifficultyBadge difficulty="hard" />
```

Coloured pill badge showing task difficulty:
- Easy → sage green
- Medium → amber
- Hard → coral/red

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

```tsx
<EmptyState
  icon="✦"
  title="No tasks yet"
  description="Add your first task to get started."
  action={<button>Add task</button>}
/>
```

Used when a list has no items — tasks screen when no tasks exist, dashboard on first use.

#### `PageHeader.tsx`

```tsx
<PageHeader
  title="Your tasks"
  subtitle="Thursday 9 April"
  action={<button>+ Add task</button>}
/>
```

Consistent page heading with optional subtitle and right-aligned action button. Handles responsive padding automatically.

#### `ThemeToggle.tsx`

```tsx
<ThemeToggle />
```

Three-button toggle (Light / System / Dark) using Lucide icons. Calls `setTheme` from `ThemeProvider` context.

---

## 6. Design System & Styles

### Fonts

| Font | Weight | Usage |
|---|---|---|
| Dancing Script | 700 | Logo wordmark only (`font-script`) |
| DM Serif Display | 400, italic | Page headings, hero text, large numbers (`font-serif`) |
| DM Sans | 300, 400, 500, 600 | All body text, labels, UI (`font-sans`) |

Loaded from Google Fonts in `app/layout.tsx`. The anti-flash script in `<head>` ensures the correct theme is applied before fonts load.

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

Defined in `app/globals.css`. Override in `.dark` selector for dark mode:

```css
:root {
  --sage:   #5C7A6A;
  --ink:    #1E2822;
  --card:   #FFFFFF;
  --bg:     #F5F0E8;
  --muted:  #6B7D74;
  --border: rgba(92, 122, 106, 0.15);
}

.dark {
  --sage:   #4ECBA3;
  --ink:    #E8EFF5;
  --card:   #1E2A35;
  --bg:     #0F1419;
  --muted:  #7A9BB5;
  --border: rgba(78, 203, 163, 0.12);
}
```

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
.btn-primary   /* Sage green filled button */
.btn-ghost     /* Transparent outlined button */
.card          /* White card with border and shadow */
.input         /* Form input with focus state */
.label         /* Form label — uppercase, spaced */
.section-title /* DM Serif Display heading */
.mood-pill     /* Mood selector pill */
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
User visits /app/*
        │
        ▼
AuthProvider checks onAuthStateChanged
        │
        ├── Loading → show spinner
        │
        ├── Not signed in → redirect to /auth/login
        │
        └── Signed in → render page
                │
                ▼
        User signs in (/auth/login or /auth/signup)
                │
                ├── Firebase Auth verifies credentials
                │
                ├── createUserProfile() called
                │   └── Creates /users/{uid} if first time
                │
                └── router.push('/app/mood')
```

### Sign out flow

```
User clicks Sign out (Sidebar)
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

### Mood check-in → task recommendations

```
User selects mood on /app/mood
        │
        ▼
saveMoodEntry(userId, mood, note) → writes to Firestore /moods
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
                ├── Filters tasks by allowed difficulty for mood
                │
                ├── Sorts: easy first, then by creation date
                │
                ├── Caps recommended list at maxTasks for mood
                │
                └── Returns { recommended[], deferred[] }
                        │
                        ▼
                Task list renders two sections:
                "Recommended first" and "Saved for later"
```

### Mood to difficulty mapping

| Mood | Allowed difficulties | Max tasks | Rationale |
|---|---|---|---|
| Exhausted | Easy only | 3 | Protect wellbeing, prevent overwhelm |
| Stressed | Easy only | 4 | Reduce cognitive load |
| Neutral | Easy, Medium | 5 | Balanced workload |
| Good | Easy, Medium, Hard | 6 | Full task access |
| Energised | Easy, Medium, Hard | 8 | Leverage peak performance |

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

Set in `.env.local` for local development and in Vercel dashboard for production.

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

*This document was created as part of the dissertation project (QHO656) at Solent University, 2025–26.*