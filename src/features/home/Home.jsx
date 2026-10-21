import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, History as HistoryIcon, BarChart2, Activity, Users, FileText, Edit, Trophy, UserRound, Database } from 'lucide-react';
import { getKnockoutTournaments, getTeamMatchHistory } from '../../utils/storage';
import { ensureLaksaBowl50, LAKSA_BOWL_ID, LEAGUE_LOGO } from '../../data/laksaBowl50';

const Home = ({
    activeMatch,
    activeTeamMatch,
    savedConfigs,
    setActiveTeamMatch,
    handleLoadDraft
}) => {
    const navigate = useNavigate();
    const completedTeamMatches = getTeamMatchHistory().sort((a, b) => new Date(b.date) - new Date(a.date));
    const knockoutTournaments = getKnockoutTournaments().sort((a, b) => new Date(b.lastModified || b.date) - new Date(a.lastModified || a.date));
    const [showCompetitionModes, setShowCompetitionModes] = React.useState(false);
    const otherKnockouts = knockoutTournaments.filter(tournament => tournament.id !== LAKSA_BOWL_ID);

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
        <div className="sx-49" >
            {showCompetitionModes && (
                <div className="sx-50"  onClick={() => setShowCompetitionModes(false)}>
                    <div className="sx-51"  onClick={e => e.stopPropagation()}>
                        <h3 className="sx-52" >Select Competition Mode</h3>

                        <button
                            className="btn btn-primary btn-block sx-53"
                            
                            onClick={handleFriendlyMatch}
                        >
                            <Users size={20} />
                            Friendly Match
                        </button>

                        <button
                            className="btn btn-secondary btn-block sx-53"
                            
                            onClick={() => navigate('/knockout-setup')}
                        >
                            <Trophy size={20} />
                            Elimination
                        </button>

                        <button
                            className="btn btn-secondary btn-block sx-53"
                            onClick={() => navigate('/league-setup')}
                        >
                            <Trophy size={20} />
                            League
                        </button>

                        <button
                            className="btn btn-secondary btn-block sx-54"
                            
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
                    <p className="sx-55" >Start a single game</p>
                </div>
                <div className="nav-card" onClick={() => setShowCompetitionModes(true)}>
                    <Trophy size={32} />
                    <h3>Competition</h3>
                    <p className="sx-55" >Tournaments & Team Matches</p>
                </div>
                {activeMatch && !activeTeamMatch && (
                    <div className="nav-card sx-56" onClick={() => navigate('/match')} >
                        <Activity size={32} color="var(--color-accent)" />
                        <h3>Resume Match</h3>
                        <p className="sx-55" >Continue your game</p>
                    </div>
                )}
                <div className="nav-card" onClick={() => navigate('/history')}>
                    <HistoryIcon size={32} />
                    <h3>History</h3>
                    <p className="sx-55" >View past match records</p>
                </div>
                <div className="nav-card" onClick={() => navigate('/stats')}>
                    <BarChart2 size={32} />
                    <h3>Statistics</h3>
                    <p className="sx-55" >Player performance stats</p>
                </div>
                <div className="nav-card" onClick={() => navigate('/players')}>
                    <UserRound size={32} />
                    <h3>Players</h3>
                    <p className="sx-55" >Roster, aliases & merges</p>
                </div>
                <div className="nav-card" onClick={() => navigate('/data')}>
                    <Database size={32} />
                    <h3>Backup</h3>
                    <p className="sx-55" >Export & restore data</p>
                </div>
            </div>

            <div
                className="card sx-57"
                
                onClick={() => {
                    ensureLaksaBowl50();
                    navigate(`/league/${LAKSA_BOWL_ID}`);
                }}
            >
                    <div className="sx-58" >EXAMPLE LEAGUE</div>
                    <img src={LEAGUE_LOGO} alt="LAKSA BOWL 2026" className="home-league-logo" />
                    <div className="sx-59" >
                        Laksa group internal match · 9 teams · Group A/B · winner pool + loser pool
                    </div>
            </div>

            {otherKnockouts.length > 0 && (
                <div>
                    <h3 className="sx-60" >
                        <Trophy size={20} /> Knockout brackets
                    </h3>
                    <div className="sx-61" >
                        {otherKnockouts.map(tournament => (
                            <div
                                key={tournament.id}
                                className="card sx-62"
                                
                                onClick={() => navigate(tournament.format === 'league-knockout' ? `/league/${tournament.id}` : `/knockout/${tournament.id}`)}
                            >
                                <div>
                                    <div className="sx-63" >{tournament.title}</div>
                                    <div className="sx-55" >
                                        {tournament.date} • {tournament.events?.length || 0} {(tournament.events?.length || 0) === 1 ? 'category' : 'categories'}
                                    </div>
                                </div>
                                <button className="btn btn-secondary sx-64" >
                                    Open
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {savedConfigs.length > 0 && (
                <div>
                    <h3 className="sx-60" >
                        <FileText size={20} /> Upcoming Team Matches
                    </h3>
                    <div className="sx-61" >
                        {savedConfigs.map(config => {
                            const hasActiveMatches = config.matches && config.matches.length > 0 && config.matches.some(m => m.status);
                            const completedMatches = config.matches ? config.matches.filter(m => m.status === 'completed').length : 0;
                            const totalMatches = config.matches ? config.matches.length : 0;
                            const matchStatus = hasActiveMatches ? `In Progress (${completedMatches}/${totalMatches})` : 'Draft';

                            return (
                                <div key={config.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderLeft: hasActiveMatches ? '4px solid var(--color-accent)' : 'none' }}>
                                    <div>
                                        <div className="sx-63" >{config.title}</div>
                                        <div className="sx-55" >
                                            {new Date(config.date).toLocaleDateString()} • {config.teamA.name} vs {config.teamB.name}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: hasActiveMatches ? 'var(--color-accent)' : 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                            {matchStatus}
                                        </div>
                                    </div>
                                    <button className="btn btn-secondary sx-65"  onClick={() => handleLoadDraft(config)}>
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
                    <h3 className="sx-60" >
                        <Trophy size={20} /> Team Match History
                    </h3>
                    <div className="sx-61" >
                        {completedTeamMatches.slice(0, 5).map(match => (
                            <div
                                key={match.id}
                                className="card sx-66"
                                
                                onClick={() => navigate('/history')}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                            >
                                <div className="sx-67" >
                                    <div className="sx-68" >{match.title}</div>
                                    <div className="sx-11" >
                                        {new Date(match.date).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="sx-36" >
                                    <div style={{ flex: 1, color: match.scoreA > match.scoreB ? 'var(--color-primary)' : 'inherit' }}>
                                        {match.teamA.name}
                                    </div>
                                    <div className="sx-69" >
                                        <span style={{ color: match.scoreA > match.scoreB ? 'var(--color-primary)' : 'inherit' }}>{match.scoreA}</span>
                                        <span className="sx-39" >-</span>
                                        <span style={{ color: match.scoreB > match.scoreA ? 'var(--color-primary)' : 'inherit' }}>{match.scoreB}</span>
                                    </div>
                                    <div style={{ flex: 1, textAlign: 'right', color: match.scoreB > match.scoreA ? 'var(--color-primary)' : 'inherit' }}>
                                        {match.teamB.name}
                                    </div>
                                </div>
                                <div className="sx-70" >
                                    {match.matches?.length || 0} matches played
                                </div>
                            </div>
                        ))}
                    </div>
                    {completedTeamMatches.length > 5 && (
                        <button
                            className="btn btn-secondary sx-71"
                            
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
