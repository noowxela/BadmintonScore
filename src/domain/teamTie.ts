import { normalizeMatchSides, type SideFields } from './matchShape'

export type TeamTie = {
  matches?: SideFields[]
  currentMatchIndex?: number | null
  scoreA?: number
  scoreB?: number
}

export const applyGameToTie = <T extends TeamTie>(teamMatch: T, finalMatchData: SideFields): T => {
  const matches = [...(teamMatch.matches || [])]
  const index = teamMatch.currentMatchIndex
  const completed = { ...normalizeMatchSides(finalMatchData), status: 'completed' }
  if (index == null || index < 0 || index >= matches.length) {
    matches.push(completed)
  } else {
    matches[index] = completed
  }

  const score1 = Number(finalMatchData.score1) || 0
  const score2 = Number(finalMatchData.score2) || 0
  const scoreA = Number(teamMatch.scoreA) || 0
  const scoreB = Number(teamMatch.scoreB) || 0
  const teamAWon = score1 > score2

  return {
    ...teamMatch,
    matches,
    scoreA: teamAWon ? scoreA + 1 : scoreA,
    scoreB: teamAWon ? scoreB : scoreB + 1,
    currentMatchIndex: null
  }
}
