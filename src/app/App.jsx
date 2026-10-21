import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Home from '../features/home/Home';
import MatchSetup from '../features/quick-match/MatchSetup';
import History from '../features/history/History';
import Stats from '../features/stats/Stats';
import Players from '../features/players/Players';
import DataBackup from '../features/backup/DataBackup';
import MatchupConfig from '../features/team-match/MatchupConfig';
import TeamMatchDashboard from '../features/team-match/TeamMatchDashboard';
import KnockoutSetup from '../features/knockout/KnockoutSetup';
import KnockoutBracket from '../features/knockout/KnockoutBracket';
import LeagueDashboard from '../features/league/LeagueDashboard';
import LeagueTimetable from '../features/league/LeagueTimetable';
import LeagueSetup from '../features/league/LeagueSetup';
import ScoreBoard from '../features/quick-match/ScoreBoard';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { MatchSessionProvider } from '../state/MatchSessionContext';
import { useMatchSession } from '../state/sessionContext';

const AppShell = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const session = useMatchSession();
  const {
    activeMatch, activeTeamMatch, savedConfigs, setActiveTeamMatch,
    handleStartMatch, handlePlayKnockoutMatch, handleOpenLeagueTie,
    handleMatchComplete, handleCancelMatch, handleStartTeamMatch,
    handleSaveDraft, handleLoadDraft, handlePlayTeamMatchGame,
    handleFinishTeamMatch, handleScheduleChange, handleAddPlayer
  } = session;

  const isMatchScreen = location.pathname === '/match';
  const isBracketScreen = location.pathname.startsWith('/knockout/');
  const isLeagueScreen = location.pathname.startsWith('/league/');
  const isImmersive = isMatchScreen || isBracketScreen || isLeagueScreen;

  return (
    <div className={isImmersive ? 'container immersive' : 'container'}>
      {!isImmersive && (
        <header className="header">
          <div className="title title-link" onClick={() => navigate('/')}>
            Badminton<span className="title-plain">Score</span>
          </div>
          {location.pathname !== '/' && location.pathname !== '/team-dashboard' && (
            <button className="btn btn-secondary btn-icon" onClick={() => navigate('/')}>
              Back
            </button>
          )}
        </header>
      )}

      <main className="main-fill">
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
            activeMatch ? (
              <ScoreBoard
                key={activeMatch.knockout?.matchId || 'match'}
                match={activeMatch}
                onMatchComplete={handleMatchComplete}
                onCancel={handleCancelMatch}
                hasMoreMatches={activeTeamMatch && activeTeamMatch.matches.some((m, i) => i !== activeTeamMatch.currentMatchIndex && m.status !== 'completed')}
                teamAName={activeMatch.knockout ? (activeMatch.pair1Name || 'Pair 1') : (activeTeamMatch ? activeTeamMatch.teamA.name : 'Team 1')}
                teamBName={activeMatch.knockout ? (activeMatch.pair2Name || 'Pair 2') : (activeTeamMatch ? activeTeamMatch.teamB.name : 'Team 2')}
              />
            ) : null
          } />
          <Route path="/knockout-setup" element={<KnockoutSetup />} />
          <Route path="/knockout/:id" element={<KnockoutBracket onPlayMatch={handlePlayKnockoutMatch} />} />
          <Route path="/league-setup" element={<LeagueSetup />} />
          <Route path="/league/:id/timetable" element={<LeagueTimetable />} />
          <Route path="/league/:id" element={<LeagueDashboard onOpenTie={handleOpenLeagueTie} />} />
          <Route path="/history" element={<History />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/players" element={<Players />} />
          <Route path="/data" element={<DataBackup />} />
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
              onScheduleChange={handleScheduleChange}
            />
          } />
        </Routes>
      </main>
      <ConfirmDialog />
      {!isImmersive && (
        <footer className="app-footer">
          <p>© {new Date().getFullYear()} BadmintonScore</p>
        </footer>
      )}
    </div>
  );
};

const App = () => (
  <MatchSessionProvider>
    <AppShell />
  </MatchSessionProvider>
);

export default App;
