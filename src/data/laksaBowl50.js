import { applyMatchResult, generateEventBracket } from '../utils/bracket';
import { createTeamTie, teamToPair } from '../utils/league';
import { getKnockoutTournament, saveKnockoutTournament } from '../utils/storage';

export const LAKSA_BOWL_ID = 'laksa-bowl-50';
export const LAKSA_BOWL_VERSION = 7;

const teamAsset = (file) => `${import.meta.env.BASE_URL}teams/${file}`;

export const TEAM_POSTER = teamAsset('assignments-poster.png');
export const AGENDA_POSTER = teamAsset('agenda-poster.png');
export const LEAGUE_LOGO = teamAsset('league-logo.png');

export const TEAM_LOGOS = {
  badai: teamAsset('badai.png'),
  ribut: teamAsset('ribut.png'),
  petir: teamAsset('petir.png'),
  guruh: teamAsset('guruh.png'),
  taufan: teamAsset('taufan.png'),
  bayu: teamAsset('bayu.png'),
  kabus: teamAsset('kabus.png'),
  ombak: teamAsset('ombak.png'),
  hujan: teamAsset('hujan.png')
};

const team = (id, code, group, name, players) => ({
  id,
  code,
  group,
  name,
  players,
  logo: TEAM_LOGOS[id]
});

const TEAMS = [
  team('badai', 'A1', 'A', 'Badai', { ms: 'Andy', md1: 'KC', md2: 'Aizat', mxM: 'Norman', mxW: 'Beatrice' }),
  team('kabus', 'A2', 'A', 'Kabus', { ms: 'Jonathan', md1: 'Swan', md2: 'Yanbin', mxM: 'Rayyan', mxW: 'Chiayan' }),
  team('hujan', 'A3', 'A', 'Hujan', { ms: 'Padil', md1: 'Yuxuan', md2: 'Jae', mxM: 'Kugan', mxW: 'Sharon' }),
  team('guruh', 'A4', 'A', 'Guruh', { ms: 'Icap', md1: 'Rins', md2: 'Winto', mxM: 'Kelvin', mxW: 'Joyce' }),
  team('ribut', 'A5', 'A', 'Ribut', { ms: 'Valentine', md1: 'Fordan', md2: 'Johan', mxM: 'Raj', mxW: 'Amanda' }),
  team('taufan', 'B1', 'B', 'Taufan', { ms: 'Sukamuljo', md1: 'Edwin', md2: 'Joshua', mxM: 'Kenny', mxW: 'Dalisa' }),
  team('ombak', 'B2', 'B', 'Ombak', { ms: 'Reese', md1: 'Darwish', md2: 'Han', mxM: 'Jaykanesh', mxW: 'Preveena' }),
  team('bayu', 'B3', 'B', 'Bayu', { ms: 'Acai', md1: 'Alex', md2: 'TKY', mxM: 'Mintai', mxW: 'Kahyee' }),
  team('petir', 'B4', 'B', 'Petir', { ms: 'Wei Chean', md1: 'Kugen', md2: 'Gordon', mxM: 'Chia', mxW: 'Wan Qin' })
];

const byId = Object.fromEntries(TEAMS.map(item => [item.id, item]));

const game = (id, category, type, a, b, score1, score2) => ({
  id,
  category,
  type,
  p1: a.p1,
  p2: b.p1,
  p3: a.p2 || '',
  p4: b.p2 || '',
  score1,
  score2,
  status: 'completed'
});

const lineup = (side) => ({
  ms: { p1: side.players.ms },
  md: { p1: side.players.md1, p2: side.players.md2 },
  xd: { p1: side.players.mxM, p2: side.players.mxW }
});

// Winner takes MS + MD (21-x), loser takes MX so every group tie is 2-1.
const completedTie = (id, group, teamAId, teamBId, winnerId, scores) => {
  const teamA = byId[teamAId];
  const teamB = byId[teamBId];
    const a = lineup(teamA);
  const b = lineup(teamB);
  const matches = [
    game(`${id}-ms`, 'MS', 'singles', a.ms, b.ms, scores.ms[0], scores.ms[1]),
    game(`${id}-md`, 'MD', 'doubles', a.md, b.md, scores.md[0], scores.md[1]),
    game(`${id}-xd`, 'XD', 'doubles', a.xd, b.xd, scores.xd[0], scores.xd[1])
  ];
  const scoreA = matches.filter(match => match.score1 > match.score2).length;
  const scoreB = matches.filter(match => match.score2 > match.score1).length;
  return {
    id,
    group,
    teamAId,
    teamBId,
    scoreA,
    scoreB,
    status: 'completed',
    winnerId,
    matches,
    title: `${teamA.name} vs ${teamB.name}`,
    date: '2025-07-25',
    teamA: { name: teamA.name, players: Object.values(teamA.players) },
    teamB: { name: teamB.name, players: Object.values(teamB.players) }
  };
};

