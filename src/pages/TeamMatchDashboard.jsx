import React, { useState } from 'react';
import { Trophy, LayoutList, CalendarClock } from 'lucide-react';
import MatchCard from '../components/MatchCard';
import MatchScheduler from '../components/MatchScheduler';

const TeamMatchDashboard = ({ teamMatch, onPlayMatch, onFinishTeamMatch }) => {
    const { teamA, teamB, matches, scoreA, scoreB } = teamMatch;
    const [activeTab, setActiveTab] = useState('lineup'); // 'lineup' or 'scheduler'

    if (!matches) return <div>Loading...</div>;

    const isComplete = matches.every(m => m.status === 'completed');
    const winner = scoreA > scoreB ? teamA.name : (scoreB > scoreA ? teamB.name : 'Draw');

    return (
        <div className="container" style={{ padding: 0, maxWidth: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header / Score Display */}
            <div style={{
                backgroundColor: 'var(--color-surface)',
                padding: '1rem',
                textAlign: 'center',
                borderBottom: '1px solid #334155',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <button
                        className="btn btn-secondary"
                        style={{ width: 'auto', padding: '0.5rem' }}
                        onClick={() => window.history.back()}
                    >
                        Back
                    </button>
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{teamMatch.title || 'Team Match'}</h2>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
                            {new Date(teamMatch.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <div style={{ width: '40px' }}></div> {/* Spacer for centering */}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '600px', margin: '0 auto' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                            {teamA.name}
                        </div>
                        <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1 }}>
                            {scoreA}
                        </div>
                    </div>

                    <div style={{ padding: '0 1rem', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>-</div>

                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-accent)', marginBottom: '0.5rem' }}>
                            {teamB.name}
                        </div>
                        <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1 }}>
                            {scoreB}
                        </div>
                    </div>
                </div>

                {isComplete && (
                    <div style={{ marginTop: '1rem', color: 'var(--color-text)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Trophy size={20} color="gold" />
                        {winner} Wins!
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: 'var(--color-surface)'
            }}>
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
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {activeTab === 'lineup' ? (
                    <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto', width: '100%', overflowY: 'auto' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Match Schedule</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {matches.map((match, index) => (
                                <MatchCard
                                    key={index}
                                    match={match}
                                    index={index}
                                    onPlayMatch={onPlayMatch}
                                />
                            ))}
                        </div>

                        {isComplete && (
                            <button
                                className="btn btn-primary"
                                style={{ marginTop: '2rem' }}
                                onClick={onFinishTeamMatch}
                            >
                                Finish & Save Team Match
                            </button>
                        )}
                    </div>
                ) : (
                    <div style={{ padding: '1rem', height: '100%', overflow: 'hidden' }}>
                        <MatchScheduler matches={matches} teamMatchDate={teamMatch.date} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamMatchDashboard;
