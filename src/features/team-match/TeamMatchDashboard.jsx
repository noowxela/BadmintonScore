import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Trophy, LayoutList, CalendarClock } from 'lucide-react';
import MatchCard from './MatchCard';
import MatchScheduler from './MatchScheduler';

const TeamMatchDashboard = ({ teamMatch, onPlayMatch, onFinishTeamMatch, onScheduleChange }) => {
    const [activeTab, setActiveTab] = useState('lineup'); // 'lineup' or 'scheduler'
    const [redirectEmpty] = useState(() => teamMatch == null);

    if (!teamMatch) {
        return redirectEmpty ? <Navigate to="/" replace /> : null;
    }

    const { teamA, teamB, matches, scoreA, scoreB } = teamMatch;

    if (!matches) return <div>Loading...</div>;

    const isComplete = matches.every(m => m.status === 'completed');
    const winner = scoreA > scoreB ? teamA.name : (scoreB > scoreA ? teamB.name : 'Draw');

    return (
        <div className="container sx-200" >
            {/* Header / Score Display */}
            <div className="sx-201" >
                <div className="sx-79" >
                    <button
                        className="btn btn-secondary sx-65"
                        
                        onClick={() => window.history.back()}
                    >
                        Back
                    </button>
                    <div className="sx-202" >
                        <h2 className="sx-203" >{teamMatch.title || 'Team Match'}</h2>
                        <p className="sx-204" >
                            {new Date(teamMatch.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <div className="sx-205" ></div> {/* Spacer for centering */}
                </div>

                <div className="sx-109" >
                    <div className="sx-37" >
                        <div className="sx-206" >
                            {teamA.name}
                        </div>
                        <div className="sx-207" >
                            {scoreA}
                        </div>
                    </div>

                    <div className="sx-112" >-</div>

                    <div className="sx-37" >
                        <div className="sx-208" >
                            {teamB.name}
                        </div>
                        <div className="sx-207" >
                            {scoreB}
                        </div>
                    </div>
                </div>

                {isComplete && (
                    <div className="sx-209" >
                        <Trophy size={20} color="gold" />
                        {winner} Wins!
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="sx-210" >
                <button
                    style={{
                        flex: 1,
                        padding: '1rem',
                        backgroundColor: activeTab === 'lineup' ? 'rgba(255,255,255,0.05)' : 'transparent',
                        borderBottom: activeTab === 'lineup' ? '2px solid var(--color-primary)' : '2px solid transparent',
                        color: activeTab === 'lineup' ? 'var(--color-text)' : 'var(--color-text-muted)',
                        fontWeight: activeTab === 'lineup' ? 600 : 400,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        border: 'none'
                    }}
                    onClick={() => setActiveTab('lineup')}
                >
                    <LayoutList size={18} /> Match Lineup
                </button>
                <button
                    style={{
                        flex: 1,
                        padding: '1rem',
                        backgroundColor: activeTab === 'scheduler' ? 'rgba(255,255,255,0.05)' : 'transparent',
                        borderBottom: activeTab === 'scheduler' ? '2px solid var(--color-primary)' : '2px solid transparent',
                        color: activeTab === 'scheduler' ? 'var(--color-text)' : 'var(--color-text-muted)',
                        fontWeight: activeTab === 'scheduler' ? 600 : 400,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        border: 'none'
                    }}
                    onClick={() => setActiveTab('scheduler')}
                >
                    <CalendarClock size={18} /> Court Scheduler
                </button>
            </div>

            {/* Content Area */}
            <div className="sx-211" >
                {activeTab === 'lineup' ? (
                    <div className="sx-212" >
                        <h3 className="sx-213" >Match Schedule</h3>

                        <div className="sx-25" >
                            {matches.map((match, index) => (
                                <MatchCard
                                    key={index}
                                    match={match}
                                    index={index}
                                    viewOnly={Boolean(teamMatch.league?.viewOnly)}
                                    onPlayMatch={onPlayMatch}
                                />
                            ))}
                        </div>

                        {(isComplete || teamMatch.league?.viewOnly) && (
                            <button
                                className="btn btn-primary btn-block sx-199"
                                
                                onClick={onFinishTeamMatch}
                            >
                                {teamMatch.league?.matchId
                                  ? 'Save & Back to Bracket'
                                  : teamMatch.league
                                    ? 'Back to League'
                                    : 'Finish & Save Team Match'}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="sx-214" >
                        <MatchScheduler
                            matches={matches}
                            schedule={teamMatch.schedule}
                            onScheduleChange={onScheduleChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamMatchDashboard;
