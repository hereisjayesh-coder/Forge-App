# FORGE

FORGE is a gamified habit-tracking web app designed to help people build discipline, stay consistent, and turn daily routines into a rewarding experience. It combines habit logging, streaks, XP progression, reflection, analytics, and reminder notifications into one polished product.

## Overview

This project is a React + Vite frontend backed by Firebase for authentication, storage, and cloud messaging. It is built around the idea of turning personal growth into a game-like journey where users earn XP, unlock ranks, complete challenges, and track their progress over time.

## What the app does

Users can:
- create and manage habits with daily or weekly schedules
- log progress for checkbox, duration, exercise, quantity, and journal-based habits
- earn XP, build streaks, and unlock higher ranks
- participate in forge-style challenge modes
- write journal entries and reflect on progress
- view charts and heatmaps for analytics
- see a public leaderboard of other users
- receive reminders and notification-based motivation

## Key features

- Habit management with custom icons, colors, categories, and targets
- Progress tracking with streak calculations and completion rates
- XP and rank progression with milestone rewards
- Daily challenges and achievement-style toasts
- Forge Mode for focused challenge periods
- Journal section with prompts and mood tracking
- Analytics dashboard with charts and contribution heatmaps
- Leaderboard powered by Firestore data
- Browser and server-based reminder notifications

## Tech stack

### Frontend
- React 19
- Vite
- React Router
- Recharts for analytics charts
- Lucide React for icons
- CSS for component styling

### Backend and services
- Firebase Authentication
- Firestore Database
- Firebase Cloud Messaging
- Node.js + Express for notification server support
- node-cron for scheduled reminders

## Project structure

- src/ — main React application
  - components/ — reusable UI and services
  - context/ — app and auth state providers
  - pages/ — dashboard, habits, analytics, journal, leaderboard, onboarding, and profile views
  - utils/ — progression, streak, challenge, and rank logic
- public/ — static assets, manifest, and service worker files
- server/ — optional notification server for scheduled push messaging

## How it works

1. A user signs in through Firebase authentication.
2. The app loads their habits, completions, journal entries, and settings through the shared app context.
3. Daily actions such as completing habits or journal entries update XP and streak data.
4. Analytics pages convert that data into visual progress reports.
5. Optional reminders and push notifications help users stay engaged.

## Getting started

### Prerequisites

Make sure you have:
- Node.js installed
- npm or pnpm
- a Firebase project

### 1. Install dependencies

From the project root:

```bash
npm install
```

For the notification server:

```bash
cd server
npm install
```

### 2. Configure Firebase

Create a Firebase project and enable:
- Authentication
- Firestore
- Cloud Messaging

Then add your Firebase config values to a root-level `.env` file:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Run the app locally

```bash
npm run dev
```

Open the local Vite address shown in the terminal.

### 4. Run the notification server (optional)

If you want the reminder server enabled locally:

```bash
cd server
node server.js
```

> Note: the server uses Firebase Admin credentials. If a service account key is not configured, notification sending will be unavailable.

## Available scripts

From the root:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Notes

- The app uses local state persistence and Firestore-backed user data.
- Some sections, such as the leaderboard and push notifications, depend on your Firebase rules and configuration being set up correctly.
- The project already includes a service worker and manifest setup for progressive web app-style behavior.

## Suggested improvements for the future

The project already has a solid foundation and a strong feature set. The main improvements planned for later are:
- adding a more robust backend/API layer for advanced sync and user management
- improving test coverage with Vitest or React Testing Library
- polishing onboarding, accessibility, and mobile experience
- adding clearer deployment and production setup documentation for Firebase Hosting
- refining branding, animations, and notification assets
- expanding analytics with deeper insights and export options

## Repo status

This README reflects the current state of the project and highlights the areas that can be improved later. The repository is ready to be pushed and updated as-is, while the remaining enhancements can be handled in future iterations.
