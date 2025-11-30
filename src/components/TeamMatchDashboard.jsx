import React from 'react';
import { Play, CheckCircle, Trophy } from 'lucide-react';

const TeamMatchDashboard = ({ teamMatch, onPlayMatch, onFinishTeamMatch }) => {
    const { teamA, teamB, matches, scoreA, scoreB } = teamMatch;

    if (!matches) return <div>Loading...</div>;

    const isComplete = matches.every(m => m.status === 'completed');
    const winner = scoreA > scoreB ? teamA.name : (scoreB > scoreA ? teamB.name : 'Draw');

    return (
        <div className="container" style={{ padding: 0, maxWidth: '100%' }}>
            {/* Header / Score Display */}
            <div style={{
                backgroundColor: 'var(--color-surface)',
                padding: '2rem 1rem',
                textAlign: 'center',
                borderBottom: '1px solid #334155',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
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

            <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Match Schedule</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {matches.map((match, index) => (
                        <div key={index} style={{
                            backgroundColor: 'var(--color-surface)',
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            border: match.status === 'active' ? '1px solid var(--color-primary)' : '1px solid transparent',
                            opacity: match.status === 'pending' ? 0.7 : 1
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                <div>Match {index + 1} • <span style={{ textTransform: 'capitalize' }}>{match.type}</span></div>
                                {match.status === 'completed' && <CheckCircle size={16} color="var(--color-primary)" />}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: match.score1 > match.score2 ? 700 : 400, color: match.score1 > match.score2 ? 'var(--color-primary)' : 'inherit' }}>
                                        {match.p1}
                                        {match.p3 && ` & ${match.p3}`}
                                    </div>
                                </div>

                                {match.status === 'completed' ? (
                                    <div style={{ padding: '0 1rem', fontWeight: 700, fontSize: '1.25rem' }}>
                                        <span style={{ color: match.score1 > match.score2 ? 'var(--color-primary)' : 'inherit' }}>{match.score1}</span>
                                        <span style={{ color: 'var(--color-text-muted)', margin: '0 0.25rem' }}>-</span>
                                        <span style={{ color: match.score2 > match.score1 ? 'var(--color-primary)' : 'inherit' }}>{match.score2}</span>
                                    </div>
                                ) : (
                                    <div style={{ padding: '0 1rem' }}>
                                        <button
                                            className="btn btn-primary"
                                            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', width: 'auto' }}
                                            onClick={() => onPlayMatch(index)}
                                            disabled={match.status === 'completed'}
                                        >
                                            {match.status === 'active' ? 'Resume' : 'Play'} <Play size={14} style={{ marginLeft: '0.5rem' }} />
                                        </button>
                                    </div>
                                )}

                                <div style={{ flex: 1, textAlign: 'right' }}>
                                    <div style={{ fontWeight: match.score2 > match.score1 ? 700 : 400, color: match.score2 > match.score1 ? 'var(--color-primary)' : 'inherit' }}>
                                        {match.p2}
                                        {match.p4 && ` & ${match.p4}`}
                                    </div>
                                </div>
                            </div>
                        </div>
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
        </div>
    );
};

export default TeamMatchDashboard;
