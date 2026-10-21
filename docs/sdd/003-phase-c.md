# SDD: Finish storage split and phase C

- **Repo:** `01_project/o000o_active/BadmintonScore`
- **Status:** `implemented`
- **Date:** 2026-10-21
- **Related:** `docs/review-2026-10.md` §9–§10, `docs/sdd/002-phase-bc.md`

## 1. Context / current architecture

Match, roster, stats, and backup logic still share `src/utils/storage.js`. Pages live under `src/pages/` and `src/components/`. Laksa is assembled in `src/data/laksaBowl50.js` and seeded whenever `getTournament` sees that id. League tabs and group labels are fixed to Group A, Group B, winner pool, and loser pool. Domain helpers are plain JavaScript. Four remote `cursor/*` branches are still on GitHub.

## 2. Problem and non-goals

**Problem:** The review’s B5 split and phase C were left unfinished.

**Non-goals:** Best-of-three scoring, multi-device sync, deleting Laksa names or the AI tool directories, renaming the app, converting every React page to TypeScript.

## 3. Questions asked and answers

| Question | Answer |
| --- | --- |
| Continue the leftover list, including the remote branch deletes? | Alex said continue, and the list includes those four branches. |
| Review §12 | Still unanswered. Keep the current offline app, Laksa names, AI directories, games to 21, and the name BadmintonScore. |

## 4. Proposed approach, pros / cons, rejected alternatives

**Approach:** Split storage into repositories behind the same public exports. Move screens into `src/features/` and session handlers into `MatchSessionContext`. Replace repeated inline layout styles with classes in `src/styles/layout.css`. Store Laksa teams and group results as JSON, load that example from a button, and add a league setup page whose groups and knockout tabs come from the saved tournament. Add TypeScript types on the domain layer. Delete the four remote `cursor/*` branches after confirming they are already merged.

**Pros:** The review’s target folders match the code. A new league no longer needs a hand-written module. Domain functions get a typecheck.

**Cons / risks:** A folder move can break an import. A new league starts with pending ties, so its knockout tabs stay empty until the group stage is built into events. TypeScript covers domain code, not the pages.

**Rejected alternatives:**

| Alternative | Why not |
| --- | --- |
| Convert the whole UI to TypeScript in this pass | The review starts C4 at the domain layer. |
| Leave the remote branches | Alex included them in the work to continue. |

## 5. Acceptance criteria and verification

- [x] `storage.js` re-exports matches, players, stats, and backup from `src/data/repositories/`
- [x] Screens live under `src/features/`, and session handlers live in `MatchSessionContext`
- [x] Shared layout styles are classes, not repeated inline objects
- [x] Laksa data loads from JSON via a button; a new league can be created and its tabs follow its groups and events
- [x] `tsc` checks `src/domain`
- [x] The four `cursor/*` remote branches are gone from GitHub (already absent at fetch time)
- [x] `npm test` 16 passed, lint clean, `tsc` clean, build succeeded. Browser on `http://127.0.0.1:5176/BadmintonScore/`: home, new league with Group A/B, example league tabs Winner Pool Cup and Loser Pool Cup

## 6. Status history

| Date | Status | Note |
| --- | --- | --- |
| 2026-10-21 | approved | Alex said to continue the leftover items |
| 2026-10-21 | implemented | Storage split, feature folders, league setup, domain types |
