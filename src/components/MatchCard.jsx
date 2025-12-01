import React from 'react';
import { Play, CheckCircle } from 'lucide-react';

const MatchCard = ({ match, index, onPlayMatch }) => {
    return (
        <div style={{
            backgroundColor: 'var(--color-surface)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: match.status === 'active' ? '1px solid var(--color-primary)' : '1px solid transparent',
            opacity: match.status === 'pending' ? 0.7 : 1
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                <div>Match {index + 1} • <span style={{ textTransform: 'capitalize' }}>{match.type}</span></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                    <div style={{
                        fontWeight: match.score1 > match.score2 ? 700 : 400,
                        color: match.score1 > match.score2 ? 'var(--color-primary)' : 'inherit',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem'
                    }}>
                        <div>{match.p1}</div>
                        {match.p3 && <div>{match.p3}</div>}
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
                            {match.status === 'active' ? 'Resume' : 'Start'} <Play size={14} style={{ marginLeft: '0.5rem' }} />
                        </button>
                    </div>
                )}

                <div style={{ flex: 1, textAlign: 'right' }}>
                    <div style={{
                        fontWeight: match.score2 > match.score1 ? 700 : 400,
                        color: match.score2 > match.score1 ? 'var(--color-primary)' : 'inherit',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                        alignItems: 'flex-end'
                    }}>
                        <div>{match.p2}</div>
                        {match.p4 && <div>{match.p4}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatchCard;
