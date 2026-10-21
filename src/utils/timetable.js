const COURTS = [5, 6, 7, 8];
const GAME_MINUTES = 15;

const pad = (n) => String(n).padStart(2, '0');

export const minutesToClock = (total) => {
  const hours24 = Math.floor(total / 60);
  const minutes = total % 60;
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = ((hours24 + 11) % 12) + 1;
  return `${pad(hours12)}:${pad(minutes)} ${ampm}`;
};

export const clockToMinutes = (value) => {
  if (!value) return null;
  if (/T/.test(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.getHours() * 60 + date.getMinutes();
    }
  }
  const match = String(value).match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const ampm = (match[3] || '').toUpperCase();
  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

const roundCode = (roundName, matchNo) => {
  if (roundName === 'Quarter-Final') return `QF-${matchNo}`;
  if (roundName === 'Semi-Final') return `SF-${matchNo}`;
  if (roundName === 'Final') return `F-${matchNo || 1}`;
  if (roundName === 'Bronze Medal') return `BM-${matchNo || 1}`;
  return `M-${matchNo}`;
};

const phaseColor = (phase) => {
  if (phase === 'group') return 'group';
  if (phase === 'winner-sf') return 'sf';
  if (phase === 'loser-sf') return 'loser';
  return 'knock';
};

const realBracketMatches = (event) => {
  if (!event) return [];
  const rows = [
    ...event.rounds.flatMap(round => round.matches.map(match => ({ ...match, roundName: round.name }))),
    ...(event.bronzeMatch ? [{ ...event.bronzeMatch, roundName: 'Bronze Medal' }] : [])
  ];
  return rows.filter(match =>
    match.pair1?.id &&
    match.pair2?.id &&
    !match.pair1.isFreePass &&
    !match.pair2.isFreePass
  );
};

const teamById = (tournament, id) => tournament.teams?.find(team => team.id === id);

const vsLabel = (tournament, leftId, rightId) => {
  const left = teamById(tournament, leftId);
  const right = teamById(tournament, rightId);
  const leftText = left?.code || left?.name || 'TBD';
  const rightText = right?.code || right?.name || 'TBD';
  return `${leftText} vs ${rightText}`;
};

const CATEGORY_LABEL = {
  MS: 'Men Singles',
  WS: 'Women Singles',
  MD: 'Men Doubles',
  WD: 'Women Doubles',
  XD: 'Mixed Doubles'
};

const playersForCategory = (team, category) => {
  if (!team?.players) return [];
  if (category === 'MS' || category === 'WS') return [team.players.ms].filter(Boolean);
  if (category === 'MD' || category === 'WD') return [team.players.md1, team.players.md2].filter(Boolean);
  return [team.players.mxM, team.players.mxW].filter(Boolean);
};

const formatDay = (date) => {
  if (!date) return '';
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).replace(' ', '-');
};

const pushGames = (slots, {
  baseMinutes,
  court,
  games,
  label,
  vs,
  names,
  phase,
  eventName,
  teamA,
  teamB,
  date,
  matchNo,
  level = 'L'
}) => {
  games.forEach((game, index) => {
    const category = game.category || (game.type === 'singles' ? 'MS' : 'MD');
    const type = game.type === 'singles' || category === 'MS' || category === 'WS' ? 'Singles' : 'Doubles';
    const start = baseMinutes + index * GAME_MINUTES;
    const end = start + 8;
    const leftPlayers = game.p1 ? [game.p1, game.p3].filter(Boolean) : playersForCategory(teamA, category);
    const rightPlayers = game.p2 ? [game.p2, game.p4].filter(Boolean) : playersForCategory(teamB, category);
    const completed = game.status === 'completed' || (Number.isFinite(game.score1) && Number.isFinite(game.score2) && (game.score1 > 0 || game.score2 > 0));
    slots.push({
      id: `${label}-${index}`,
      minutes: start,
      time: minutesToClock(start),
      court: Number(court),
      label: games.length > 1 ? `${label}-${index + 1}` : label,
      type,
      category,
      vs,
      names,
      phase,
      color: phaseColor(phase),
      eventName,
      detail: {
        matchNo: matchNo || index + 1,
        gameIndex: index + 1,
        type,
        category,
        categoryLabel: CATEGORY_LABEL[category] || type,
        level,
        court: Number(court),
        date,
        dayLabel: formatDay(date),
        startTime: minutesToClock(start),
        endTime: minutesToClock(end),
        status: completed ? 'Completed' : 'Upcoming',
        teamAName: teamA?.name || vs.split(' vs ')[0] || 'TBD',
        teamBName: teamB?.name || vs.split(' vs ')[1] || 'TBD',
        leftPlayers,
        rightPlayers,
        score1: completed ? Number(game.score1) || 0 : null,
        score2: completed ? Number(game.score2) || 0 : null,
        submitted: completed,
        eventName,
        phase
      }
    });
  });
};

const defaultGames = [
  { category: 'MS', type: 'singles' },
  { category: 'MD', type: 'doubles' },
  { category: 'XD', type: 'doubles' }
];

