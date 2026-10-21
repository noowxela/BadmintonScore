# Risks

- GitHub Pages still responds `404` for deep links. `404.html` is a copy of the app, so the page loads, but the HTTP status stays 404.
- `laksaBowl50.js` and the team posters contain real names in a public repo. Left in place until Alex confirms.
- The seven AI tool directories are still tracked. Left in place until Alex confirms.
- League group copy and tabs are still hardcoded for the Laksa example.
- Scoring is still a single game to 21. Best of three is not implemented.
- Opening `/team-dashboard` with no tie redirects home. A render error elsewhere is caught by the error boundary.
- Dependabot pull requests were not closed. Minor and patch updates will be grouped after the new config is on `main`.
