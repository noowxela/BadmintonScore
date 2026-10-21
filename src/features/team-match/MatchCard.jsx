import React from 'react';
import { Play, CheckCircle } from 'lucide-react';

const MatchCard = ({ match, index, onPlayMatch, viewOnly = false }) => {
    return (
        <div style={{
            backgroundColor: 'var(--color-surface)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: match.status === 'active' ? '1px solid var(--color-primary)' : '1px solid transparent',
            opacity: match.status === 'pending' ? 0.7 : 1
        }}>
            <div className="sx-33" >
                <div>Match {index + 1} • <span className="sx-48" >{match.type}</span></div>
            </div>

            <div className="sx-36" >
                <div className="sx-37" >
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

                {match.status === 'completed' || viewOnly ? (
                    <div className="sx-38" >
                        <span style={{ color: match.score1 > match.score2 ? 'var(--color-primary)' : 'inherit' }}>{match.score1}</span>
                        <span className="sx-39" >-</span>
                        <span style={{ color: match.score2 > match.score1 ? 'var(--color-primary)' : 'inherit' }}>{match.score2}</span>
                    </div>
                ) : (
                    <div className="sx-141" >
                        <button
                            className="btn btn-primary sx-142"
                            
                            onClick={() => onPlayMatch(index)}
                            disabled={match.status === 'completed'}
                        >
                            {match.status === 'active' ? 'Resume' : 'Start'} <Play size={14} className="sx-143"  />
                        </button>
                    </div>
                )}

                <div className="sx-40" >
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
