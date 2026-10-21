const STORAGE_KEYS = {
  MATCH_HISTORY: 'badminton_match_history',
  CURRENT_MATCH: 'badminton_current_match',
  PLAYERS: 'badminton_players',
  TEAM_MATCH_HISTORY: 'badminton_team_match_history',
  CURRENT_TEAM_MATCH: 'badminton_current_team_match',
  KNOCKOUT_TOURNAMENTS: 'badminton_knockout_tournaments',
  SAVED_CONFIGS: 'badminton_saved_configs'
};

const EXPORT_VERSION = 1;

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const normalizePlayerName = (name) =>
  String(name || '').trim().replace(/\s+/g, ' ').toLowerCase();

const createPlayerId = () =>
  `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export const saveMatch = (matchData) => {
  const history = getMatchHistory();
  history.push({ ...matchData, id: Date.now(), date: new Date().toISOString() });
  writeJson(STORAGE_KEYS.MATCH_HISTORY, history);
  ensurePlayersFromNames([
    matchData.player1,
    matchData.player2,
    matchData.player3,
    matchData.player4
  ]);
};

export const getMatchHistory = () => readJson(STORAGE_KEYS.MATCH_HISTORY, []);

export const saveCurrentMatch = (matchState) => {
  writeJson(STORAGE_KEYS.CURRENT_MATCH, matchState);
};

export const getCurrentMatch = () => readJson(STORAGE_KEYS.CURRENT_MATCH, null);

export const clearCurrentMatch = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_MATCH);
};

// Team Match Storage
export const saveTeamMatch = (teamMatchData) => {
  const history = getTeamMatchHistory();
  history.push({ ...teamMatchData, id: Date.now(), date: new Date().toISOString() });
  writeJson(STORAGE_KEYS.TEAM_MATCH_HISTORY, history);

  const names = [];
  teamMatchData.teamA?.players?.forEach((n) => names.push(n));
  teamMatchData.teamB?.players?.forEach((n) => names.push(n));
  teamMatchData.matches?.forEach((m) => {
    names.push(m.p1, m.p2, m.p3, m.p4, m.player1, m.player2, m.player3, m.player4);
  });
  ensurePlayersFromNames(names);
};

export const getTeamMatchHistory = () => readJson(STORAGE_KEYS.TEAM_MATCH_HISTORY, []);

export const saveCurrentTeamMatch = (matchState) => {
  writeJson(STORAGE_KEYS.CURRENT_TEAM_MATCH, matchState);
};

export const getCurrentTeamMatch = () => readJson(STORAGE_KEYS.CURRENT_TEAM_MATCH, null);

export const clearCurrentTeamMatch = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_TEAM_MATCH);
};

// Saved Team Match Configs (Drafts)
export const saveTeamMatchConfig = (config) => {
  const configs = getTeamMatchConfigs();
  const existingIndex = configs.findIndex(c => c.id === config.id);

  if (existingIndex >= 0) {
    configs[existingIndex] = { ...config, lastModified: new Date().toISOString() };
  } else {
    configs.push({ ...config, id: config.id || Date.now(), lastModified: new Date().toISOString() });
  }

  writeJson(STORAGE_KEYS.SAVED_CONFIGS, configs);
};

export const getTeamMatchConfigs = () => readJson(STORAGE_KEYS.SAVED_CONFIGS, []);

export const deleteTeamMatchConfig = (id) => {
  const configs = getTeamMatchConfigs().filter(c => c.id !== id);
  writeJson(STORAGE_KEYS.SAVED_CONFIGS, configs);
};

export const saveKnockoutTournament = (tournament) => {
  const list = getKnockoutTournaments();
  const existingIndex = list.findIndex(t => t.id === tournament.id);
  const next = { ...tournament, lastModified: new Date().toISOString() };

  if (existingIndex >= 0) {
    list[existingIndex] = next;
  } else {
    list.push(next);
  }

  writeJson(STORAGE_KEYS.KNOCKOUT_TOURNAMENTS, list);
  return next;
};

export const getKnockoutTournaments = () => readJson(STORAGE_KEYS.KNOCKOUT_TOURNAMENTS, []);

export const getKnockoutTournament = (id) => {
  return getKnockoutTournaments().find(t => String(t.id) === String(id)) || null;
};

export const deleteKnockoutTournament = (id) => {
  const list = getKnockoutTournaments().filter(t => String(t.id) !== String(id));
  writeJson(STORAGE_KEYS.KNOCKOUT_TOURNAMENTS, list);
};

// --- Player roster ---

const sanitizePlayer = (player) => {
  const name = String(player?.name || '').trim();
  if (!name) return null;
  const aliases = Array.isArray(player.aliases)
    ? [...new Set(player.aliases.map((a) => String(a).trim()).filter(Boolean))]
    : [];
  return {
    id: player.id || createPlayerId(),
    name,
    aliases,
    createdAt: player.createdAt || new Date().toISOString(),
    updatedAt: player.updatedAt || new Date().toISOString()
  };
};

export const getPlayers = () => {
  const list = readJson(STORAGE_KEYS.PLAYERS, []);
  if (!Array.isArray(list)) return [];
  return list.map(sanitizePlayer).filter(Boolean);
};

const savePlayers = (players) => {
  writeJson(STORAGE_KEYS.PLAYERS, players.map(sanitizePlayer).filter(Boolean));
};

export const findPlayerByName = (name, players = getPlayers()) => {
  const needle = normalizePlayerName(name);
  if (!needle) return null;
  return players.find((p) => {
    if (normalizePlayerName(p.name) === needle) return true;
    return (p.aliases || []).some((alias) => normalizePlayerName(alias) === needle);
  }) || null;
};

export const resolvePlayerName = (name, players = getPlayers()) => {
  const trimmed = String(name || '').trim();
  if (!trimmed) return '';
  const found = findPlayerByName(trimmed, players);
  return found ? found.name : trimmed;
};

export const ensurePlayer = (name) => {
  const trimmed = String(name || '').trim();
  if (!trimmed) return null;

  const players = getPlayers();
  const existing = findPlayerByName(trimmed, players);
  if (existing) return existing;

  const player = sanitizePlayer({
    id: createPlayerId(),
    name: trimmed,
    aliases: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  players.push(player);
  savePlayers(players);
  return player;
};

export const ensurePlayersFromNames = (names = []) => {
  names.filter(Boolean).forEach((name) => ensurePlayer(name));
};

export const addPlayer = (name) => ensurePlayer(name);

export const updatePlayer = (id, updates = {}) => {
  const players = getPlayers();
  const index = players.findIndex((p) => p.id === id);
  if (index < 0) return null;

  const nextName = updates.name !== undefined ? String(updates.name).trim() : players[index].name;
  if (!nextName) return null;

  const conflict = findPlayerByName(nextName, players.filter((p) => p.id !== id));
  if (conflict) {
    throw new Error(`Another player already uses the name "${conflict.name}"`);
  }

  const aliases = updates.aliases !== undefined
    ? updates.aliases
    : players[index].aliases;

  players[index] = sanitizePlayer({
    ...players[index],
    name: nextName,
    aliases,
    updatedAt: new Date().toISOString()
  });
  savePlayers(players);
  return players[index];
};

export const addPlayerAlias = (id, alias) => {
  const trimmed = String(alias || '').trim();
  if (!trimmed) return null;

  const players = getPlayers();
  const player = players.find((p) => p.id === id);
  if (!player) return null;

  if (normalizePlayerName(player.name) === normalizePlayerName(trimmed)) {
    return player;
  }

  const ownedByOther = findPlayerByName(trimmed, players.filter((p) => p.id !== id));
  if (ownedByOther) {
    throw new Error(`"${trimmed}" already belongs to ${ownedByOther.name}`);
  }

  const aliases = [...new Set([...(player.aliases || []), trimmed])];
  return updatePlayer(id, { aliases });
};

export const removePlayerAlias = (id, alias) => {
  const players = getPlayers();
  const player = players.find((p) => p.id === id);
  if (!player) return null;
  const aliases = (player.aliases || []).filter(
    (a) => normalizePlayerName(a) !== normalizePlayerName(alias)
  );
  return updatePlayer(id, { aliases });
};

export const deletePlayer = (id) => {
  savePlayers(getPlayers().filter((p) => p.id !== id));
};

/** Merge secondary into primary: secondary name + aliases become aliases of primary. */
export const mergePlayers = (primaryId, secondaryId) => {
  if (primaryId === secondaryId) return null;
  const players = getPlayers();
  const primary = players.find((p) => p.id === primaryId);
  const secondary = players.find((p) => p.id === secondaryId);
  if (!primary || !secondary) return null;

  const aliases = [
    ...(primary.aliases || []),
    secondary.name,
    ...(secondary.aliases || [])
  ].filter((alias) => normalizePlayerName(alias) !== normalizePlayerName(primary.name));

  const next = players
    .filter((p) => p.id !== secondaryId)
    .map((p) => (p.id === primaryId
      ? sanitizePlayer({ ...p, aliases, updatedAt: new Date().toISOString() })
      : p));

  savePlayers(next);
  return next.find((p) => p.id === primaryId);
};

export const collectNamesFromStorage = () => {
  const names = new Set();
  const add = (value) => {
    const trimmed = String(value || '').trim();
    if (trimmed) names.add(trimmed);
  };

  getMatchHistory().forEach((match) => {
    add(match.player1);
    add(match.player2);
    add(match.player3);
    add(match.player4);
  });

  getTeamMatchHistory().forEach((teamMatch) => {
    teamMatch.teamA?.players?.forEach(add);
    teamMatch.teamB?.players?.forEach(add);
    teamMatch.matches?.forEach((m) => {
      add(m.p1); add(m.p2); add(m.p3); add(m.p4);
      add(m.player1); add(m.player2); add(m.player3); add(m.player4);
    });
  });

  getTeamMatchConfigs().forEach((config) => {
    config.teamA?.players?.forEach(add);
    config.teamB?.players?.forEach(add);
    config.matches?.forEach((m) => {
      add(m.p1); add(m.p2); add(m.p3); add(m.p4);
    });
  });

  return [...names];
};

export const syncPlayersFromHistory = () => {
  ensurePlayersFromNames(collectNamesFromStorage());
  return getPlayers();
};

export const getStats = () => {
  const history = getMatchHistory();
  const teamHistory = getTeamMatchHistory();
  const players = getPlayers();
  const stats = {};

  const processMatch = (match) => {
    const rawNames = [match.player1, match.player2];
    if (match.type === 'doubles') {
      rawNames.push(match.player3, match.player4);
    }

    const canonical = rawNames.map((name) => resolvePlayerName(name, players));

    canonical.forEach((player, index) => {
      if (!player) return;
      if (!stats[player]) {
        stats[player] = {
          matches: 0,
          wins: 0,
          losses: 0,
          pointsScored: 0,
          pointsConceded: 0,
          singlesMatches: 0,
          doublesMatches: 0
        };
      }

      stats[player].matches++;
      if (match.type === 'singles') stats[player].singlesMatches++;
      else stats[player].doublesMatches++;

      const isTeam1 = match.type === 'singles'
        ? index === 0
        : (index === 0 || index === 2);
      const playerWon = isTeam1 ? match.score1 > match.score2 : match.score2 > match.score1;

      if (playerWon) stats[player].wins++;
      else stats[player].losses++;

      stats[player].pointsScored += isTeam1 ? match.score1 : match.score2;
      stats[player].pointsConceded += isTeam1 ? match.score2 : match.score1;
    });
  };

  history.forEach(processMatch);

  teamHistory.forEach(teamMatch => {
    if (teamMatch.matches) {
      teamMatch.matches.forEach(match => {
        if (match.status === 'completed') {
          processMatch({
            ...match,
            player1: match.player1 || match.p1,
            player2: match.player2 || match.p2,
            player3: match.player3 || match.p3,
            player4: match.player4 || match.p4
          });
        }
      });
    }
  });

  return stats;
};

// --- Export / Import ---

export const getAllAppData = () => ({
  matchHistory: getMatchHistory(),
  teamMatchHistory: getTeamMatchHistory(),
  currentMatch: getCurrentMatch(),
  currentTeamMatch: getCurrentTeamMatch(),
  savedConfigs: getTeamMatchConfigs(),
  knockoutTournaments: getKnockoutTournaments(),
  players: getPlayers()
});

export const buildExportPayload = () => ({
  app: 'BadmintonScore',
  version: EXPORT_VERSION,
  exportedAt: new Date().toISOString(),
  data: getAllAppData()
});

export const downloadExportFile = () => {
  const payload = buildExportPayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const stamp = new Date().toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = `badminton-score-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return payload;
};

