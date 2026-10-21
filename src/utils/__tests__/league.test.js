import { describe, expect, it } from 'vitest'
import { applyTieResult, computeStandings, qualifyPools } from '../league'

const teams = [
  { id: 'hujan', name: 'Hujan', group: 'A' },
  { id: 'ribut', name: 'Ribut', group: 'A' },
  { id: 'taufan', name: 'Taufan', group: 'B' },
  { id: 'petir', name: 'Petir', group: 'B' }
]

const completed = (id, group, teamAId, teamBId, scoreA, scoreB) => ({
  id,
  group,
  teamAId,
  teamBId,
  scoreA,
  scoreB,
  status: 'completed',
  matches: [
    { score1: 21, score2: 10 },
    { score1: 21, score2: 18 },
    { score1: 15, score2: 21 }
  ]
})

describe('league', () => {
  it('ranks a group from completed ties and ignores unfinished ones', () => {
    const ties = [
      completed('t1', 'A', 'hujan', 'ribut', 2, 1),
      { ...completed('t2', 'A', 'ribut', 'hujan', 2, 1), status: 'pending' }
    ]
    const rows = computeStandings(teams, ties, 'A')

    expect(rows.map((row) => row.team.id)).toEqual(['hujan', 'ribut'])
    expect(rows[0].GW).toBe(1)
    expect(rows[0].TW).toBe(2)
    expect(rows[0].GP).toBe(57)
    expect(rows[0].LP).toBe(49)
    expect(rows[0].RP).toBe(8)
    expect(rows[1].GW).toBe(0)
  })

  it('writes a finished tie back onto the tournament', () => {
    const tournament = {
      id: 'league',
      teams,
      ties: [completed('t1', 'A', 'hujan', 'ribut', 0, 0)]
    }
    const next = applyTieResult(tournament, 't1', {
      scoreA: 2,
      scoreB: 1,
      matches: [{ score1: 21, score2: 19 }]
    })

    expect(tournament.ties[0].status).toBe('completed')
    expect(tournament.ties[0].scoreA).toBe(0)
    expect(next.ties[0]).toMatchObject({
      status: 'completed',
      scoreA: 2,
      scoreB: 1,
      winnerId: 'hujan'
    })
    expect(next.ties[0].matches).toEqual([{ score1: 21, score2: 19 }])
  })

  it('sends the top two into the winner pool', () => {
    const ties = [
      completed('a', 'A', 'hujan', 'ribut', 2, 1),
      completed('b', 'B', 'taufan', 'petir', 2, 1)
    ]
    const pools = qualifyPools(teams, ties)
    expect(pools.winner.map((team) => team.id)).toEqual(['hujan', 'petir', 'taufan', 'ribut'])
    expect(pools.loser).toEqual([])
  })
})
