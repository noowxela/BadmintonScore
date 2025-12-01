import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import MatchSetup from './pages/MatchSetup';
import History from './pages/History';
import Stats from './pages/Stats';
import MatchupConfig from './pages/MatchupConfig';
import TeamMatchDashboard from './pages/TeamMatchDashboard';
import ScoreBoard from './components/ScoreBoard';
import {
  saveMatch, saveCurrentMatch, getCurrentMatch, clearCurrentMatch,
  saveTeamMatch, saveCurrentTeamMatch, getCurrentTeamMatch, clearCurrentTeamMatch,
  saveTeamMatchConfig, getTeamMatchConfigs, deleteTeamMatchConfig, getTeamMatchHistory
} from './utils/storage';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMatch, setActiveMatch] = useState(null);
  const [activeTeamMatch, setActiveTeamMatch] = useState(null);
  const [savedConfigs, setSavedConfigs] = useState([]);

  useEffect(() => {
    // Check for saved match on load
    const savedMatch = getCurrentMatch();
    if (savedMatch) {
      setActiveMatch(savedMatch);
      if (location.pathname === '/') navigate('/match');
    } else {
      const savedTeamMatch = getCurrentTeamMatch();
      if (savedTeamMatch && savedTeamMatch.matches) {
        // Ensure scores are numbers
        savedTeamMatch.scoreA = Number(savedTeamMatch.scoreA) || 0;
        savedTeamMatch.scoreB = Number(savedTeamMatch.scoreB) || 0;
        setActiveTeamMatch(savedTeamMatch);
        if (location.pathname === '/') navigate('/team-dashboard');
      }
    }
    // Load saved configs
    setSavedConfigs(getTeamMatchConfigs());
  }, []);

  useEffect(() => {
    if (activeMatch && !activeTeamMatch) {
      saveCurrentMatch(activeMatch);
    }
  }, [activeMatch, activeTeamMatch]);

  useEffect(() => {
    if (activeTeamMatch) {
      saveCurrentTeamMatch(activeTeamMatch);
    }
  }, [activeTeamMatch]);

  // Quick Match Handlers
  const handleStartMatch = (matchData) => {
    setActiveMatch(matchData);
    navigate('/match');
  };

  const handleMatchComplete = (finalMatchData) => {
    if (activeTeamMatch) {
      // Update team match state
      const newMatches = [...activeTeamMatch.matches];
      newMatches[activeTeamMatch.currentMatchIndex] = { ...finalMatchData, status: 'completed' };

      const winner = finalMatchData.score1 > finalMatchData.score2 ? 1 : 2;
      const currentScoreA = Number(activeTeamMatch.scoreA) || 0;
      const currentScoreB = Number(activeTeamMatch.scoreB) || 0;
      const newScoreA = winner === 1 ? currentScoreA + 1 : currentScoreA;
      const newScoreB = winner === 2 ? currentScoreB + 1 : currentScoreB;

      const updatedTeamMatch = {
        ...activeTeamMatch,
        matches: newMatches,
        scoreA: newScoreA,
        scoreB: newScoreB,
        currentMatchIndex: null
      };

      setActiveTeamMatch(updatedTeamMatch);
      setActiveMatch(null);
      navigate('/team-dashboard');
    } else {
      saveMatch(finalMatchData);
      clearCurrentMatch();
      setActiveMatch(null);
      navigate('/history');
    }
  };

  const handleCancelMatch = () => {
    if (window.confirm('Are you sure you want to cancel the current match? Progress will be lost.')) {
      if (activeTeamMatch) {
        setActiveMatch(null);
        navigate('/team-dashboard');
      } else {
        clearCurrentMatch();
        setActiveMatch(null);
        navigate('/');
      }
    }
  };

  const handleNavigateHome = (finalMatchData) => {
    if (activeTeamMatch) {
      // Update team match state
      const newMatches = [...activeTeamMatch.matches];
      newMatches[activeTeamMatch.currentMatchIndex] = { ...finalMatchData, status: 'completed' };

      const winner = finalMatchData.score1 > finalMatchData.score2 ? 1 : 2;
      const currentScoreA = Number(activeTeamMatch.scoreA) || 0;
      const currentScoreB = Number(activeTeamMatch.scoreB) || 0;
      const newScoreA = winner === 1 ? currentScoreA + 1 : currentScoreA;
      const newScoreB = winner === 2 ? currentScoreB + 1 : currentScoreB;

      const updatedTeamMatch = {
        ...activeTeamMatch,
        matches: newMatches,
        scoreA: newScoreA,
        scoreB: newScoreB,
        currentMatchIndex: null
      };

      // Save to storage so it persists in "Upcoming Team Matches"
      saveTeamMatchConfig(updatedTeamMatch);
      // Clear active state to return home
      setActiveTeamMatch(null);
      navigate('/');
    } else {
      saveMatch(finalMatchData);
      clearCurrentMatch();
      setActiveMatch(null);
      navigate('/');
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
    const matchToPlay = activeTeamMatch.matches[index];
    const matchData = {
      ...matchToPlay,
      player1: matchToPlay.p1,
      player2: matchToPlay.p2,
      player3: matchToPlay.p3,
      player4: matchToPlay.p4,
      score1: matchToPlay.score1 || 0,
      score2: matchToPlay.score2 || 0,
      history: matchToPlay.history || []
    };

    // Update current index in team match
    setActiveTeamMatch(prev => ({ ...prev, currentMatchIndex: index }));
    setActiveMatch(matchData);
    navigate('/match');
  };

  const handleFinishTeamMatch = () => {
    saveTeamMatch(activeTeamMatch);
    clearCurrentTeamMatch();
    setActiveTeamMatch(null);
    navigate('/history');
  };

  const handleAddPlayer = (teamId, playerName) => {
    if (!activeTeamMatch) return;

    setActiveTeamMatch(prev => {
      const teamKey = teamId === 'A' ? 'teamA' : 'teamB';
      const updatedTeam = {
        ...prev[teamKey],
        players: [...prev[teamKey].players, playerName]
      };
      return {
        ...prev,
        [teamKey]: updatedTeam
      };
    });
  };



  const isMatchScreen = location.pathname === '/match';

  return (
    <div className="container" style={isMatchScreen ? { padding: 0, maxWidth: '100%', height: '100dvh', overflow: 'hidden' } : {}}>
      {!isMatchScreen && (
        <header className="header">
          <div className="title" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            Badminton<span style={{ color: 'var(--color-text)' }}>Score</span>
          </div>
          {location.pathname !== '/' && location.pathname !== '/team-dashboard' && (
            <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ padding: '0.5rem' }}>
              Back
            </button>
          )}
        </header>
      )}

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={
            <Home
              activeMatch={activeMatch}
              activeTeamMatch={activeTeamMatch}
              savedConfigs={savedConfigs}
              setActiveTeamMatch={setActiveTeamMatch}
              handleLoadDraft={handleLoadDraft}
            />
          } />
          <Route path="/setup" element={<MatchSetup onStartMatch={handleStartMatch} onCancel={() => navigate('/')} />} />
          <Route path="/match" element={
            <ScoreBoard
              match={activeMatch}
              onMatchComplete={handleMatchComplete}
              onCancel={handleCancelMatch}
              onNavigateHome={handleNavigateHome}
              hasMoreMatches={activeTeamMatch && activeTeamMatch.matches.some((m, i) => i !== activeTeamMatch.currentMatchIndex && m.status !== 'completed')}
              teamAName={activeTeamMatch ? activeTeamMatch.teamA.name : 'Team 1'}
              teamBName={activeTeamMatch ? activeTeamMatch.teamB.name : 'Team 2'}
            />
          } />
          <Route path="/history" element={<History />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/team-config" element={
            <MatchupConfig
              teams={activeTeamMatch}
              onStartMatch={handleStartTeamMatch}
              onSaveDraft={handleSaveDraft}
              onBack={() => navigate('/')}
              onAddPlayer={handleAddPlayer}
            />
          } />
          <Route path="/team-dashboard" element={
            <TeamMatchDashboard
              teamMatch={activeTeamMatch}
              onPlayMatch={handlePlayTeamMatchGame}
              onFinishTeamMatch={handleFinishTeamMatch}
            />
          } />
        </Routes>
      </main>

      {/* Footer */}
      {!isMatchScreen && (
        <footer style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
          <p>© {new Date().getFullYear()} Badminton Score Recorder</p>
        </footer>
      )}
    </div>
  );
}

export default App;
