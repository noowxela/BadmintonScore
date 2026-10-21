import { createId } from '../../domain/ids';
import { normalizeMatchSides } from '../../domain/matchShape';
import { STORAGE_KEYS, readJson, writeJson, removeKey } from '../db';
import { ensurePlayersFromNames } from './players';

export const saveMatch = (matchData) => {
  const match = normalizeMatchSides(matchData);
  const history = getMatchHistory();
  history.push({ ...match, id: createId(), date: new Date().toISOString() });
  writeJson(STORAGE_KEYS.MATCH_HISTORY, history);
  ensurePlayersFromNames([
    match.player1,
    match.player2,
    match.player3,
    match.player4
  ]);
};

export const getMatchHistory = () => readJson(STORAGE_KEYS.MATCH_HISTORY, []);

export const saveCurrentMatch = (matchState) => {
  writeJson(STORAGE_KEYS.CURRENT_MATCH, matchState);
};

export const getCurrentMatch = () => readJson(STORAGE_KEYS.CURRENT_MATCH, null);

export const clearCurrentMatch = () => {
  removeKey(STORAGE_KEYS.CURRENT_MATCH);
};

// Team Match Storage
export const saveTeamMatch = (teamMatchData) => {
  const history = getTeamMatchHistory();
  history.push({
    ...teamMatchData,
    id: createId(),
    date: new Date().toISOString(),
    matches: (teamMatchData.matches || []).map(normalizeMatchSides)
  });
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
  removeKey(STORAGE_KEYS.CURRENT_TEAM_MATCH);
};

// Saved Team Match Configs (Drafts)
export const saveTeamMatchConfig = (config) => {
  const configs = getTeamMatchConfigs();
  const existingIndex = configs.findIndex(c => c.id === config.id);

  if (existingIndex >= 0) {
    configs[existingIndex] = { ...config, lastModified: new Date().toISOString() };
  } else {
    configs.push({ ...config, id: config.id || createId(), lastModified: new Date().toISOString() });
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
