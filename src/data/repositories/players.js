import { createId } from '../../domain/ids';
import { STORAGE_KEYS, readJson, writeJson } from '../db';
import { getMatchHistory, getTeamMatchHistory, getTeamMatchConfigs } from './matches';

const createPlayerId = () => `p_${createId()}`;

export const normalizePlayerName = (name) =>
  String(name || '').trim().replace(/\s+/g, ' ').toLowerCase();

export const sanitizePlayer = (player) => {
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

export const savePlayers = (players) => {
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
