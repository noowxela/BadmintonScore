import { normalizeMatchSides } from '../domain/matchShape';

export const STORAGE_KEYS = {
  MATCH_HISTORY: 'badminton_match_history',
  CURRENT_MATCH: 'badminton_current_match',
  PLAYERS: 'badminton_players',
  TEAM_MATCH_HISTORY: 'badminton_team_match_history',
  CURRENT_TEAM_MATCH: 'badminton_current_team_match',
  KNOCKOUT_TOURNAMENTS: 'badminton_knockout_tournaments',
  SAVED_CONFIGS: 'badminton_saved_configs'
};

export const SCHEMA_VERSION = 2;
export const EXPORT_VERSION = 1;
const SCHEMA_KEY = 'badminton_schema_version';

export const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Could not save data', error);
    return false;
  }
};

export const removeKey = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Could not remove data', error);
  }
};

const mapStoredMatches = (list) => (Array.isArray(list) ? list.map(normalizeMatchSides) : []);

export const migrateStoredData = () => {
  let version = 1;
  try {
    version = Number(localStorage.getItem(SCHEMA_KEY) || 1);
  } catch {
    version = 1;
  }
  if (version >= SCHEMA_VERSION) return;

  writeJson(STORAGE_KEYS.MATCH_HISTORY, mapStoredMatches(readJson(STORAGE_KEYS.MATCH_HISTORY, [])));
  writeJson(STORAGE_KEYS.TEAM_MATCH_HISTORY, readJson(STORAGE_KEYS.TEAM_MATCH_HISTORY, []).map((tie) => ({
    ...tie,
    matches: mapStoredMatches(tie.matches)
  })));
  writeJson(STORAGE_KEYS.SAVED_CONFIGS, readJson(STORAGE_KEYS.SAVED_CONFIGS, []).map((config) => ({
    ...config,
    matches: mapStoredMatches(config.matches)
  })));

  const current = readJson(STORAGE_KEYS.CURRENT_MATCH, null);
  if (current) writeJson(STORAGE_KEYS.CURRENT_MATCH, normalizeMatchSides(current));

  const currentTeam = readJson(STORAGE_KEYS.CURRENT_TEAM_MATCH, null);
  if (currentTeam) {
    writeJson(STORAGE_KEYS.CURRENT_TEAM_MATCH, {
      ...currentTeam,
      matches: mapStoredMatches(currentTeam.matches)
    });
  }

  try {
    localStorage.setItem(SCHEMA_KEY, String(SCHEMA_VERSION));
  } catch (error) {
    console.error('Could not store schema version', error);
  }
};