export const buildOverallTimetable = (tournament) => {
  const slots = [];
  const date = tournament.date || '2025-07-25';

  (tournament.ties || []).forEach((tie, index) => {
    const wave = Math.floor(index / COURTS.length);
    const court = COURTS[index % COURTS.length];
    const baseMinutes = 9 * 60 + wave * (GAME_MINUTES * 3);
    const teamA = teamById(tournament, tie.teamAId);
    const teamB = teamById(tournament, tie.teamBId);
    pushGames(slots, {
      baseMinutes,
      court,
      games: tie.matches?.length ? tie.matches : defaultGames,
      label: `Match: ${index + 1}`,
      vs: `${teamA?.code || 'TBD'} vs ${teamB?.code || 'TBD'}`,
      names: `${teamA?.name || 'TBD'} vs ${teamB?.name || 'TBD'}`,
      phase: 'group',
      eventName: `Group ${tie.group}`,
      teamA,
      teamB,
      date,
      matchNo: index + 1
    });
  });

  const winner = tournament.events?.[0];
  const loser = tournament.events?.[1];
  const winnerMatches = realBracketMatches(winner);
  const loserMatches = realBracketMatches(loser);

  const knockoutPlan = [];
  winnerMatches.forEach(match => {
    const round = match.roundName;
    let minutes = clockToMinutes(match.startTime);
    let court = Number(match.court) || 5;
    let phase = 'knock';
    if (round === 'Semi-Final') {
      phase = 'winner-sf';
      minutes = 12 * 60;
      court = Number(match.court) || (match.matchNo === 1 ? 5 : 6);
    } else if (round === 'Bronze Medal') {
      minutes = 14 * 60 + 15;
      court = 6;
    } else if (round === 'Final') {
      minutes = 14 * 60 + 15;
      court = 5;
    }
    knockoutPlan.push({ match, event: winner, minutes, court, phase });
  });

  loserMatches.forEach(match => {
    const round = match.roundName;
    let minutes = clockToMinutes(match.startTime);
    let court = Number(match.court);
    let phase = 'knock';
    if (round === 'Quarter-Final') {
      minutes = 12 * 60;
      court = court || 8;
    } else if (round === 'Semi-Final') {
      phase = 'loser-sf';
      minutes = 13 * 60 + 30;
      court = court || (match.matchNo === 1 ? 5 : 6);
    } else if (round === 'Final') {
      minutes = 14 * 60 + 15;
      court = court || 7;
    } else if (round === 'Bronze Medal') {
      minutes = 14 * 60 + 15;
      court = court || 8;
    }
    knockoutPlan.push({ match, event: loser, minutes, court, phase });
  });

  knockoutPlan.forEach(({ match, event, minutes, court, phase }) => {
    const teamA = teamById(tournament, match.pair1?.id);
    const teamB = teamById(tournament, match.pair2?.id);
    const vs = teamA && teamB
      ? `${teamA.name} vs ${teamB.name}`
      : match.pair1?.name && match.pair2?.name
        ? `${match.pair1.name} vs ${match.pair2.name}`
        : vsLabel(tournament, match.pair1?.id, match.pair2?.id);
    pushGames(slots, {
      baseMinutes: minutes,
      court,
      games: defaultGames.map(game => ({ ...game, status: match.status === 'completed' ? 'completed' : 'pending' })),
      label: `Match: ${roundCode(match.roundName, match.matchNo)}`,
      vs: match.pair1?.id && match.pair2?.id ? vs : 'TBD vs TBD',
      names: vs,
      phase,
      eventName: event?.name || '',
      teamA,
      teamB,
      date,
      matchNo: match.matchNo,
      level: event?.level || 'L'
    });
  });

  const times = [...new Set(slots.map(slot => slot.minutes))].sort((a, b) => a - b);
  const start = times[0] ?? 9 * 60;
  const end = (times[times.length - 1] ?? 23 * 60) + GAME_MINUTES;

  return {
    date,
    startClock: minutesToClock(start),
    endClock: minutesToClock(Math.max(end, 23 * 60)),
    courts: COURTS,
    times: times.map(minutesToClock),
    slots,
    grid: times.map(minutes => ({
      minutes,
      time: minutesToClock(minutes),
      cells: Object.fromEntries(COURTS.map(court => [
        court,
        slots.find(slot => slot.minutes === minutes && slot.court === court) || null
      ]))
    }))
  };
};

export const timetableToCsv = (table) => {
  const header = ['Time', ...table.courts.map(court => `Court ${court}`)];
  const rows = table.grid.map(row => [
    row.time,
    ...table.courts.map(court => {
      const cell = row.cells[court];
      if (!cell) return '';
      return `${cell.label} | ${cell.type} | ${cell.vs}`;
    })
  ]);
  return [header, ...rows]
    .map(line => line.map(value => `"${String(value).replaceAll('"', '""')}"`).join(','))
    .join('\n');
};

export const slotCategory = (slot) => {
  if (slot.category === 'MS' || slot.category === 'WS' || slot.type === 'Singles') return 'MS';
  if (slot.category === 'XD') return 'XD';
  return 'MD';
};

export const filterTimetable = (table, categories) => {
  if (!table) return null;
  const active = categories?.length ? categories : ['MS', 'MD', 'XD'];
  const keep = (slot) => slot && active.includes(slotCategory(slot));
  return {
    ...table,
    slots: table.slots.filter(keep),
    grid: table.grid.map(row => ({
      ...row,
      cells: Object.fromEntries(table.courts.map(court => [
        court,
        keep(row.cells[court]) ? row.cells[court] : null
      ]))
    }))
  };
};
