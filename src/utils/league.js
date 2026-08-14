export const teamToPair = (team) => ({
  id: team.id,
  name: team.name,
  p1: team.players.ms,
  p2: team.players.mxW,
  isFreePass: false
});

export const createTeamTie = ({ teamA, teamB, title, date, league, matches }) => ({
  title: title || `${teamA.name} vs ${teamB.name}`,
  date: date || new Date().toISOString().split('T')[0],
  teamA: {
    name: teamA.name,
    players: [teamA.players.ms, teamA.players.md1, teamA.players.md2, teamA.players.mxM, teamA.players.mxW]
  },
  teamB: {
    name: teamB.name,
    players: [teamB.players.ms, teamB.players.md1, teamB.players.md2, teamB.players.mxM, teamB.players.mxW]
  },
  scoreA: 0,
  scoreB: 0,
  currentMatchIndex: null,
  matches: matches || [
    { id: 1, category: 'MS', type: 'singles', p1: teamA.players.ms, p2: teamB.players.ms, p3: '', p4: '', score1: 0, score2: 0, status: 'pending' },
    { id: 2, category: 'MD', type: 'doubles', p1: teamA.players.md1, p2: teamB.players.md1, p3: teamA.players.md2, p4: teamB.players.md2, score1: 0, score2: 0, status: 'pending' },
    { id: 3, category: 'XD', type: 'doubles', p1: teamA.players.mxM, p2: teamB.players.mxM, p3: teamA.players.mxW, p4: teamB.players.mxW, score1: 0, score2: 0, status: 'pending' }
  ],
  league
});

export const computeStandings = (teams, ties, group) => {
  const groupTeams = teams.filter(team => team.group === group);
  const stats = Object.fromEntries(groupTeams.map(team => [team.id, {
    team,
    GW: 0,
    GL: 0,
    TW: 0,
    TL: 0,
    GP: 0,
    LP: 0,
    RP: 0
  }]));

  ties.filter(tie => tie.group === group && tie.status === 'completed').forEach(tie => {
    const sideA = stats[tie.teamAId];
    const sideB = stats[tie.teamBId];
    if (!sideA || !sideB) return;

    sideA.TW += tie.scoreA;
    sideA.TL += tie.scoreB;
    sideB.TW += tie.scoreB;
    sideB.TL += tie.scoreA;

    if (tie.scoreA > tie.scoreB) {
      sideA.GW += 1;
      sideB.GL += 1;
    } else {
      sideB.GW += 1;
      sideA.GL += 1;
    }

    (tie.matches || []).forEach(match => {
      sideA.GP += Number(match.score1) || 0;
      sideA.LP += Number(match.score2) || 0;
      sideB.GP += Number(match.score2) || 0;
      sideB.LP += Number(match.score1) || 0;
    });
  });

  return Object.values(stats)
    .map(row => ({ ...row, RP: row.GP - row.LP }))
    .sort((a, b) =>
      b.GW - a.GW ||
      a.GL - b.GL ||
      b.TW - a.TW ||
      a.TL - b.TL ||
      b.RP - a.RP ||
      b.GP - a.GP ||
      a.LP - b.LP
    );
};

export const qualifyPools = (teams, ties) => {
  const groupA = computeStandings(teams, ties, 'A');
  const groupB = computeStandings(teams, ties, 'B');
  return {
    groupA,
    groupB,
    winner: [groupA[0], groupB[1], groupB[0], groupA[1]].filter(Boolean).map(row => row.team),
    loser: [...groupA.slice(2), ...groupB.slice(2)].map(row => row.team)
  };
};
