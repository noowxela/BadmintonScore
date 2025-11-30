import React, { useState } from 'react';
import { Users, User } from 'lucide-react';

const MatchSetup = ({ onStartMatch, onCancel }) => {
    const [gameType, setGameType] = useState('singles');
    const [players, setPlayers] = useState({
        p1: '',
        p2: '',
        p3: '',
        p4: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation
        if (!players.p1 || !players.p2) return;
        if (gameType === 'doubles' && (!players.p3 || !players.p4)) return;

        onStartMatch({
            type: gameType,
            player1: players.p1,
            player2: players.p2,
            player3: gameType === 'doubles' ? players.p3 : null,
            player4: gameType === 'doubles' ? players.p4 : null,
            score1: 0,
            score2: 0,
            history: [] // For undo functionality
        });
    };

    return (
        <div className="card">
            <h2 className="title" style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>New Match</h2>

            <div className="input-group">
                <label className="label">Game Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <button
                        type="button"
                        className={`btn ${gameType === 'singles' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setGameType('singles')}
                    >
                        <User size={18} style={{ marginRight: '0.5rem' }} /> Singles
                    </button>
                    <button
                        type="button"
                        className={`btn ${gameType === 'doubles' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setGameType('doubles')}
                    >
                        <Users size={18} style={{ marginRight: '0.5rem' }} /> Doubles
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label className="label">Team 1</label>
                    <input
                        className="input"
                        placeholder="Player 1 Name"
                        value={players.p1}
                        onChange={(e) => setPlayers({ ...players, p1: e.target.value })}
                        required
                        style={{ marginBottom: '0.5rem' }}
                    />
                    {gameType === 'doubles' && (
                        <input
                            className="input"
                            placeholder="Player 3 Name"
                            value={players.p3}
                            onChange={(e) => setPlayers({ ...players, p3: e.target.value })}
                            required
                        />
                    )}
                </div>

                <div className="input-group">
                    <label className="label">Team 2</label>
                    <input
                        className="input"
                        placeholder="Player 2 Name"
                        value={players.p2}
                        onChange={(e) => setPlayers({ ...players, p2: e.target.value })}
                        required
                        style={{ marginBottom: '0.5rem' }}
                    />
                    {gameType === 'doubles' && (
                        <input
                            className="input"
                            placeholder="Player 4 Name"
                            value={players.p4}
                            onChange={(e) => setPlayers({ ...players, p4: e.target.value })}
                            required
                        />
                    )}
                </div>

                <div style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
                    <button type="submit" className="btn btn-primary">
                        Start Match
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MatchSetup;
