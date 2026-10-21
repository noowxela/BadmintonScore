# Setup

Requires Node.js 20+.

```bash
npm ci
npm run dev
```

Open the URL Vite prints. The app is served under `/BadmintonScore/`.

```bash
npm run lint
npm test
npm run typecheck
npm run build
npm run preview
```

`npm run preview` only serves the production build locally. Deployment is the GitHub Actions workflow on `main`.

There is no `.env`. All match data lives in `localStorage`.
