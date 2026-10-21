# Risks

- GitHub Pages still responds `404` for deep links. `404.html` is a copy of the app, so the page loads, but the HTTP status stays 404.
- `laksaBowl50.js` and the team posters contain real names in a public repo. Left in place until Alex confirms.
- The seven AI tool directories are still tracked. Left in place until Alex confirms.
- A new league starts with pending group ties and no knockout events until those events are added.
- Scoring is still a single game to 21. Best of three is not implemented.
- Opening `/team-dashboard` with no tie redirects home. A render error elsewhere is caught by the error boundary.
- Score colors and a few other values that change with the match are still inline styles.
- A blocked `localStorage` write is logged and skipped, so the on-screen score can be ahead of what was saved.
