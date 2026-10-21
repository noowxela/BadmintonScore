import { EXPORT_VERSION, SCHEMA_VERSION, STORAGE_KEYS, writeJson, removeKey } from '../db';
import {
  getMatchHistory,
  getTeamMatchHistory,
  getCurrentMatch,
  getCurrentTeamMatch,
  getTeamMatchConfigs,
  getKnockoutTournaments
} from './matches';
import { getPlayers, savePlayers, sanitizePlayer, findPlayerByName, normalizePlayerName, syncPlayersFromHistory } from './players';

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
  schemaVersion: SCHEMA_VERSION,
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
    else removeKey(STORAGE_KEYS.CURRENT_MATCH);

    if (incoming.currentTeamMatch) writeJson(STORAGE_KEYS.CURRENT_TEAM_MATCH, incoming.currentTeamMatch);
    else removeKey(STORAGE_KEYS.CURRENT_TEAM_MATCH);
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
