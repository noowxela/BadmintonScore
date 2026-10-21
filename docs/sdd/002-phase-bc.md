# SDD: Phase B3–B8 and the start of phase C

- **Repo:** `01_project/o000o_active/BadmintonScore`
- **Status:** `implemented`
- **Date:** 2026-10-21
- **Related:** `docs/review-2026-10.md` §9–§12, `docs/sdd/001-phase-a-b.md`

## 1. Context / current architecture

The app is still a client-only React + Vite scoreboard. `src/App.jsx` owned team-tie scoring, knockout write-back, and `window.confirm`. Match objects used both `p1` and `player1`. `ensureLaksaBowl50()` ran while Home rendered. The court scheduler kept its plan in component state only. Color tokens lived at the top of `src/index.css`.

## 2. Problem and non-goals

**Problem:** Review steps B3–B8 were still open, and phase C had not started. Home also wrote the example league during render.

**Non-goals:** Deleting `laksaBowl50.js` or the AI tool directories. Best-of-three scoring. Multi-device sync. Renaming the app. A TypeScript migration. Moving every page into feature folders. Rewriting the remaining inline styles. A generic league wizard. Splitting `storage.js` into separate player and backup modules. Deleting the four remote `cursor/*` branches.

## 3. Questions asked and answers

| Question | Answer |
| --- | --- |
| Review §12 (audience, live scoring, sync, real names, AI dirs, best of three, official name) | Unanswered. This pass keeps the current offline app, the Laksa names, the AI directories, single games to 21, and the name BadmintonScore. |
| Start B3–B8 and phase C? | Alex said to start the deferred items. |

## 4. Proposed approach, pros / cons, rejected alternatives

**Approach:** Extract tie scoring, match-field normalization, and knockout write-back into `src/domain/`. Migrate stored matches to schema version 2 on load. Catch `localStorage` write failures. Load any tournament, including Laksa, through `getTournament(id)`. Persist the scheduler onto the team match. Replace `alert` / `confirm` / the share `prompt` with an in-app dialog and an inline link field. Move the palette to `src/styles/tokens.css`.

**Pros:** The duplicated result paths are one function. Old saves gain both field names without new ids. A full storage failure no longer throws out of `writeJson`. Opening Home no longer seeds the example league.

**Cons / risks:** `storage.js` is still one module. Most component styles are still inline. Laksa is still a JS module with hardcoded league copy. Schema migration runs once; a later shape change needs a new version.

**Rejected alternatives:**

| Alternative | Why not |
| --- | --- |
| Full `src/features/` move and TypeScript in this pass | Too large to verify with the scoring changes. |
| Delete Laksa names or the AI directories | §12 is still open. |

## 5. Acceptance criteria and verification

- [x] Finishing a team game updates score and writes both `player*` and `p*` fields (`src/domain/__tests__/phase-bc.test.js`)
- [x] Knockout completion uses `recordKnockoutResult`
- [x] Stored matches migrate once to schema 2; new ids come from `crypto.randomUUID` when the browser has it
- [x] Home does not seed Laksa; `/league/laksa-bowl-50` does
- [x] Scheduler start time reloads from the saved team match and writes back (`10:30` restored, `11:00` stored)
- [x] End Game uses the in-app Confirm / Cancel dialog
- [x] `npm test` 16 passed, `npm run lint` clean, `npm run build` succeeded
- [x] Browser on `http://127.0.0.1:5175/BadmintonScore/`: home, league, team dashboard, scoreboard, knockout bracket

## 6. Status history

| Date | Status | Note |
| --- | --- | --- |
| 2026-10-21 | approved | Alex asked to start the deferred B3–B8 and phase C items |
| 2026-10-21 | implemented | B3–B8 done; phase C started with `src/domain/` and `tokens.css` |
