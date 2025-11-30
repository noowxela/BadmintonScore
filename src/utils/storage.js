const STORAGE_KEYS = {
  MATCH_HISTORY: 'badminton_match_history',
  CURRENT_MATCH: 'badminton_current_match',
  PLAYERS: 'badminton_players',
  TEAM_MATCH_HISTORY: 'badminton_team_match_history',
  CURRENT_TEAM_MATCH: 'badminton_current_team_match'
};

export const saveMatch = (matchData) => {
  const history = getMatchHistory();
  history.push({ ...matchData, id: Date.now(), date: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEYS.MATCH_HISTORY, JSON.stringify(history));
};

export const getMatchHistory = () => {
  const history = localStorage.getItem(STORAGE_KEYS.MATCH_HISTORY);
  return history ? JSON.parse(history) : [];
};

export const saveCurrentMatch = (matchState) => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_MATCH, JSON.stringify(matchState));
};

export const getCurrentMatch = () => {
  const match = localStorage.getItem(STORAGE_KEYS.CURRENT_MATCH);
  return match ? JSON.parse(match) : null;
};

export const clearCurrentMatch = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_MATCH);
};

// Team Match Storage
export const saveTeamMatch = (teamMatchData) => {
  const history = getTeamMatchHistory();
  history.push({ ...teamMatchData, id: Date.now(), date: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEYS.TEAM_MATCH_HISTORY, JSON.stringify(history));
};

export const getTeamMatchHistory = () => {
  const history = localStorage.getItem(STORAGE_KEYS.TEAM_MATCH_HISTORY);
  return history ? JSON.parse(history) : [];
};

export const saveCurrentTeamMatch = (matchState) => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_TEAM_MATCH, JSON.stringify(matchState));
};

export const getCurrentTeamMatch = () => {
  const match = localStorage.getItem(STORAGE_KEYS.CURRENT_TEAM_MATCH);
  return match ? JSON.parse(match) : null;
};

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

  localStorage.setItem('badminton_saved_configs', JSON.stringify(configs));
};

export const getTeamMatchConfigs = () => {
  const configs = localStorage.getItem('badminton_saved_configs');
  return configs ? JSON.parse(configs) : [];
};

export const deleteTeamMatchConfig = (id) => {
  const configs = getTeamMatchConfigs().filter(c => c.id !== id);
  localStorage.setItem('badminton_saved_configs', JSON.stringify(configs));
};

export const getStats = () => {
  const history = getMatchHistory();
  const teamHistory = getTeamMatchHistory();
  const stats = {};

  const processMatch = (match) => {
    const players = [match.player1, match.player2];
    if (match.type === 'doubles') {
      players.push(match.player3, match.player4);
    }

    players.forEach(player => {
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

      // Determine if this player won
      const isTeam1 = match.type === 'singles' ? player === match.player1 : (player === match.player1 || player === match.player3);
      const playerWon = isTeam1 ? match.score1 > match.score2 : match.score2 > match.score1;

      if (playerWon) stats[player].wins++;
      else stats[player].losses++;

      stats[player].pointsScored += isTeam1 ? match.score1 : match.score2;
      stats[player].pointsConceded += isTeam1 ? match.score2 : match.score1;
    });
  };

  // Process individual matches
  history.forEach(processMatch);

  // Process team matches (each sub-match counts)
  teamHistory.forEach(teamMatch => {
    if (teamMatch.matches) {
      teamMatch.matches.forEach(match => {
        if (match.status === 'completed') {
          processMatch(match);
        }
      });
    }
  });

  return stats;
};
