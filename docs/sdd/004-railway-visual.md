# SDD: Railway visual redesign

- **Repo:** `01_project/o000o_active/BadmintonScore`
- **Status:** `implemented`
- **Date:** 2026-10-21
- **Related:** uploaded Railway design notes, `docs/architecture.md`

## 1. Context / current architecture

The app already scores matches, leagues, and knockouts. Color and type lived in `src/styles/tokens.css` and `src/index.css`: black background, orange primary, Outfit, and orange-versus-blue court sides.

## 2. Problem and non-goals

**Problem:** Alex asked to restyle BadmintonScore with the Railway design notes.

**Non-goals:** Changing scoring, storage, routes, or league data. Converting the scoreboard into a marketing page. Making both court sides purple.

## 3. Questions asked and answers

| Question | Answer |
| --- | --- |
| Apply the uploaded design to the existing app? | Alex said to redo BadmintonScore with that design. |
| Court side colors | The notes reserve purple for primary buttons. The two sides stay amber and blue so a match is still readable. |

## 4. Proposed approach, pros / cons, rejected alternatives

**Approach:** Replace tokens, fonts, buttons, cards, inputs, and headers with the Railway palette and type. Keep side colors separate from the purple button.

**Pros:** One token change reaches the screens that already use those classes.

**Cons / risks:** A few generated layout classes still use the primary color for emphasis. Large marketing shadows from the notes would bury a scoreboard, so cards stay flat with a 1px border.

**Rejected alternatives:**

| Alternative | Why not |
| --- | --- |
| Rebuild every screen as a new layout | The request is the visual system, and the current flows already work. |

## 5. Acceptance criteria and verification

- [x] Page background `#13111C`, primary button `#9D4EDD`, headings in IBM Plex Serif, UI in Inter
- [x] Secondary buttons are ghost buttons with an inset border
- [x] Court sides stay two different non-purple colors
- [x] Browser check of home, a quick match, the Laksa Bowl league, and its timetable. Home background `rgb(19, 17, 28)`, Inter on the body, IBM Plex Serif on headings. Confirm is `rgb(157, 78, 221)`. Score pads stay amber `#f4b942` and blue `#5eb1ff`. Group headers are `#08070C`. Purple stays on Timetable, View Matches, and Rule. Loser-pool timetable cells use the amber side color.

## 6. Status history

| Date | Status | Note |
| --- | --- | --- |
| 2026-10-21 | approved | Alex asked to redo the app with the Railway design |
| 2026-10-21 | implemented | Tokens, type, buttons, cards, and inputs |
