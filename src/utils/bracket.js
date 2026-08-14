const ROUND_NAMES = {
  128: 'Top 128',
  64: 'Top 64',
  32: 'Top 32',
  16: 'Top 16',
  8: 'Quarter-Final',
  4: 'Semi-Final',
  2: 'Final'
};

export const CATEGORIES = [
  { value: 'MS', label: 'Men Singles', type: 'singles' },
  { value: 'WS', label: 'Women Singles', type: 'singles' },
  { value: 'MD', label: 'Men Doubles', type: 'doubles' },
  { value: 'WD', label: 'Women Doubles', type: 'doubles' },
  { value: 'XD', label: 'Mixed Doubles', type: 'doubles' }
];

export const getCategoryMeta = (value) =>
  CATEGORIES.find(c => c.value === value) || CATEGORIES[4];

const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const nextPowerOfTwo = (n) => Math.pow(2, Math.ceil(Math.log2(Math.max(n, 2))));

const pairLabel = (pair) => {
  if (!pair) return '';
  if (pair.isFreePass) return pair.name;
  if (pair.name?.trim()) return pair.name.trim();
  return [pair.p1, pair.p2].filter(Boolean).join(' / ') || 'TBD';
};

const emptySide = () => ({
  id: null,
  name: '',
  p1: '',
  p2: '',
  isFreePass: false
});

const makeMatch = ({ matchNo, roundName, pair1, pair2 }) => {
  const p1 = pair1 || emptySide();
  const p2 = pair2 || emptySide();
  const match = {
    id: uid('km'),
    matchNo,
    roundName,
    court: '',
    startTime: '',
    pair1: p1,
    pair2: p2,
    score1: 0,
    score2: 0,
    winner: null,
    status: 'pending',
    nextMatchId: null,
    nextSlot: null,
    loserNextMatchId: null,
    loserSlot: null
  };

  if (p1.isFreePass && p2.id && !p2.isFreePass) {
    match.score1 = 0;
    match.score2 = 3;
    match.winner = 2;
    match.status = 'completed';
  } else if (p2.isFreePass && p1.id && !p1.isFreePass) {
    match.score1 = 3;
    match.score2 = 0;
    match.winner = 1;
    match.status = 'completed';
  }

  return match;
};

const winnerSide = (match) => {
  if (match.winner === 1) return { ...match.pair1 };
  if (match.winner === 2) return { ...match.pair2 };
  return emptySide();
};

const loserSide = (match) => {
  if (match.winner === 1) return { ...match.pair2 };
  if (match.winner === 2) return { ...match.pair1 };
  return emptySide();
};

const fillNextSlots = (rounds, bronzeMatch) => {
  const byId = new Map();
  rounds.forEach(round => round.matches.forEach(m => byId.set(m.id, m)));
  if (bronzeMatch) byId.set(bronzeMatch.id, bronzeMatch);

  rounds.forEach(round => {
    round.matches.forEach(match => {
      if (!match.winner || !match.nextMatchId) return;
      const next = byId.get(match.nextMatchId);
      if (!next) return;
      const side = winnerSide(match);
      if (match.nextSlot === 1) next.pair1 = side;
      if (match.nextSlot === 2) next.pair2 = side;
    });
  });

  rounds.forEach(round => {
    round.matches.forEach(match => {
      if (!match.winner || !match.loserNextMatchId) return;
      const next = byId.get(match.loserNextMatchId);
      if (!next) return;
      const side = loserSide(match);
      if (side.isFreePass) return;
      if (match.loserSlot === 1) next.pair1 = side;
      if (match.loserSlot === 2) next.pair2 = side;
    });
  });
};

