import { describe, expect, it } from 'vitest'
import { applyMatchResult, canPlayMatch, findMatch, generateEventBracket } from '../bracket'

const pair = (name) => ({ name, p1: name, p2: '' })

describe('bracket', () => {
  it('auto-advances a bye when the draw is not a power of two', () => {
    const event = generateEventBracket({
      name: 'Cup',
      category: 'MS',
      pairs: [pair('Ann'), pair('Ben'), pair('Cara')],
      includeBronze: false
    })

    const firstRound = event.rounds[0].matches
    expect(firstRound).toHaveLength(2)
    const bye = firstRound.find((match) => match.status === 'completed')
    expect(bye).toBeTruthy()
    expect(canPlayMatch(bye)).toBe(false)

    const advanced = bye.winner === 1 ? bye.pair1 : bye.pair2
    const final = event.rounds.at(-1).matches[0]
    expect([final.pair1.name, final.pair2.name]).toContain(advanced.name)
  })

  it('records a result, advances the winner, and leaves the original event unchanged', () => {
    const event = generateEventBracket({
      category: 'MS',
      pairs: [pair('Ann'), pair('Ben'), pair('Cara'), pair('Dan')],
      includeBronze: true
    })

    expect(event.bronzeMatch.roundName).toBe('Bronze Medal')
    const match = event.rounds[0].matches.find((item) => canPlayMatch(item))
    const next = applyMatchResult(event, match.id, { score1: 21, score2: 15 })
    const played = findMatch(next, match.id)

    expect(played.status).toBe('completed')
    expect(played.winner).toBe(1)
    expect(findMatch(event, match.id).status).toBe('pending')

    const final = next.rounds.at(-1).matches[0]
    expect([final.pair1.name, final.pair2.name]).toContain(match.pair1.name)
  })
})
