import { describe, expect, it } from 'vitest'
import { buildOverallTimetable, clockToMinutes, filterTimetable, minutesToClock, timetableToCsv } from '../timetable'

describe('timetable', () => {
  it('converts clock times', () => {
    expect(minutesToClock(9 * 60)).toBe('09:00 AM')
    expect(minutesToClock(13 * 60 + 30)).toBe('01:30 PM')
    expect(clockToMinutes('1:30 PM')).toBe(13 * 60 + 30)
    expect(clockToMinutes('09:00')).toBe(9 * 60)
  })

  it('places group games on courts and can filter to singles', () => {
    const table = buildOverallTimetable({
      date: '2025-07-25',
      teams: [
        { id: 'hujan', code: 'A3', name: 'Hujan' },
        { id: 'ribut', code: 'A5', name: 'Ribut' }
      ],
      ties: [{
        id: 't1',
        group: 'A',
        teamAId: 'hujan',
        teamBId: 'ribut',
        matches: [
          { category: 'MS', type: 'singles', score1: 21, score2: 19 },
          { category: 'MD', type: 'doubles', score1: 21, score2: 18 },
          { category: 'XD', type: 'doubles', score1: 19, score2: 21 }
        ]
      }],
      events: []
    })

    expect(table.date).toBe('2025-07-25')
    expect(table.slots).toHaveLength(3)
    expect(table.slots[0].court).toBe(5)
    expect(table.slots.map((slot) => slot.category)).toEqual(['MS', 'MD', 'XD'])
    expect(timetableToCsv(table)).toContain('A3 vs A5')

    const singles = filterTimetable(table, ['MS'])
    expect(singles.slots).toHaveLength(1)
    expect(singles.slots[0].category).toBe('MS')
  })
})