export const generateEventBracket = ({
  name,
  category = 'XD',
  level = '',
  pairs,
  includeBronze = true
}) => {
  const meta = getCategoryMeta(category);
  const realPairs = pairs
    .filter(p => pairLabel(p))
    .map(p => ({
      id: p.id || uid('pair'),
      name: p.name?.trim() || pairLabel(p),
      p1: p.p1 || '',
      p2: meta.type === 'doubles' ? (p.p2 || '') : '',
      isFreePass: false
    }));

  if (realPairs.length < 2) {
    throw new Error('Add at least 2 pairs to generate a bracket.');
  }

  const size = nextPowerOfTwo(realPairs.length);
  const byeCount = size - realPairs.length;
  const firstRoundMatches = [];
  let pairIndex = 0;
  let byeIndex = 1;

  for (let i = 0; i < size / 2; i++) {
    const needsBye = i < byeCount;
    const bye = {
      id: uid('fp'),
      name: `Free pass ${byeIndex}`,
      p1: '',
      p2: '',
      isFreePass: true
    };

    let pair1;
    let pair2;
    if (needsBye) {
      const real = realPairs[pairIndex++];
      if (i % 2 === 0) {
        pair1 = bye;
        pair2 = real;
      } else {
        pair1 = real;
        pair2 = bye;
      }
      byeIndex += 1;
    } else {
      pair1 = realPairs[pairIndex++];
      pair2 = realPairs[pairIndex++];
    }

    firstRoundMatches.push(makeMatch({
      matchNo: i + 1,
      roundName: ROUND_NAMES[size],
      pair1,
      pair2
    }));
  }

  const rounds = [{ name: ROUND_NAMES[size], matches: firstRoundMatches }];
  let prev = firstRoundMatches;
  let playersLeft = size / 2;

  while (playersLeft >= 2) {
    const matches = [];
    for (let i = 0; i < playersLeft / 2; i++) {
      const match = makeMatch({
        matchNo: i + 1,
        roundName: ROUND_NAMES[playersLeft],
        pair1: emptySide(),
        pair2: emptySide()
      });
      prev[i * 2].nextMatchId = match.id;
      prev[i * 2].nextSlot = 1;
      prev[i * 2 + 1].nextMatchId = match.id;
      prev[i * 2 + 1].nextSlot = 2;
      matches.push(match);
    }
    rounds.push({ name: ROUND_NAMES[playersLeft], matches });
    prev = matches;
    playersLeft /= 2;
  }

  let bronzeMatch = null;
  const semi = rounds.find(r => r.name === 'Semi-Final');
  if (includeBronze && semi?.matches.length === 2) {
    bronzeMatch = makeMatch({
      matchNo: 1,
      roundName: 'Bronze Medal',
      pair1: emptySide(),
      pair2: emptySide()
    });
    semi.matches[0].loserNextMatchId = bronzeMatch.id;
    semi.matches[0].loserSlot = 1;
    semi.matches[1].loserNextMatchId = bronzeMatch.id;
    semi.matches[1].loserSlot = 2;
  }

  fillNextSlots(rounds, bronzeMatch);

  return {
    id: uid('event'),
    name: name || `${meta.label} Cup`,
    category,
    level,
    type: meta.type,
    includeBronze,
    pairs: realPairs,
    rounds,
    bronzeMatch
  };
};

export const applyMatchResult = (event, matchId, { score1, score2, history }) => {
  const nextEvent = structuredClone(event);
  const all = [
    ...nextEvent.rounds.flatMap(r => r.matches),
    ...(nextEvent.bronzeMatch ? [nextEvent.bronzeMatch] : [])
  ];
  const match = all.find(m => m.id === matchId);
  if (!match) return nextEvent;

  match.score1 = Number(score1) || 0;
  match.score2 = Number(score2) || 0;
  match.history = history || [];
  match.winner = match.score1 > match.score2 ? 1 : 2;
  match.status = 'completed';

  fillNextSlots(nextEvent.rounds, nextEvent.bronzeMatch);
  return nextEvent;
};

export const findMatch = (event, matchId) => {
  if (!event) return null;
  for (const round of event.rounds) {
    const match = round.matches.find(m => m.id === matchId);
    if (match) return match;
  }
  if (event.bronzeMatch?.id === matchId) return event.bronzeMatch;
  return null;
};

export const canPlayMatch = (match) => {
  if (!match) return false;
  if (match.status === 'completed') return false;
  if (match.pair1?.isFreePass || match.pair2?.isFreePass) return false;
  return Boolean(match.pair1?.id && match.pair2?.id);
};

export const matchToScoreboard = (event, match) => {
  const doubles = event.type === 'doubles';
  return {
    type: doubles ? 'doubles' : 'singles',
    player1: match.pair1?.p1 || match.pair1?.name || '',
    player2: match.pair2?.p1 || match.pair2?.name || '',
    player3: doubles ? (match.pair1?.p2 || '') : '',
    player4: doubles ? (match.pair2?.p2 || '') : '',
    pair1Name: sideLabel(match.pair1),
    pair2Name: sideLabel(match.pair2),
    score1: match.score1 || 0,
    score2: match.score2 || 0,
    history: match.history || [],
    knockout: {
      eventId: event.id,
      matchId: match.id,
      roundName: match.roundName
    }
  };
};

export const formatMatchTime = (iso) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const sideLabel = (side) => {
  if (!side?.id && !side?.name) return 'TBD';
  return side.name || pairLabel(side) || 'TBD';
};
