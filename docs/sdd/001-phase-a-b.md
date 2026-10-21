# SDD: Phase A cleanup and league result write-back

- **Repo:** `01_project/o000o_active/BadmintonScore`
- **Status:** `implemented`
- **Date:** 2026-10-20
- **Related:** `docs/review-2026-10.md`

## 1. Context / current architecture

Pure frontend React 19 + Vite app. Scores, rosters, team ties, knockouts, and the Laksa Bowl league live in `localStorage` via `src/utils/storage.js`. Routes and match-completion handlers live in `src/App.jsx`. GitHub Pages deploys from `.github/workflows/deploy.yml` with `base: '/BadmintonScore/'`.

## 2. Problem and non-goals

**Problem:** The 2026-10-20 review found a broken league group-stage write-back, GitHub Pages deep-link 404s, a white screen on `/team-dashboard` with no active tie, lint errors, template junk, and no tests.

**Non-goals:** Steps after B2 (B3–B8, phase C). Deleting `laksaBowl50.js` or the AI tool directories. Closing Dependabot PRs or deleting remote branches. Major dependency upgrades. Changing scoring rules, field names, or sample data.

## 3. Questions asked and answers

| Question | Answer |
| --- | --- |
| Which review steps to implement? | A1–A10, then B1 and B2. Stop after B2. |
| Open questions in review §12? | Keep data and features as they are. Do not delete `laksaBowl50.js` or AI tool directories. |
| A3 file deletes? | Only `googlemap.html`, `timeline.html`, `timeline_v0.html`, and the Vite template icons. |
| GitHub operations? | Alex deletes merged remote branches and closes Dependabot PRs. Local commits only; no push. |

## 4. Proposed approach, pros / cons, rejected alternatives

**Approach:** One local branch `cleanup/phase-a`, one commit per step. Update dependencies inside existing semver ranges. Copy `index.html` to `404.html` on deploy and read the router basename from `import.meta.env.BASE_URL`. Guard the team dashboard and add an error boundary. Derive the scoreboard winner from the score. Write finished league ties back onto `tournament.ties`, keep completed ties read-only, and stop storing league ties as the current team match. Add Vitest coverage for bracket, league, timetable, roster, and import/export.

**Pros:** Fixes the three user-facing bugs without a rewrite. Each step can be reviewed on its own.

**Cons / risks:** `404.html` still returns HTTP 404 on GitHub Pages; the app loads, but crawlers see an error status. League write-back assumes the in-memory tie still has `teamAId` / `teamBId`.

**Rejected alternatives:**

| Alternative | Why not |
| --- | --- |
| HashRouter | Review prefers the Pages `404.html` copy so shared links keep path URLs. |
| Major upgrades (Vite 8, lucide 1, ESLint 10) | Review says stay off majors for this pass. |
| Feature-folder move (phase C) | Out of scope until Alex confirms. |

## 5. Acceptance criteria and verification

- [x] `npm run lint` passes after A5
- [x] `npm run build` passes after each step
- [x] `/team-dashboard` with no active tie redirects home
- [x] A finished league tie updates standings and does not stick as the current team match
- [x] Completed league ties cannot be replayed
- [x] `npm test` covers bracket, league, timetable, roster, and backup (11 tests)
- [x] Browser pass of home, scoring, team match, knockout, and league

Verified on 2026-10-20 against `http://127.0.0.1:5174/BadmintonScore/`: empty team dashboard returns home; a pending Laksa tie saved as 2-1 completed and restored Hujan to 4 group wins; a completed tie shows scores without a Start button; knockout and timetable pages render; the history Back button is 48px wide. `npm test` 11 passed, `npm run lint` clean, `npm run build` succeeded.

## 6. Status history

| Date | Status | Note |
| --- | --- | --- |
| 2026-10-20 | approved | User asked to execute the review from the Cursor instructions. A1 remote deletes and A2 PR closes stay with Alex. |
| 2026-10-20 | implemented | A2–A10, B1, and B2 committed on `cleanup/phase-a`. |
