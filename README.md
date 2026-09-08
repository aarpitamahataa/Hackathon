# Habit Tracker

A single-page React app: type a habit, it's added to a "Today" list, tap to mark it done for today. No server, no login — everything lives in `localStorage` in your browser.

## Run locally

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
```

Outputs a static site to `dist/`, deployable to Vercel with zero configuration.

## Features

- **Streaks** — each habit shows a 🔥 current-streak count and a 14-day heatmap strip.
- **Leveling up** — every check-in earns XP; a level/title bar ("Habit Hero", "Unstoppable", ...) tracks your overall progress.
- **Confetti** — a hand-rolled canvas confetti burst fires on level-ups and when every habit for the day is checked off. No external libraries.
- **Sound effects** — tiny Web Audio chimes for checking off a habit, leveling up, or clearing the whole day. Mute anytime with the 🔊/🔇 toggle.
- **Emoji + color per habit** — pick an icon and accent color when you add a habit.
- **Dark mode** — toggle with 🌙/☀️, preference persisted.
- **Undo delete** — deleting a habit shows a 5-second "Undo" snackbar instead of losing it instantly.
- **Keyboard shortcut** — press `/` anywhere to jump to the add-habit box.
- **Secret party mode** — enter the classic Konami code (`↑ ↑ ↓ ↓ ← → ← → b a`) for an unnecessary but delightful rainbow party mode.

## Notes

- Data is stored per-browser via `localStorage` under the key `habit-tracker:habits` (habits) and `habit-tracker:settings` (theme/mute/party-mode preferences). Clearing site data or switching browsers/devices loses your habits.
- No accounts — anyone using the same browser profile shares the same habit list.
