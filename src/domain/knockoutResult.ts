import { applyMatchResult } from '../utils/bracket'

type KnockoutEvent = { id: string }
type KnockoutTournament = { events?: KnockoutEvent[] }

type ResultInput = {
  eventId: string
  matchId: string
  score1?: number
  score2?: number
  history?: unknown[]
}

export const recordKnockoutResult = <T extends KnockoutTournament>(
  tournament: T | null | undefined,
  { eventId, matchId, score1, score2, history }: ResultInput
): T | null => {
  if (!tournament) return null
  const events = tournament.events || []
  const eventIndex = events.findIndex((event) => event.id === eventId)
  if (eventIndex < 0) return tournament

  const updatedEvent = applyMatchResult(events[eventIndex], matchId, {
    score1,
    score2,
    history
  })

  return {
    ...tournament,
    events: events.map((event, index) => (index === eventIndex ? updatedEvent : event))
  }
}
