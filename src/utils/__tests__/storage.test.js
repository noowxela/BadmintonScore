import { beforeEach, describe, expect, it } from 'vitest'
import {
  addPlayerAlias,
  buildExportPayload,
  ensurePlayer,
  findPlayerByName,
  getPlayers,
  importAllData,
  mergePlayers,
  normalizePlayerName,
  parseImportPayload,
  resolvePlayerName
} from '../storage'

beforeEach(() => {
  localStorage.clear()
})

describe('player roster', () => {
  it('treats aliases as the same player', () => {
    expect(normalizePlayerName('  Alex   W ')).toBe('alex w')
    const alex = ensurePlayer('Alex')
    addPlayerAlias(alex.id, 'Alex W')

    expect(findPlayerByName('alex w').id).toBe(alex.id)
    expect(resolvePlayerName('ALEX W')).toBe('Alex')
    expect(ensurePlayer('Alex W').id).toBe(alex.id)
  })

  it('merges a secondary name into the primary aliases', () => {
    const primary = ensurePlayer('Alex')
    const secondary = ensurePlayer('Alexander')
    const merged = mergePlayers(primary.id, secondary.id)

    expect(merged.aliases).toContain('Alexander')
    expect(findPlayerByName('Alexander').id).toBe(primary.id)
    expect(getPlayers()).toHaveLength(1)
  })
})

describe('backup', () => {
  it('replaces stored data and can merge a later file by id', () => {
    ensurePlayer('Alex')
    importAllData({
      app: 'BadmintonScore',
      version: 1,
      data: {
        matchHistory: [{ id: 'm1', player1: 'Ben', player2: 'Cara', score1: 21, score2: 10 }],
        players: [{ id: 'p-ben', name: 'Ben', aliases: [] }]
      }
    }, 'replace')

    expect(findPlayerByName('Alex')).toBeNull()
    expect(findPlayerByName('Ben').name).toBe('Ben')
    expect(buildExportPayload().data.matchHistory).toHaveLength(1)

    importAllData({
      data: {
        matchHistory: [{ id: 'm2', player1: 'Ben', player2: 'Alex', score1: 21, score2: 19 }],
        players: [{ id: 'p-alex', name: 'Alex', aliases: ['A.'] }]
      }
    }, 'merge')

    expect(buildExportPayload().data.matchHistory.map((match) => match.id).sort()).toEqual(['m1', 'm2'])
    expect(findPlayerByName('A.').name).toBe('Alex')
    expect(parseImportPayload('{"data":{"matchHistory":[]}}').matchHistory).toEqual([])
  })

  it('rejects a backup that is not an object', () => {
    expect(() => parseImportPayload('null')).toThrow(/Invalid backup file/)
  })
})
