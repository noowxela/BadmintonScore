import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { askConfirm } from '../ui/confirm';
import { applyGameToTie } from '../domain/teamTie';
import { toScoreboardMatch } from '../domain/matchShape';
import { recordKnockoutResult } from '../domain/knockoutResult';
import {
  saveMatch, saveCurrentMatch, getCurrentMatch, clearCurrentMatch,
  saveTeamMatch, saveCurrentTeamMatch, getCurrentTeamMatch, clearCurrentTeamMatch,
  saveTeamMatchConfig, getTeamMatchConfigs, saveKnockoutTournament,
  ensurePlayer, syncPlayersFromHistory, migrateStoredData
} from '../utils/storage';
import { matchToScoreboard } from '../utils/bracket';
import { applyTieResult } from '../utils/league';
import { getTournament, tieFromBracketMatch } from '../data/laksaBowl50';

import { MatchSessionContext } from './sessionContext';

export const MatchSessionProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMatch, setActiveMatch] = useState(() => getCurrentMatch());
  const [activeTeamMatch, setActiveTeamMatch] = useState(() => {
    if (getCurrentMatch()) return null;
    const savedTeamMatch = getCurrentTeamMatch();
    if (savedTeamMatch?.league?.tieId) {
      clearCurrentTeamMatch();
      return null;
    }
    if (!savedTeamMatch?.matches) return null;
    return {
      ...savedTeamMatch,
      scoreA: Number(savedTeamMatch.scoreA) || 0,
      scoreB: Number(savedTeamMatch.scoreB) || 0
    };
  });
  const [savedConfigs, setSavedConfigs] = useState(() => getTeamMatchConfigs());
  const resumedSession = useRef(false);

  useEffect(() => {
    migrateStoredData();
    syncPlayersFromHistory();
    if (resumedSession.current) return;
    resumedSession.current = true;
    if (location.pathname !== '/') return;
    if (activeMatch) navigate('/match');
    else if (activeTeamMatch) navigate('/team-dashboard');
  }, [activeMatch, activeTeamMatch, location.pathname, navigate]);

  useEffect(() => {
    if (activeMatch && !activeTeamMatch) {
      saveCurrentMatch(activeMatch);
    }
  }, [activeMatch, activeTeamMatch]);

  useEffect(() => {
    if (!activeTeamMatch) return;
    if (activeTeamMatch.league?.tieId) {
      clearCurrentTeamMatch();
      return;
    }
    saveCurrentTeamMatch(activeTeamMatch);
  }, [activeTeamMatch]);

  // Quick Match Handlers
  const handleStartMatch = (matchData) => {
    setActiveMatch(matchData);
    navigate('/match');
  };

  const handlePlayKnockoutMatch = (tournament, event, match) => {
    if (tournament.format === 'league-knockout' || event.format === 'team-tie') {
      const tie = tieFromBracketMatch(tournament, event, match);
      if (!tie) return;
      setActiveTeamMatch(tie);
      navigate('/team-dashboard');
      return;
    }

    const matchData = {
      ...matchToScoreboard(event, match),
      knockout: {
        tournamentId: tournament.id,
        eventId: event.id,
        matchId: match.id,
        roundName: match.roundName
      }
    };
    setActiveMatch(matchData);
    navigate('/match');
  };

  const handleOpenLeagueTie = (tie) => {
    setActiveTeamMatch({
      ...tie,
      league: {
        ...(tie.league || {}),
        tournamentId: tie.league?.tournamentId,
        tieId: tie.id,
        viewOnly: tie.status === 'completed'
      }
    });
    navigate('/team-dashboard');
  };

  const handleKnockoutMatchComplete = (finalMatchData) => {
    const info = finalMatchData.knockout;
    const tournament = getTournament(info.tournamentId);
    if (!tournament) {
      clearCurrentMatch();
      setActiveMatch(null);
      navigate('/');
      return;
    }

    const eventIndex = tournament.events.findIndex(event => event.id === info.eventId);
    if (eventIndex < 0) {
      navigate(`/knockout/${tournament.id}`);
      return;
    }

    saveKnockoutTournament(recordKnockoutResult(tournament, {
      eventId: info.eventId,
      matchId: info.matchId,
      score1: finalMatchData.score1,
      score2: finalMatchData.score2,
      history: finalMatchData.history
    }));
    clearCurrentMatch();
    setActiveMatch(null);
    navigate(`/knockout/${tournament.id}`);
  };

  const handleMatchComplete = (finalMatchData) => {
    if (finalMatchData?.knockout) {
      handleKnockoutMatchComplete(finalMatchData);
      return;
    }
    if (activeTeamMatch) {
      setActiveTeamMatch(applyGameToTie(activeTeamMatch, finalMatchData));
      setActiveMatch(null);
      navigate('/team-dashboard');
    } else {
      saveMatch(finalMatchData);
      clearCurrentMatch();
      setActiveMatch(null);
      navigate('/history');
    }
  };

  const handleCancelMatch = async () => {
    const confirmed = await askConfirm('Are you sure you want to cancel the current match? Progress will be lost.');
    if (confirmed) {
      if (activeMatch?.knockout) {
        const tournamentId = activeMatch.knockout.tournamentId;
        clearCurrentMatch();
        setActiveMatch(null);
        navigate(`/knockout/${tournamentId}`);
      } else if (activeTeamMatch) {
        setActiveMatch(null);
        navigate('/team-dashboard');
      } else {
        clearCurrentMatch();
        setActiveMatch(null);
        navigate('/');
      }
    }
  };

  // Team Match Handlers
  const handleStartTeamMatch = (teamMatchData) => {
    // Keep the draft saved so it remains in "Upcoming Team Matches"
    // Ensure scores are numbers
    const sanitizedData = {
      ...teamMatchData,
      scoreA: Number(teamMatchData.scoreA) || 0,
      scoreB: Number(teamMatchData.scoreB) || 0
    };
    // Save/update the config to persist it
    saveTeamMatchConfig(sanitizedData);
    setSavedConfigs(getTeamMatchConfigs());
    setActiveTeamMatch(sanitizedData);
    navigate('/team-dashboard');
  };

  const handleSaveDraft = (teamMatchData) => {
    saveTeamMatchConfig(teamMatchData);
    setSavedConfigs(getTeamMatchConfigs());
    setActiveTeamMatch(null);
    navigate('/');
  };

  const handleLoadDraft = (config) => {
    setActiveTeamMatch(config);
    // If the config has matches with status (active match), go to dashboard
    // Otherwise, go to config page for editing
    const hasActiveMatches = config.matches && config.matches.length > 0 && config.matches.some(m => m.status);
    if (hasActiveMatches) {
      navigate('/team-dashboard');
    } else {
      navigate('/team-config');
    }
  };

  const handlePlayTeamMatchGame = (index) => {
    if (activeTeamMatch?.league?.viewOnly) return;
    const matchData = toScoreboardMatch(activeTeamMatch.matches[index]);

    // Update current index in team match
    setActiveTeamMatch(prev => ({ ...prev, currentMatchIndex: index }));
    setActiveMatch(matchData);
    navigate('/match');
  };

  const handleFinishTeamMatch = () => {
    const league = activeTeamMatch?.league;
    if (league?.matchId && league?.tournamentId) {
      const tournament = getTournament(league.tournamentId);
      if (tournament) {
        saveKnockoutTournament(recordKnockoutResult(tournament, {
          eventId: league.eventId,
          matchId: league.matchId,
          score1: activeTeamMatch.scoreA,
          score2: activeTeamMatch.scoreB
        }));
      }
      clearCurrentTeamMatch();
      setActiveTeamMatch(null);
      navigate(`/knockout/${league.tournamentId}`);
      return;
    }

    if (league?.viewOnly && league?.tieId) {
      clearCurrentTeamMatch();
      setActiveTeamMatch(null);
      navigate(`/league/${league.tournamentId}`);
      return;
    }

    if (league?.tieId && league?.tournamentId) {
      const tournament = getTournament(league.tournamentId);
      if (tournament) {
        saveKnockoutTournament(applyTieResult(tournament, league.tieId, activeTeamMatch));
      }
      clearCurrentTeamMatch();
      setActiveTeamMatch(null);
      navigate(`/league/${league.tournamentId}`);
      return;
    }

    if (league?.tournamentId) {
      clearCurrentTeamMatch();
      setActiveTeamMatch(null);
      navigate(`/league/${league.tournamentId}`);
      return;
    }

    saveTeamMatch(activeTeamMatch);
    clearCurrentTeamMatch();
    setActiveTeamMatch(null);
    navigate('/history');
  };

  const handleScheduleChange = (schedule) => {
    setActiveTeamMatch(prev => (prev ? { ...prev, schedule } : prev));
  };

  const handleAddPlayer = (teamId, playerName) => {
    if (!activeTeamMatch) return;
    ensurePlayer(playerName);
    setActiveTeamMatch(prev => {
      const teamKey = teamId === 'A' ? 'teamA' : 'teamB';
      return {
        ...prev,
        [teamKey]: {
          ...prev[teamKey],
          players: [...prev[teamKey].players, playerName]
        }
      };
    });
  };

  const value = {
    activeMatch, activeTeamMatch, savedConfigs, setActiveTeamMatch,
    handleStartMatch, handlePlayKnockoutMatch, handleOpenLeagueTie,
    handleMatchComplete, handleCancelMatch, handleStartTeamMatch,
    handleSaveDraft, handleLoadDraft, handlePlayTeamMatchGame,
    handleFinishTeamMatch, handleScheduleChange, handleAddPlayer
  };

  return <MatchSessionContext.Provider value={value}>{children}</MatchSessionContext.Provider>;
};