const GROUP_RESULTS = [
  // Group A: Hujan 4-0, Ribut 2-2, Guruh 2-2, Badai 1-3, Kabus 1-3
  completedTie('a-hujan-ribut', 'A', 'hujan', 'ribut', 'hujan', { ms: [21, 19], md: [21, 20], xd: [19, 21] }),
  completedTie('a-hujan-guruh', 'A', 'hujan', 'guruh', 'hujan', { ms: [21, 9], md: [21, 11], xd: [16, 21] }),
  completedTie('a-hujan-badai', 'A', 'hujan', 'badai', 'hujan', { ms: [21, 17], md: [21, 15], xd: [16, 21] }),
  completedTie('a-hujan-kabus', 'A', 'hujan', 'kabus', 'hujan', { ms: [21, 12], md: [21, 14], xd: [20, 22] }),
  completedTie('a-ribut-guruh', 'A', 'ribut', 'guruh', 'ribut', { ms: [21, 12], md: [21, 10], xd: [15, 21] }),
  completedTie('a-ribut-badai', 'A', 'ribut', 'badai', 'ribut', { ms: [21, 15], md: [21, 17], xd: [19, 21] }),
  completedTie('a-guruh-badai', 'A', 'guruh', 'badai', 'guruh', { ms: [21, 19], md: [21, 20], xd: [18, 21] }),
  completedTie('a-guruh-kabus', 'A', 'guruh', 'kabus', 'guruh', { ms: [21, 19], md: [21, 18], xd: [19, 21] }),
  completedTie('a-kabus-ribut', 'A', 'kabus', 'ribut', 'kabus', { ms: [21, 19], md: [22, 20], xd: [18, 21] }),
  completedTie('a-badai-kabus', 'A', 'badai', 'kabus', 'badai', { ms: [21, 18], md: [21, 16], xd: [17, 21] }),
  // Group B: Taufan 3-0, Petir 2-1, Bayu 1-2, Ombak 0-3
  completedTie('b-taufan-petir', 'B', 'taufan', 'petir', 'taufan', { ms: [21, 15], md: [21, 19], xd: [18, 21] }),
  completedTie('b-taufan-bayu', 'B', 'taufan', 'bayu', 'taufan', { ms: [21, 17], md: [21, 16], xd: [19, 21] }),
  completedTie('b-taufan-ombak', 'B', 'taufan', 'ombak', 'taufan', { ms: [21, 12], md: [21, 18], xd: [16, 21] }),
  completedTie('b-petir-bayu', 'B', 'petir', 'bayu', 'petir', { ms: [21, 18], md: [21, 19], xd: [17, 21] }),
  completedTie('b-petir-ombak', 'B', 'petir', 'ombak', 'petir', { ms: [21, 14], md: [21, 17], xd: [19, 21] }),
  completedTie('b-bayu-ombak', 'B', 'bayu', 'ombak', 'bayu', { ms: [21, 16], md: [21, 19], xd: [18, 21] })
];

const stampMatch = (match, court, startTime) => {
  match.court = court;
  match.startTime = startTime;
  return match;
};

