import React, { useState } from 'react';
import { RotateCcw, Save, ArrowLeftRight } from 'lucide-react';

const winnerFromScore = (s1, s2) => {
    if ((s1 >= 21 || s2 >= 21) && Math.abs(s1 - s2) >= 2) {
        return s1 > s2 ? 1 : 2;
    }
    if (s1 === 30 || s2 === 30) {
        return s1 > s2 ? 1 : 2;
    }
    return null;
};

const ScoreBoard = ({ match, onMatchComplete, onCancel, hasMoreMatches, teamAName = 'Team 1', teamBName = 'Team 2' }) => {
    const [currentMatch, setCurrentMatch] = useState(match);
    const [isSwapped, setIsSwapped] = useState(false);
    const winner = winnerFromScore(currentMatch.score1, currentMatch.score2);

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

    const leftColor = leftTeamId === 1 ? 'var(--color-side-a)' : 'var(--color-side-b)';
    const rightColor = rightTeamId === 1 ? 'var(--color-side-a)' : 'var(--color-side-b)';

    return (
        <div className="container sx-106" >
            {/* Header / Score Display */}
            <div className="sx-107" >
                {winner && (
                    <div className="sx-108" >
                        Match Completed
                    </div>
                )}
                <div className="sx-109" >
                    {/* Left Side */}
                    <div className="sx-37" >
                        <div style={{ fontSize: '0.75rem', color: leftColor, fontWeight: 600, marginBottom: '0.25rem' }}>
                            {getTeamName(leftTeamId)}
                        </div>
                        <div className="sx-110" >
                            {getPlayerNames(leftTeamId)}
                        </div>
                        <div style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1, color: winner === leftTeamId ? leftColor : 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            {leftTeamId === 1 ? currentMatch.score1 : currentMatch.score2}
                        </div>
                    </div>

                    {/* Center Control */}
                    <div className="sx-111" >
                        <div className="sx-112" >-</div>
                        <button
                            onClick={() => setIsSwapped(!isSwapped)}
                            className="sx-113" 
                            title="Switch Position"
                        >
                            <ArrowLeftRight size={16} />
                        </button>
                    </div>

                    {/* Right Side */}
                    <div className="sx-37" >
                        <div style={{ fontSize: '0.75rem', color: rightColor, fontWeight: 600, marginBottom: '0.25rem' }}>
                            {getTeamName(rightTeamId)}
                        </div>
                        <div className="sx-110" >
                            {getPlayerNames(rightTeamId)}
                        </div>
                        <div style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1, color: winner === rightTeamId ? rightColor : 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            {rightTeamId === 1 ? currentMatch.score1 : currentMatch.score2}
                        </div>
                    </div>
                </div>


            </div>

            {/* Controls */}
            <div className="sx-114" >

                {!winner ? (
                    <div className="sx-115" >
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
                            <span className="sx-116" >{getTeamName(leftTeamId)}</span>
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
                            <span className="sx-116" >{getTeamName(rightTeamId)}</span>
                        </button>
                    </div>
                ) : (
                    null
                )}

                <div className="sx-117" >
                    <button
                        className="btn btn-secondary btn-block"
                        onClick={undo}
                        disabled={!currentMatch.history?.length || winner}
                        style={{ opacity: (!currentMatch.history?.length || winner) ? 0.5 : 1 }}
                    >
                        <RotateCcw size={18} className="sx-104"  /> Undo
                    </button>

                    {winner ? (
                        <div className="sx-118" >
                            <button className="btn btn-primary btn-block" onClick={handleFinish}>
                                <Save size={18} className="sx-104"  />
                                {currentMatch.knockout
                                  ? 'Save & Back to Bracket'
                                  : hasMoreMatches
                                    ? 'Save & Back Team Match page'
                                    : 'Save Match'}
                            </button>
                        </div>
                    ) : (
                        <button className="btn btn-danger btn-block" onClick={onCancel}>
                            End Game
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScoreBoard;