const dedupeById = (existing = [], incoming = []) => {
  const map = new Map();
  [...existing, ...incoming].forEach((item) => {
    if (!item) return;
    const key = item.id != null ? String(item.id) : JSON.stringify(item);
    map.set(key, item);
  });
  return [...map.values()];
};

const mergePlayerLists = (existing = [], incoming = []) => {
  const result = existing.map(sanitizePlayer).filter(Boolean);

  incoming.forEach((raw) => {
    const player = sanitizePlayer(raw);
    if (!player) return;

    const byId = result.find((p) => p.id === player.id);
    if (byId) {
      const aliases = [...new Set([
        ...(byId.aliases || []),
        ...(player.aliases || []),
        ...(normalizePlayerName(byId.name) === normalizePlayerName(player.name) ? [] : [player.name])
      ])].filter((alias) => normalizePlayerName(alias) !== normalizePlayerName(byId.name));
      byId.aliases = aliases;
      byId.updatedAt = new Date().toISOString();
      return;
    }

    const byName = findPlayerByName(player.name, result);
    if (byName) {
      byName.aliases = [...new Set([
        ...(byName.aliases || []),
        ...(player.aliases || [])
      ])].filter((alias) => normalizePlayerName(alias) !== normalizePlayerName(byName.name));
      byName.updatedAt = new Date().toISOString();
      return;
    }

    result.push(player);
  });

  return result;
};

