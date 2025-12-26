import React, { useState, useEffect } from 'react';
import { RotateCcw, Save, Trophy, Home, ArrowLeftRight } from 'lucide-react';

const ScoreBoard = ({ match, onMatchComplete, onCancel, onNavigateHome, hasMoreMatches, teamAName = 'Team 1', teamBName = 'Team 2' }) => {
    const [currentMatch, setCurrentMatch] = useState(match);
    const [winner, setWinner] = useState(null);
    const [isSwapped, setIsSwapped] = useState(false);

    useEffect(() => {
        checkWinner(currentMatch.score1, currentMatch.score2);
    }, [currentMatch.score1, currentMatch.score2]);

    const checkWinner = (s1, s2) => {
        // Standard win: 21 points and 2 point lead
        if ((s1 >= 21 || s2 >= 21) && Math.abs(s1 - s2) >= 2) {
            setWinner(s1 > s2 ? 1 : 2);
        }
        // Max points cap at 30 (golden point)
        else if (s1 === 30 || s2 === 30) {
            setWinner(s1 > s2 ? 1 : 2);
        } else {
            setWinner(null);
        }
    };

    const addPoint = (team) => {
        if (winner) return;

        const newHistory = [...(currentMatch.history || []), { score1: currentMatch.score1, score2: currentMatch.score2 }];

        setCurrentMatch(prev => ({
            ...prev,
            score1: team === 1 ? prev.score1 + 1 : prev.score1,
            score2: team === 2 ? prev.score2 + 1 : prev.score2,
            history: newHistory
        }));
    };

    const undo = () => {
        if (!currentMatch.history || currentMatch.history.length === 0) return;

        const lastState = currentMatch.history[currentMatch.history.length - 1];
        const newHistory = currentMatch.history.slice(0, -1);

        setCurrentMatch(prev => ({
            ...prev,
            score1: lastState.score1,
            score2: lastState.score2,
            history: newHistory
        }));
        setWinner(null);
    };

    const handleFinish = () => {
        onMatchComplete(currentMatch);
    };

    const getPlayerNames = (team) => {
        if (team === 1) {
            if (currentMatch.type === 'singles') {
                return currentMatch.player1;
            }
            return (
                <>
                    <div>{currentMatch.player1}</div>
                    <div>{currentMatch.player3}</div>
                </>
            );
        }
        if (currentMatch.type === 'singles') {
            return currentMatch.player2;
        }
        return (
            <>
                <div>{currentMatch.player2}</div>
                <div>{currentMatch.player4}</div>
            </>
        );
    };

    const getTeamName = (team) => {
        return team === 1 ? teamAName : teamBName;
    };

    // Derived state for display based on swap
    const leftTeamId = isSwapped ? 2 : 1;
    const rightTeamId = isSwapped ? 1 : 2;

    const leftColor = leftTeamId === 1 ? 'var(--color-primary)' : 'var(--color-accent)';
    const rightColor = rightTeamId === 1 ? 'var(--color-primary)' : 'var(--color-accent)';

    return (
        <div className="container" style={{ padding: 0, maxWidth: '100%', height: '100dvh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
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
                {winner && (
                    <div style={{ marginTop: '1rem', color: 'var(--color-accent)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        Match Completed
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '600px', margin: '0 auto' }}>
                    {/* Left Side */}
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.75rem', color: leftColor, fontWeight: 600, marginBottom: '0.25rem' }}>
                            {getTeamName(leftTeamId)}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                            {getPlayerNames(leftTeamId)}
                        </div>
                        <div style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1, color: winner === leftTeamId ? leftColor : 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            {leftTeamId === 1 ? currentMatch.score1 : currentMatch.score2}
                        </div>
                    </div>

                    {/* Center Control */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ padding: '0 1rem', fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>-</div>
                        <button
                            onClick={() => setIsSwapped(!isSwapped)}
                            style={{
                                padding: '0.25rem',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                                color: 'var(--color-text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            title="Switch Position"
                        >
                            <ArrowLeftRight size={16} />
                        </button>
                    </div>

                    {/* Right Side */}
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.75rem', color: rightColor, fontWeight: 600, marginBottom: '0.25rem' }}>
                            {getTeamName(rightTeamId)}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                            {getPlayerNames(rightTeamId)}
                        </div>
                        <div style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1, color: winner === rightTeamId ? rightColor : 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            {rightTeamId === 1 ? currentMatch.score1 : currentMatch.score2}
                        </div>
                    </div>
                </div>


            </div>

            {/* Controls */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem', maxWidth: '600px', margin: '0 auto', width: '100%', gap: '1rem' }}>

                {!winner ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flex: 1 }}>
                        <button
                            className="btn btn-score"
                            onClick={() => addPoint(leftTeamId)}
                            style={{
                                borderColor: leftColor,
                                color: leftColor,
                                backgroundColor: `color-mix(in srgb, ${leftColor} 10%, transparent)`
                            }}
                        >
                            +1
                            <span style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.8 }}>{getTeamName(leftTeamId)}</span>
                        </button>
                        <button
                            className="btn btn-score"
                            onClick={() => addPoint(rightTeamId)}
                            style={{
                                borderColor: rightColor,
                                color: rightColor,
                                backgroundColor: `color-mix(in srgb, ${rightColor} 10%, transparent)`
                            }}
                        >
                            +1
                            <span style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.8 }}>{getTeamName(rightTeamId)}</span>
                        </button>
                    </div>
                ) : (
                    null
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: 'auto' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={undo}
                        disabled={!currentMatch.history?.length || winner}
                        style={{ opacity: (!currentMatch.history?.length || winner) ? 0.5 : 1 }}
                    >
                        <RotateCcw size={18} style={{ marginRight: '0.5rem' }} /> Undo
                    </button>

                    {winner ? (
                        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                            <button className="btn btn-primary" onClick={handleFinish}>
                                <Save size={18} style={{ marginRight: '0.5rem' }} />
                                {hasMoreMatches ? 'Save & Back Team Match page' : 'Save Match'}
                            </button>
                        </div>
                    ) : (
                        <button className="btn btn-danger" onClick={onCancel}>
                            End Game
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScoreBoard;
