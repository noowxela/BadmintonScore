# Architecture

BadmintonScore is a client-only React app. Vite builds it with `base: '/BadmintonScore/'`, and GitHub Pages serves that folder. There is no backend.

## Runtime

- `src/main.jsx` mounts React Router with `import.meta.env.BASE_URL`.
- `src/App.jsx` owns the active quick match and team tie, and the handlers that save a result.
- Pages under `src/pages/` render quick match, team ties, knockout, league, history, stats, players, and backup.
- `src/utils/bracket.js`, `league.js`, and `timetable.js` are pure functions. `league.js` also writes a finished group tie back onto `tournament.ties` through `applyTieResult`.
- `src/utils/storage.js` is the only module that reads and writes `localStorage`.
- `src/data/laksaBowl50.js` is the built-in example tournament. It stays in the repo.

## Deploy

Pushing `main` runs `.github/workflows/deploy.yml`: `npm ci`, `npm run build`, then `cp dist/index.html dist/404.html` so a refreshed subpath still loads the app. Pull requests run lint, unit tests, and build.
