# Worktracker

This is a small web-based Workday tracker MVP (React + Vite) created in the repository. It supports:

- Start/End Day: Select a date and start your workday — the start time is recorded.
- Add Tasks: Log tasks with timestamps while the day is active.
- End Day: End a workday and the app computes hours for that day.
- Work History: View previous workdays, hours, and tasks.
- PDF Export: Export a professional PDF summary (uses html2canvas + jsPDF).

Data is saved to your browser's localStorage and persists between sessions.

How to run locally

# Worktracker

This repository now contains a scaffolded React + Vite single-page app implementing a Workday tracker MVP.

Features

- Start/End Day: select a date and start your workday — start time is recorded.
- Add Tasks: log tasks with timestamps while a day is active.
- End Workday: end a day and the app computes hours for that day.
- Work History: view previous days with start/end times, tasks, and hours.
- PDF Export: export a PDF summary (generated client-side with html2canvas + jsPDF).

Data persistence

All data is stored in the browser's localStorage (no server). The key used is `worktracker:workdays`.

Quickstart

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

Open the local URL printed by the dev server (usually http://localhost:5173).

Files added

- `index.html` - Vite entry
- `package.json` - scripts and dependencies
- `src/main.jsx` - React entry
- `src/App.jsx` - main app UI and logic
- `src/styles.css` - basic styling

Notes and next steps

- The PDF export is client-side and may not replicate complex styling perfectly; adjust the offscreen report styles in `src/App.jsx` if you want a different layout.
- If you want tests, CI, or server-side persistence (e.g., Express + SQLite or Firebase sync), tell me which and I'll add them.
