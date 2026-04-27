# Productivity Clock

Productivity Clock is a modern, browser-based focus tracker that combines:

- A live analog + digital clock
- A start/stop productivity timer
- Optional Pomodoro mode (custom focus/break lengths)
- Daily goal tracking with streaks and celebration effects
- A productivity calendar with day-by-day status
- A monthly visual report (rings + heatmap chart)

Everything runs fully on the frontend and is stored locally in your browser.

## Why this project

This project is built for people who want a lightweight and visual way to track focused work sessions without creating an account or using a backend service.

## Core Features

### 1. Live Clock Experience
- Real-time analog clock (hour/minute/second hands)
- Digital time and long-form date
- Time-of-day adaptive background themes

### 2. Productivity Timer
- Start/stop session tracking
- Optional session label (what you worked on)
- Per-day accumulation in hours/points
- Handles date rollover for sessions that cross midnight

### 3. Pomodoro Support
- Toggle Pomodoro mode on/off
- Customizable focus and break durations
- Cycle counter and phase display
- Audio chime when focus/break phase changes

### 4. Goals, Streaks, and History
- Editable daily goal (default: 8 hours)
- Goal progress bar with confetti reward
- Current streak calculation
- Last 7 days summary with optional session tags

### 5. Calendar + Monthly Report
- Interactive monthly calendar with color-coded productivity levels
- Day detail panel (hours, rating, points)
- Monthly report totals and completion percentage
- Custom canvas visualization (activity rings + month heatmap)

### 6. UI/UX Enhancements
- Theme switcher (Warm, Dark, Ocean, Forest, Dusk)
- Animated background canvas particles
- Parallax orbs and interactive card effects
- First-time guided feature tour

## Tech Stack

- HTML5
- CSS3 (custom properties, responsive design, animations)
- Vanilla JavaScript (no framework)
- Canvas 2D API for custom chart/background effects
- `localStorage` for persistence

## Data Persistence

The app stores data in browser `localStorage` using these keys:

- `productivity-clock-data-v1` (days, labels, running session)
- `productivity-clock-goal-v1`
- `productivity-clock-tour-v1`
- `productivity-clock-theme-v1`
- `productivity-clock-pomo-v1`

## Keyboard Shortcuts

- `Space`: Start/stop timer
- `Escape`: Close modal/tour overlays

## Project Structure

```text
.
├── index.html
├── styles.css
├── script.js
├── logo.svg
└── Productivity Clock Logo.png
```

## Run Locally

Because this is a static frontend project, you can run it in either way:

1. Open `index.html` directly in your browser, or
2. Serve the folder using any local static server.

## Notes

- No backend required.
- No external database required.
- Data remains in the current browser profile/device unless manually exported.
