import { getMatchHistory, getTeamMatchHistory } from './matches';
import { getPlayers, resolvePlayerName } from './players';

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
