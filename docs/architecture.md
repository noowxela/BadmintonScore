# Architecture

BadmintonScore is a client-only React app. Vite builds it with `base: '/BadmintonScore/'`, and GitHub Pages serves that folder. There is no backend.

## Runtime

- `src/main.jsx` mounts React Router with `import.meta.env.BASE_URL`.
- `src/app/App.jsx` is the layout and routes. The active match and its handlers live in `src/state/MatchSessionContext.jsx`.
- Screens live under `src/features/` (home, quick-match, team-match, knockout, league, players, history, stats, backup). Shared controls live in `src/components/ui/`.
- `src/domain/` is TypeScript: ids, match fields, team-tie scoring, knockout write-back, and `createLeague`.
- `src/utils/bracket.js`, `league.js`, and `timetable.js` stay plain JavaScript. `league.js` writes a finished group tie, including its court schedule, through `applyTieResult`.
- `src/data/db.js` is the only module that touches `localStorage`. `src/data/repositories/` splits matches, players, stats, and backup. `src/utils/storage.js` re-exports that public API. Writes are caught so a full or blocked store does not throw.
- Laksa teams and group results live in `src/data/examples/laksaBowl.json`. `laksaBowl50.js` builds the bracket from that file when someone loads the example. A new league is created from `LeagueSetup` and its group names and knockout tabs come from the saved tournament.
- Color tokens are in `src/styles/tokens.css`. Static layout that used to be inline is in `src/styles/layout.css`.

## Deploy

Pushing `main` runs `.github/workflows/deploy.yml`: `npm ci`, `npm run build`, then `cp dist/index.html dist/404.html` so a refreshed subpath still loads the app. Pull requests run lint, unit tests, and build.
