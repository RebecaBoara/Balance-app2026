# Balance — Productivity & Wellbeing

An emotion-aware task management web application that recommends tasks based on the user's daily mood.

**Built for:** QHO656 Dissertation Project — Southampton Solent University 2025 - 26  
**Student:** Rebeca Boara  
**Supervisor:** Chathurika Goonawardane

---

## What is Balance?

Balance is a web-based productivity planner that integrates emotional awareness into task management. Instead of presenting a static to-do list, Balance asks how you are feeling each morning and recommends tasks suited to your current emotional state.

- Feeling **exhausted**? Balance shows only easy, short tasks and suggests regular breaks.
- Feeling **energised**? Balance surfaces your hardest and most ambitious tasks first.

This approach is grounded in affective computing research demonstrating that emotional state significantly influences cognitive performance and productivity.

---

## Live app

🌐 [balance-app.vercel.app](https://balance-app.vercel.app)

---

## Tech stack

- **Next.js 16.2.3** (App Router) — React framework
- **TypeScript** — type safety
- **Tailwind CSS** — styling with custom design tokens
- **Firebase Auth** — authentication (email + Google)
- **Firebase Firestore** — database
- **Lucide React** — icons
- **Vercel** — deployment

---

## Getting started (local development)

### Prerequisites
- Node.js 18+ 
- npm 9+
- A Firebase project (see setup below)

### 1. Clone the repository
```bash
git clone https://github.com/YOURUSERNAME/balance-app.git
cd balance-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Firebase
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project named `balance-app`
3. Enable **Authentication** (Email/Password + Google)
4. Create a **Firestore Database** (europe-west2 region)
5. Copy your Firebase config from Project Settings

### 4. Configure environment variables
```bash
cp .env.local.example .env.local
```
Open `.env.local` and paste your Firebase config values.

### 5. Set up Firestore rules and indexes
- Copy rules from `firestore.rules` → paste into Firebase Console → Firestore → Rules
- Create the required indexes (see `docs/database.md`)

### 6. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## Project structure

```
balance-app/
├── app/              # Pages and API routes (Next.js App Router)
├── components/       # Reusable React components
│   ├── layout/       # Navigation, auth, theme
│   └── ui/           # Buttons, badges, spinners
├── lib/              # Firebase, database, mood logic
├── hooks/            # Custom React hooks
├── types/            # TypeScript types
└── docs/             # Project documentation
```

See `docs/architecture.md` for full details.

---

## Documentation

| Document | Description |
|---|---|
| [`docs/database.md`](docs/database.md) | Database schema, security rules, GDPR compliance |
| [`docs/architecture.md`](docs/architecture.md) | System architecture, components, design system |
| [`docs/mood.logic.md`](docs/mood.logic.md) | Emotion-aware recommendation algorithm |

---

## Screens

| Screen | Route | Description |
|---|---|---|
| Landing page | `/` | Public marketing page |
| Login | `/auth/login` | Email and Google sign-in |
| Sign up | `/auth/signup` | Account creation |
| Mood check-in | `/app/mood` | Daily emotional state selection |
| Task list | `/app/tasks` | Mood-filtered task recommendations |
| Dashboard | `/app/dashboard` | Productivity and mood insights |
| Settings | `/app/settings` | User preferences and theme |

---

## Research context

This application was developed as the primary artefact for a dissertation investigating:

> *"The Role of Emotion-Aware Task Recommendations in Enhancing Digital Productivity and Mental Health"*

The project applies a **Design Science Research** methodology, building and evaluating a technological artefact to address a specific problem: the absence of emotional context in conventional productivity tools.

**Research questions addressed:**
1. How do emotions influence user productivity during interactions with digital task management systems?
2. How could emotional data input be used in a task management application to impact job prioritising?
3. Do emotion-aware productivity systems improve user experience compared to traditional task management?
4. What usability issues occur when designing emotion-aware productivity systems?

---



## Ethical clearance

This project has received ethical clearance through the Southampton Solent University Ethics Application System. All participant data is handled in accordance with GDPR principles. See `docs/database.md` for data handling details.

---

## Licence

This project was created for academic purposes as part of QHO656 at Southampton Solent University. All rights reserved © 2026 Rebeca Boara.