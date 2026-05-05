# LifeTracker

A personal daily tracking app built with React (Vite) + Firebase Firestore. Track your morning routine, study progress, and sleep quality — all in one clean dashboard.

## Features

- **Dashboard** — Today's overview: routine quick-check, study tasks, sleep summary, and quick stats
- **Routine** — Fixed + flexible daily checklist with completion score and 30-day history heatmap
- **Study** — Task manager with tomorrow planning + course topic log with search, tags, and expandable notes
- **Sleep** — Sleep logger with target comparison, 7-night color-coded history, and settings
- **Progress** — Daily / Weekly / Monthly views with bar charts, heatmaps, streaks, and averages

## Stack

| Layer | Technology |
|-------|------------|
| UI | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| Database | Firebase Firestore |
| Routing | React Router v7 |
| Charts | Recharts |
| Icons | Lucide React |
| Dates | date-fns |

## Setup

### 1. Clone and install

```bash
cd lifetracker
npm install
```

### 2. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. Add a **Web app** to the project
4. Enable **Firestore Database** (start in test mode for development)
5. Copy your Firebase config

### 3. Add your Firebase config

Open `src/services/firebase.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 5. Deploy to Firebase Hosting (optional)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## Project Structure

```
src/
├── components/
│   ├── ui/          # Button, Card, Input, Checkbox, Rating, ProgressBar, Badge, Modal, Tabs, Spinner
│   ├── layout/      # Sidebar, MobileNav, PageWrapper
│   ├── routine/     # RoutineItem, RoutineScore
│   ├── study/       # StudyTaskItem, TopicCard, TopicForm
│   ├── sleep/       # SleepLogForm, SleepCard
│   └── progress/    # StatCard, WeeklyChart, MonthlyChart, StreakWidget
├── pages/           # DashboardPage, RoutinePage, StudyPage, SleepPage, ProgressPage
├── services/        # firebase.js, routineService.js, studyService.js, sleepService.js
├── hooks/           # useRoutine, useStudy, useSleep, useProgress
├── utils/           # dateUtils, statsUtils, timeUtils
├── constants/       # routes.js, collections.js, defaults.js
├── locales/         # en.js — all UI text strings
└── theme/           # tokens.js — design tokens
```

## Customizing your fixed routine items

Edit `src/constants/defaults.js` → `FIXED_ROUTINE_ITEMS` to set your default daily routine. These are also stored in Firestore `settings/user` after first save.

## Firestore collections

| Collection | Description |
|------------|-------------|
| `routineDays` | Daily routine docs keyed by `YYYY-MM-DD` |
| `studyTopics` | Logged study topics |
| `studyTasks` | Scheduled study tasks |
| `sleepLogs` | Nightly sleep logs keyed by `YYYY-MM-DD` |
| `settings` | User settings (doc ID: `user`) |
