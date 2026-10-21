import { createId } from './ids'

type LineupSide = { p1: string; p2?: string }

type LeagueTeam = {
  id: string
  code: string
  group: string
  name: string
  players: { ms: string; md1: string; md2: string; mxM: string; mxW: string }
}

const pendingGame = (id: string, category: string, type: string, a: LineupSide, b: LineupSide) => ({
  id,
  category,
  type,
  p1: a.p1,
  p2: b.p1,
  p3: a.p2 || '',
  p4: b.p2 || '',
  score1: 0,
  score2: 0,
  status: 'pending'
})

const lineup = (team: LeagueTeam) => ({
  ms: { p1: team.players.ms },
  md: { p1: team.players.md1, p2: team.players.md2 },
  xd: { p1: team.players.mxM, p2: team.players.mxW }
})

const asTeam = (name: string, group: string, index: number): LeagueTeam => ({
  id: createId('team'),
  code: `${group}${index + 1}`,
  group,
  name,
  players: { ms: name, md1: name, md2: name, mxM: name, mxW: name }
})

const roundRobin = (teams: LeagueTeam[], date: string) => {
  const ties = []
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const teamA = teams[i]
      const teamB = teams[j]
      const a = lineup(teamA)
      const b = lineup(teamB)
      const id = createId('tie')
      ties.push({
        id,
        group: teamA.group,
        teamAId: teamA.id,
        teamBId: teamB.id,
        scoreA: 0,
        scoreB: 0,
        status: 'pending',
        winnerId: null,
        title: `${teamA.name} vs ${teamB.name}`,
        date,
        teamA: { name: teamA.name, players: Object.values(teamA.players) },
        teamB: { name: teamB.name, players: Object.values(teamB.players) },
        matches: [
          pendingGame(`${id}-ms`, 'MS', 'singles', a.ms, b.ms),
          pendingGame(`${id}-md`, 'MD', 'doubles', a.md, b.md),
          pendingGame(`${id}-xd`, 'XD', 'doubles', a.xd, b.xd)
        ]
      })
    }
  }
  return ties
}

export const createLeague = ({
  title,
  date,
  groupA,
  groupB
}: {
  title: string
  date: string
  groupA: string[]
  groupB: string[]
}) => {
  const teams = [
    ...groupA.map((name, index) => asTeam(name, 'A', index)),
    ...groupB.map((name, index) => asTeam(name, 'B', index))
  ]
  return {
    id: createId('league'),
    title: title || 'League',
    subtitle: 'Group stage',
    format: 'league-knockout',
    date,
    status: 'group',
    tieFormat: 'Men Singles · Men Doubles · Mixed Doubles',
    groups: [
      { id: 'A', name: 'Group A' },
      { id: 'B', name: 'Group B' }
    ],
    teams,
    ties: [
      ...roundRobin(teams.filter((team) => team.group === 'A'), date),
      ...roundRobin(teams.filter((team) => team.group === 'B'), date)
    ],
    events: []
  }
}
