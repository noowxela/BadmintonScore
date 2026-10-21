import { beforeEach, describe, expect, it } from 'vitest'
import { applyGameToTie } from '../teamTie'
import { normalizeMatchSides } from '../matchShape'
import { recordKnockoutResult } from '../knockoutResult'
import { generateEventBracket } from '../../utils/bracket'
import { migrateStoredData, saveMatch, SCHEMA_VERSION } from '../../utils/storage'

beforeEach(() => {
  localStorage.clear()
})

describe('team tie scoring', () => {
  it('records the game and the side that reached the higher score', () => {
    const next = applyGameToTie({
      scoreA: 0,
      scoreB: 0,
      currentMatchIndex: 0,
      matches: [{ id: 'g1', p1: 'Ann', p2: 'Bea' }]
    }, { score1: 21, score2: 18, p1: 'Ann', p2: 'Bea' })

    expect(next.scoreA).toBe(1)
    expect(next.scoreB).toBe(0)
    expect(next.currentMatchIndex).toBeNull()
    expect(next.matches[0]).toMatchObject({
      status: 'completed',
      player1: 'Ann',
      p1: 'Ann',
      player2: 'Bea'
    })
  })
})

describe('match field shape', () => {
  it('fills both player and p fields', () => {
    expect(normalizeMatchSides({ p1: 'Ann', player2: 'Bea' })).toMatchObject({
      player1: 'Ann',
      p1: 'Ann',
      player2: 'Bea',
      p2: 'Bea'
    })
  })

  it('migrates stored matches once', () => {
    localStorage.setItem('badminton_match_history', JSON.stringify([{ p1: 'Ann' }]))
    migrateStoredData()
    const stored = JSON.parse(localStorage.getItem('badminton_match_history'))
    expect(stored[0]).toMatchObject({ player1: 'Ann', p1: 'Ann' })
    expect(localStorage.getItem('badminton_schema_version')).toBe(String(SCHEMA_VERSION))

    localStorage.setItem('badminton_match_history', JSON.stringify([{ p1: 'Skip' }]))
    migrateStoredData()
    expect(JSON.parse(localStorage.getItem('badminton_match_history'))[0].p1).toBe('Skip')
  })

  it('stores both shapes on a new match', () => {
    saveMatch({ p1: 'Ann', p2: 'Bea', score1: 21, score2: 15 })
    const [saved] = JSON.parse(localStorage.getItem('badminton_match_history'))
    expect(saved.player1).toBe('Ann')
    expect(saved.p2).toBe('Bea')
    expect(saved.id).toEqual(expect.any(String))
  })
})

describe('knockout result', () => {
  it('writes one result through the shared helper', () => {
    const event = generateEventBracket({
      name: 'Cup',
      category: 'MS',
      pairs: [
        { id: 'a', name: 'Ann', p1: 'Ann' },
        { id: 'b', name: 'Bea', p1: 'Bea' }
      ]
    })
    const matchId = event.rounds[0].matches[0].id
    const next = recordKnockoutResult({ id: 'cup', events: [event] }, {
      eventId: event.id,
      matchId,
      score1: 21,
      score2: 10
    })
    expect(next.events[0].rounds[0].matches[0]).toMatchObject({
      score1: 21,
      score2: 10,
      status: 'completed',
      winner: 1
    })
  })
})
