import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { PlusCircle, History as HistoryIcon, BarChart2, Activity, Users, FileText, Edit, Trophy } from 'lucide-react';
import MatchSetup from './components/MatchSetup';
import ScoreBoard from './components/ScoreBoard';
import History from './components/History';
import Stats from './components/Stats';
import MatchupConfig from './components/MatchupConfig';
import TeamMatchDashboard from './components/TeamMatchDashboard';
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

  // Team Match Handlers
  const handleStartTeamMatch = (teamMatchData) => {
    // If this was a draft, remove it from saved configs
    if (teamMatchData.id) {
      deleteTeamMatchConfig(teamMatchData.id);
      setSavedConfigs(getTeamMatchConfigs());
    }
    // Ensure scores are numbers
    const sanitizedData = {
      ...teamMatchData,
      scoreA: Number(teamMatchData.scoreA) || 0,
      scoreB: Number(teamMatchData.scoreB) || 0
    };
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
    navigate('/team-config');
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

  const Home = () => {
    const completedTeamMatches = getTeamMatchHistory().sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="nav-grid">
          <div className="nav-card" onClick={() => navigate('/setup')}>
            <PlusCircle size={32} />
            <h3>Quick Match</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Start a single game</p>
          </div>
          <div className="nav-card" onClick={() => {
            setActiveTeamMatch({
              title: 'Team Match',
              date: new Date().toISOString().split('T')[0],
              teamA: { name: 'Team A', players: [] },
              teamB: { name: 'Team B', players: [] },
              matches: []
            });
            navigate('/team-config');
          }}>
            <Users size={32} />
            <h3>Team Match</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Team A vs Team B series</p>
          </div>
          {activeMatch && !activeTeamMatch && (
            <div className="nav-card" onClick={() => navigate('/match')} style={{ borderColor: 'var(--color-accent)' }}>
              <Activity size={32} color="var(--color-accent)" />
              <h3>Resume Match</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Continue your game</p>
            </div>
          )}
          {activeTeamMatch && activeTeamMatch.matches && (
            <div className="nav-card" onClick={() => navigate('/team-dashboard')} style={{ borderColor: 'var(--color-accent)' }}>
              <Activity size={32} color="var(--color-accent)" />
              <h3>Resume Team Match</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Continue team series</p>
            </div>
          )}
          <div className="nav-card" onClick={() => navigate('/history')}>
            <HistoryIcon size={32} />
            <h3>History</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>View past match records</p>
          </div>
          <div className="nav-card" onClick={() => navigate('/stats')}>
            <BarChart2 size={32} />
            <h3>Statistics</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Player performance stats</p>
          </div>
        </div>

        {savedConfigs.length > 0 && (
          <div>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} /> Saved Drafts
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {savedConfigs.map(config => (
                <div key={config.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{config.title}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                      {new Date(config.date).toLocaleDateString()} • {config.teamA.name} vs {config.teamB.name}
                    </div>
                  </div>
                  <button className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem' }} onClick={() => handleLoadDraft(config)}>
                    <Edit size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {completedTeamMatches.length > 0 && (
          <div>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trophy size={20} /> Team Match History
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {completedTeamMatches.slice(0, 5).map(match => (
                <div
                  key={match.id}
                  className="card"
                  style={{
                    padding: '1rem',
                    borderLeft: '4px solid var(--color-accent)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                  onClick={() => navigate('/history')}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 600 }}>{match.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {new Date(match.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1, color: match.scoreA > match.scoreB ? 'var(--color-primary)' : 'inherit' }}>
                      {match.teamA.name}
                    </div>
                    <div style={{ padding: '0 1rem', fontWeight: 700, fontSize: '1.125rem' }}>
                      <span style={{ color: match.scoreA > match.scoreB ? 'var(--color-primary)' : 'inherit' }}>{match.scoreA}</span>
                      <span style={{ color: 'var(--color-text-muted)', margin: '0 0.25rem' }}>-</span>
                      <span style={{ color: match.scoreB > match.scoreA ? 'var(--color-primary)' : 'inherit' }}>{match.scoreB}</span>
                    </div>
                    <div style={{ flex: 1, textAlign: 'right', color: match.scoreB > match.scoreA ? 'var(--color-primary)' : 'inherit' }}>
                      {match.teamB.name}
                    </div>
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {match.matches?.length || 0} matches played
                  </div>
                </div>
              ))}
            </div>
            {completedTeamMatches.length > 5 && (
              <button
                className="btn btn-secondary"
                style={{ marginTop: '1rem', width: '100%' }}
                onClick={() => navigate('/history')}
              >
                View All ({completedTeamMatches.length})
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container">
      <header className="header">
        <div className="title" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          Badminton<span style={{ color: 'var(--color-text)' }}>Score</span>
        </div>
        {location.pathname !== '/' && location.pathname !== '/match' && location.pathname !== '/team-dashboard' && (
          <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ padding: '0.5rem' }}>
            Back
          </button>
        )}
      </header>

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/setup" element={<MatchSetup onStartMatch={handleStartMatch} onCancel={() => navigate('/')} />} />
          <Route path="/match" element={
            <ScoreBoard
              match={activeMatch}
              onMatchComplete={handleMatchComplete}
              onCancel={handleCancelMatch}
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

      <footer style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
        <p>© {new Date().getFullYear()} Badminton Score Recorder</p>
      </footer>
    </div>
  );
}

export default App;