export const parseImportPayload = (raw) => {
  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid backup file');
  }

  const data = parsed.data && typeof parsed.data === 'object' ? parsed.data : parsed;

  return {
    matchHistory: Array.isArray(data.matchHistory) ? data.matchHistory : [],
    teamMatchHistory: Array.isArray(data.teamMatchHistory) ? data.teamMatchHistory : [],
    currentMatch: data.currentMatch ?? null,
    currentTeamMatch: data.currentTeamMatch ?? null,
    savedConfigs: Array.isArray(data.savedConfigs) ? data.savedConfigs : [],
    knockoutTournaments: Array.isArray(data.knockoutTournaments) ? data.knockoutTournaments : [],
    players: Array.isArray(data.players) ? data.players : []
  };
};

/**
 * @param {object|string} raw
 * @param {'replace'|'merge'} mode
 */
export const importAllData = (raw, mode = 'replace') => {
  const incoming = parseImportPayload(raw);

  if (mode === 'replace') {
    writeJson(STORAGE_KEYS.MATCH_HISTORY, incoming.matchHistory);
    writeJson(STORAGE_KEYS.TEAM_MATCH_HISTORY, incoming.teamMatchHistory);
    writeJson(STORAGE_KEYS.SAVED_CONFIGS, incoming.savedConfigs);
    writeJson(STORAGE_KEYS.KNOCKOUT_TOURNAMENTS, incoming.knockoutTournaments);
    savePlayers(incoming.players);

    if (incoming.currentMatch) writeJson(STORAGE_KEYS.CURRENT_MATCH, incoming.currentMatch);
    else localStorage.removeItem(STORAGE_KEYS.CURRENT_MATCH);

    if (incoming.currentTeamMatch) writeJson(STORAGE_KEYS.CURRENT_TEAM_MATCH, incoming.currentTeamMatch);
    else localStorage.removeItem(STORAGE_KEYS.CURRENT_TEAM_MATCH);
  } else {
    writeJson(
      STORAGE_KEYS.MATCH_HISTORY,
      dedupeById(getMatchHistory(), incoming.matchHistory)
    );
    writeJson(
      STORAGE_KEYS.TEAM_MATCH_HISTORY,
      dedupeById(getTeamMatchHistory(), incoming.teamMatchHistory)
    );
    writeJson(
      STORAGE_KEYS.SAVED_CONFIGS,
      dedupeById(getTeamMatchConfigs(), incoming.savedConfigs)
    );
    writeJson(
      STORAGE_KEYS.KNOCKOUT_TOURNAMENTS,
      dedupeById(getKnockoutTournaments(), incoming.knockoutTournaments)
    );
    savePlayers(mergePlayerLists(getPlayers(), incoming.players));

    if (!getCurrentMatch() && incoming.currentMatch) {
      writeJson(STORAGE_KEYS.CURRENT_MATCH, incoming.currentMatch);
    }
    if (!getCurrentTeamMatch() && incoming.currentTeamMatch) {
      writeJson(STORAGE_KEYS.CURRENT_TEAM_MATCH, incoming.currentTeamMatch);
    }
  }

  syncPlayersFromHistory();
  return getAllAppData();
};