export const buildLaksaBowl50 = () => {
  const winnerPairs = ['hujan', 'petir', 'taufan', 'ribut'].map(id => teamToPair(byId[id]));
  // Order places SF as Kabus vs Badai and Ombak vs Bayu; QF is Bayu vs Guruh.
  const loserPairs = ['kabus', 'badai', 'ombak', 'bayu', 'guruh'].map(id => teamToPair(byId[id]));

  const winnerEvent = generateEventBracket({
    name: 'Winner Pool Cup',
    category: 'XD',
    level: 'L',
    pairs: winnerPairs,
    includeBronze: true
  });
  winnerEvent.id = 'laksa-winner-pool';
  winnerEvent.format = 'team-tie';
  stampMatch(winnerEvent.rounds[0].matches[0], '5', '2025-07-25T12:00:00');
  stampMatch(winnerEvent.rounds[0].matches[1], '6', '2025-07-25T12:00:00');
  stampMatch(winnerEvent.rounds[1].matches[0], '5', '2025-07-25T12:45:00');
  stampMatch(winnerEvent.bronzeMatch, '5', '2025-07-25T12:30:00');

  // SF: Hujan beat Petir, Ribut beat Taufan → Final Hujan vs Ribut, Bronze Petir vs Taufan
  const sf1 = winnerEvent.rounds[0].matches[0];
  const sf2 = winnerEvent.rounds[0].matches[1];
  let seededWinner = applyMatchResult(winnerEvent, sf1.id, { score1: 2, score2: 1 });
  seededWinner = applyMatchResult(seededWinner, sf2.id, { score1: 1, score2: 2 });

  const loserEvent = generateEventBracket({
    name: 'Loser Pool Cup',
    category: 'XD',
    level: 'L',
    pairs: loserPairs,
    includeBronze: true
  });
  loserEvent.id = 'laksa-loser-pool';
  loserEvent.format = 'team-tie';

  const loserQf = loserEvent.rounds[0].matches;
  const loserSf = loserEvent.rounds[1].matches;
  const loserFinal = loserEvent.rounds[2].matches[0];
  stampMatch(loserQf[3], '8', '2025-07-25T12:00:00');
  stampMatch(loserSf[0], '5', '2025-07-25T13:30:00');
  stampMatch(loserSf[1], '6', '2025-07-25T13:30:00');
  stampMatch(loserFinal, '7', '2025-07-25T14:15:00');
  stampMatch(loserEvent.bronzeMatch, '8', '2025-07-25T14:15:00');

  // QF Bayu beat Guruh → SF Kabus vs Badai, Ombak vs Bayu → Final Badai vs Ombak
  let seededLoser = applyMatchResult(loserEvent, loserQf[3].id, { score1: 2, score2: 1 });
  seededLoser = applyMatchResult(seededLoser, loserSf[0].id, { score1: 1, score2: 2 });
  seededLoser = applyMatchResult(seededLoser, loserSf[1].id, { score1: 2, score2: 1 });
  seededLoser = applyMatchResult(seededLoser, loserFinal.id, { score1: 2, score2: 0 });

  return {
    id: LAKSA_BOWL_ID,
    title: 'LAKSA BOWL 5.0',
    subtitle: 'Laksa group internal badminton match',
    format: 'league-knockout',
    date: '2025-07-25',
    status: 'knockout',
    version: LAKSA_BOWL_VERSION,
    poster: TEAM_POSTER,
    agendaPoster: AGENDA_POSTER,
    logo: LEAGUE_LOGO,
    teams: TEAMS,
    ties: GROUP_RESULTS,
    events: [seededWinner, seededLoser]
  };
};

const attachTeamArt = (tournament) => ({
  ...tournament,
  version: LAKSA_BOWL_VERSION,
  poster: TEAM_POSTER,
  agendaPoster: AGENDA_POSTER,
  logo: LEAGUE_LOGO,
  teams: (tournament.teams || []).map(item => ({
    ...item,
    logo: TEAM_LOGOS[item.id] || item.logo
  }))
});

export const ensureLaksaBowl50 = (force = false) => {
  const existing = getKnockoutTournament(LAKSA_BOWL_ID);
  if (!force && existing?.version === LAKSA_BOWL_VERSION) {
    return attachTeamArt(existing);
  }
  return saveKnockoutTournament(buildLaksaBowl50());
};

export const findTeam = (tournament, teamId) =>
  tournament?.teams?.find(item => item.id === teamId) || null;

export const tieFromBracketMatch = (tournament, event, match) => {
  const teamA = findTeam(tournament, match.pair1.id);
  const teamB = findTeam(tournament, match.pair2.id);
  if (!teamA || !teamB) return null;
  return createTeamTie({
    teamA,
    teamB,
    title: `${event.name} · ${match.roundName} · ${teamA.name} vs ${teamB.name}`,
    date: tournament.date,
    league: {
      tournamentId: tournament.id,
      eventId: event.id,
      matchId: match.id,
      roundName: match.roundName
    }
  });
};
