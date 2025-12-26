import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, History as HistoryIcon, BarChart2, Activity, Users, FileText, Edit, Trophy } from 'lucide-react';
import { getTeamMatchHistory } from '../utils/storage';

const Home = ({
    activeMatch,
    activeTeamMatch,
    savedConfigs,
    setActiveTeamMatch,
    handleLoadDraft
}) => {
    const navigate = useNavigate();
    const completedTeamMatches = getTeamMatchHistory().sort((a, b) => new Date(b.date) - new Date(a.date));
    const [showCompetitionModes, setShowCompetitionModes] = React.useState(false);

    const handleFriendlyMatch = () => {
        setActiveTeamMatch({
            title: 'Team Match',
            date: new Date().toISOString().split('T')[0],
            teamA: { name: 'Team A', players: [] },
            teamB: { name: 'Team B', players: [] },
            matches: []
        });
        navigate('/team-config');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
            {showCompetitionModes && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }} onClick={() => setShowCompetitionModes(false)}>
                    <div style={{
                        backgroundColor: 'var(--color-surface)',
                        padding: '2rem',
                        borderRadius: '1rem',
                        width: '100%',
                        maxWidth: '400px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Select Competition Mode</h3>

                        <button
                            className="btn btn-primary"
                            style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            onClick={handleFriendlyMatch}
                        >
                            <Users size={20} />
                            Friendly Match
                        </button>

                        <button
                            className="btn btn-secondary"
                            style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: 0.7, cursor: 'not-allowed' }}
                            disabled
                        >
                            <Trophy size={20} />
                            Elimination (Coming Soon)
                        </button>

                        <button
                            className="btn btn-secondary"
                            style={{ marginTop: '0.5rem' }}
                            onClick={() => setShowCompetitionModes(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className="nav-grid">
                <div className="nav-card" onClick={() => navigate('/setup')}>
                    <PlusCircle size={32} />
                    <h3>Quick Match</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Start a single game</p>
                </div>
                <div className="nav-card" onClick={() => setShowCompetitionModes(true)}>
                    <Trophy size={32} />
                    <h3>Competition</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Tournaments & Team Matches</p>
                </div>
                {activeMatch && !activeTeamMatch && (
                    <div className="nav-card" onClick={() => navigate('/match')} style={{ borderColor: 'var(--color-accent)' }}>
                        <Activity size={32} color="var(--color-accent)" />
                        <h3>Resume Match</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Continue your game</p>
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
                        <FileText size={20} /> Upcoming Team Matches
                    </h3>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {savedConfigs.map(config => {
                            const hasActiveMatches = config.matches && config.matches.length > 0 && config.matches.some(m => m.status);
                            const completedMatches = config.matches ? config.matches.filter(m => m.status === 'completed').length : 0;
                            const totalMatches = config.matches ? config.matches.length : 0;
                            const matchStatus = hasActiveMatches ? `In Progress (${completedMatches}/${totalMatches})` : 'Draft';

                            return (
                                <div key={config.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderLeft: hasActiveMatches ? '4px solid var(--color-accent)' : 'none' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{config.title}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                            {new Date(config.date).toLocaleDateString()} • {config.teamA.name} vs {config.teamB.name}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: hasActiveMatches ? 'var(--color-accent)' : 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                            {matchStatus}
                                        </div>
                                    </div>
                                    <button className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem' }} onClick={() => handleLoadDraft(config)}>
                                        <Edit size={16} />
                                    </button>
                                </div>
                            );
                        })}
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

export default Home;
