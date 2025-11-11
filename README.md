# Worktracker

This is a small web-based Workday tracker MVP (React + Vite) created in the repository. It supports:

- Start/End Day: Select a date and start your workday — the start time is recorded.
- Add Tasks: Log tasks with timestamps while the day is active.
- End Day: End a workday and the app computes hours for that day.
- Work History: View previous workdays, hours, and tasks.
- PDF Export: Export a professional PDF summary (uses html2canvas + jsPDF).

Data is saved to your browser's localStorage and persists between sessions.

## TODO

- [ ] Implement input validation for task descriptions.
- [ ] Add error handling to the PDF export functionality.
- [ ] Allow multiple active days (or warn the user if a day isn't ended).
- [ ] Sort work history by date (descending).
- [ ] Improve PDF styling.
- [ ] Consider alternative data storage (IndexedDB) for larger datasets.

## How to run locally

```bash
npm install
```

```bash
npm run dev
```

Open the local URL printed by the dev server (usually http://localhost:5173).

## Files added

- `index.html` - Vite entry
- `package.json` - scripts and dependencies
- `src/main.jsx` - React entry
- `src/App.jsx` - main app UI and logic
- `src/styles.css` - basic styling

## Notes and next steps

- The PDF export is client-side and may not replicate complex styling perfectly; adjust the offscreen report styles in `src/App.jsx` if you want a different layout.
- If you want tests, CI, or server-side persistence (e.g., Express + SQLite or Firebase sync), tell me which and I'll add them.