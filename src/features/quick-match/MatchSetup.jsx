import React, { useState } from 'react';
import { Users, User } from 'lucide-react';
import PlayerNameInput from '../../components/ui/PlayerNameInput';
import { ensurePlayersFromNames } from '../../utils/storage';

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
        if (!players.p1 || !players.p2) return;
        if (gameType === 'doubles' && (!players.p3 || !players.p4)) return;

        const names = [players.p1, players.p2];
        if (gameType === 'doubles') names.push(players.p3, players.p4);
        ensurePlayersFromNames(names);

        onStartMatch({
            type: gameType,
            player1: players.p1.trim(),
            player2: players.p2.trim(),
            player3: gameType === 'doubles' ? players.p3.trim() : null,
            player4: gameType === 'doubles' ? players.p4.trim() : null,
            score1: 0,
            score2: 0,
            history: []
        });
    };

    return (
        <div className="card">
            <h2 className="title sx-103" >New Match</h2>

            <div className="input-group">
                <label className="label">Game Type</label>
                <div className="sx-77" >
                    <button
                        type="button"
                        className={`btn ${gameType === 'singles' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setGameType('singles')}
                    >
                        <User size={18} className="sx-104"  /> Singles
                    </button>
                    <button
                        type="button"
                        className={`btn ${gameType === 'doubles' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setGameType('doubles')}
                    >
                        <Users size={18} className="sx-104"  /> Doubles
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label className="label">Team 1</label>
                    <PlayerNameInput
                        listId="quick-match-p1"
                        placeholder="Player 1 Name"
                        value={players.p1}
                        onChange={(value) => setPlayers({ ...players, p1: value })}
                        required
                        className="sx-2" 
                    />
                    {gameType === 'doubles' && (
                        <PlayerNameInput
                            listId="quick-match-p3"
                            placeholder="Player 3 Name"
                            value={players.p3}
                            onChange={(value) => setPlayers({ ...players, p3: value })}
                            required
                        />
                    )}
                </div>

                <div className="input-group">
                    <label className="label">Team 2</label>
                    <PlayerNameInput
                        listId="quick-match-p2"
                        placeholder="Player 2 Name"
                        value={players.p2}
                        onChange={(value) => setPlayers({ ...players, p2: value })}
                        required
                        className="sx-2" 
                    />
                    {gameType === 'doubles' && (
                        <PlayerNameInput
                            listId="quick-match-p4"
                            placeholder="Player 4 Name"
                            value={players.p4}
                            onChange={(value) => setPlayers({ ...players, p4: value })}
                            required
                        />
                    )}
                </div>

                <div className="sx-105" >
                    <button type="submit" className="btn btn-primary btn-block">
                        Start Match
                    </button>
                    <button type="button" className="btn btn-secondary btn-block" onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MatchSetup;
