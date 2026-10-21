export type SideFields = {
  player1?: string
  player2?: string
  player3?: string
  player4?: string
  p1?: string
  p2?: string
  p3?: string
  p4?: string
  score1?: number
  score2?: number
  history?: unknown[]
  status?: string
}

export type NormalizedMatch = SideFields & {
  player1: string
  player2: string
  player3: string
  player4: string
  p1: string
  p2: string
  p3: string
  p4: string
}

export const normalizeMatchSides = <T extends SideFields>(match: T | null | undefined): T & NormalizedMatch => {
  const source = match || ({} as T)
  const player1 = source.player1 || source.p1 || ''
  const player2 = source.player2 || source.p2 || ''
  const player3 = source.player3 || source.p3 || ''
  const player4 = source.player4 || source.p4 || ''
  return {
    ...source,
    player1,
    player2,
    player3,
    player4,
    p1: player1,
    p2: player2,
    p3: player3,
    p4: player4
  }
}

export const toScoreboardMatch = (match: SideFields | null | undefined): NormalizedMatch => {
  const normalized = normalizeMatchSides(match)
  return {
    ...normalized,
    score1: normalized.score1 || 0,
    score2: normalized.score2 || 0,
    history: normalized.history || []
  }
}
