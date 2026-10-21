import React, { useState, useEffect } from 'react';
import { Users, User, Trash2, Plus, Save, Edit2, X, Calendar } from 'lucide-react';
import { ensurePlayer, getPlayers } from '../../utils/storage';

const MatchupConfig = ({ teams: initialTeams, onStartMatch, onSaveDraft, onBack }) => {
    // Local State for Match Info & Teams
    const [matchTitle, setMatchTitle] = useState(initialTeams.title || 'Team Match');
    const [matchDate, setMatchDate] = useState(initialTeams.date || '');
    const [teamA, setTeamA] = useState(initialTeams.teamA);
    const [teamB, setTeamB] = useState(initialTeams.teamB);

    // Matches State
    const [matches, setMatches] = useState(initialTeams.matches || [
        { id: 1, category: 'MS', type: 'singles', p1: '', p2: '', p3: '', p4: '' }
    ]);

    // Modal States
    const [showEditInfoModal, setShowEditInfoModal] = useState(false);
    const [showManagePlayersModal, setShowManagePlayersModal] = useState(null); // 'A' or 'B' or null
    const [newPlayerName, setNewPlayerName] = useState('');

    // --- Match Logic ---

    const addMatch = () => {
        setMatches([...matches, {
            id: matches.length + 1,
            category: 'MS',
            type: 'singles',
            p1: '',
            p2: '',
            p3: '',
            p4: ''
        }]);
    };

    const removeMatch = (index) => {
        if (matches.length === 1) return;
        setMatches(matches.filter((_, i) => i !== index));
    };

    const updateMatch = (index, field, value) => {
        const newMatches = [...matches];
        let updatedMatch = { ...newMatches[index], [field]: value };

        // Handle Category Change
        if (field === 'category') {
            const isDoubles = ['MD', 'WD', 'XD'].includes(value);
            updatedMatch.type = isDoubles ? 'doubles' : 'singles';
            if (!isDoubles) {
                updatedMatch.p3 = '';
                updatedMatch.p4 = '';
            }
        }

        newMatches[index] = updatedMatch;
        setMatches(newMatches);
    };

    // --- Player Management Logic ---

    const handleAddPlayerToTeam = (teamId, name) => {
        const playerName = name || newPlayerName;
        if (!playerName.trim()) return;
        const trimmed = playerName.trim();
        ensurePlayer(trimmed);

        if (teamId === 'A') {
            if (!teamA.players.includes(trimmed)) {
                setTeamA(prev => ({ ...prev, players: [...prev.players, trimmed] }));
            }
        } else {
            if (!teamB.players.includes(trimmed)) {
                setTeamB(prev => ({ ...prev, players: [...prev.players, trimmed] }));
            }
        }
        setNewPlayerName('');
    };

    const handleRemovePlayerFromTeam = (teamId, index) => {
        if (teamId === 'A') {
            setTeamA(prev => ({ ...prev, players: prev.players.filter((_, i) => i !== index) }));
        } else {
            setTeamB(prev => ({ ...prev, players: prev.players.filter((_, i) => i !== index) }));
        }
    };

    // --- Finalize Logic ---

    const getFinalData = () => ({
        ...initialTeams,
        title: matchTitle,
        date: matchDate,
        teamA,
        teamB,
        matches
    });

    const handleStart = () => {
        // Validate all matches have players selected
        const isValid = matches.every(m => {
            if (m.type === 'singles') return m.p1 && m.p2;
            return m.p1 && m.p2 && m.p3 && m.p4;
        });

        if (!isValid) {
            alert('Please select players for all matches.');
            return;
        }

        onStartMatch({
            ...getFinalData(),
            matches: matches.map(m => ({
                ...m,
                status: 'pending',
                score1: 0,
                score2: 0,
                history: []
            })),
            scoreA: 0,
            scoreB: 0,
            currentMatchIndex: 0
        });
    };

    const handleSaveDraft = () => {
        onSaveDraft(getFinalData());
    };

    // --- Render Helpers ---

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        // Format: 2025-11-30 (Sunday)
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const day = date.toLocaleDateString(undefined, { weekday: 'long' });
        return `${yyyy}-${mm}-${dd} (${day})`;
    };

    const SmartPlayerSelect = ({ value, onChange, teamId, players, placeholder }) => {
        const [inputValue, setInputValue] = useState(value);
        const rosterNames = getPlayers().map((p) => p.name);
        const options = [...new Set([...players, ...rosterNames])].sort((a, b) => a.localeCompare(b));

        useEffect(() => {
            setInputValue(value);
        }, [value]);

        const handleBlurOrEnter = () => {
            const trimmed = inputValue.trim();
            if (!trimmed) {
                onChange('');
                return;
            }

            // Auto-add player if not exists
            if (!players.includes(trimmed)) {
                handleAddPlayerToTeam(teamId, trimmed);
            } else {
                ensurePlayer(trimmed);
            }

            onChange(trimmed);
        };

        return (
            <>
                <input
                    className="input sx-169"
                    list={`players-${teamId}`}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={handleBlurOrEnter}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleBlurOrEnter();
                            e.target.blur();
                        }
                    }}
                    placeholder={placeholder}
                    
                />
                <datalist id={`players-${teamId}`}>
                    {options.map(p => <option key={p} value={p} />)}
                </datalist>
            </>
        );
    };

    return (
        <div className="card sx-170" >
            {/* Header Section */}
            <div className="sx-171" >
                <button
                    className="btn btn-secondary sx-172"
                    
                    onClick={() => setShowEditInfoModal(true)}
                    title="Edit Match Info"
                >
                    <Edit2 size={16} />
                </button>

                <h2 className="title sx-173" >
                    {matchTitle}
                </h2>
                {matchDate && (
                    <div className="sx-174" >
                        <Calendar size={16} />
                        {formatDate(matchDate)}
                    </div>
                )}
            </div>

            {/* Matches Table */}
            <div className="sx-175" >
                <table className="sx-176" >
                    <thead>
                        <tr className="sx-177" >
                            <th className="sx-178" >Category</th>
                            <th
                                className="sx-179" 
                                onClick={() => setShowManagePlayersModal('A')}
                                title="Click to manage Team A players"
                            >
                                <div className="sx-34" >
                                    {teamA.name} <Edit2 size={12} className="sx-23"  />
                                </div>
                            </th>
                            <th
                                className="sx-180" 
                                onClick={() => setShowManagePlayersModal('B')}
                                title="Click to manage Team B players"
                            >
                                <div className="sx-34" >
                                    {teamB.name} <Edit2 size={12} className="sx-23"  />
                                </div>
                            </th>
                            <th className="sx-181" ></th>
                        </tr>
                    </thead>
                    <tbody>
                        {matches.map((match, index) => (
                            <tr key={match.id} className="sx-182" >
                                <td className="sx-47" >
                                    <select
                                        className="input sx-183"
                                        value={match.category || 'MS'}
                                        onChange={(e) => updateMatch(index, 'category', e.target.value)}
                                        
                                    >
                                        <option value="MS">MS</option>
                                        <option value="WS">WS</option>
                                        <option value="MD">MD</option>
                                        <option value="WD">WD</option>
                                        <option value="XD">XD</option>
                                    </select>
                                </td>
                                <td className="sx-47" >
                                    <div className="sx-43" >
                                        <SmartPlayerSelect
                                            value={match.p1}
                                            onChange={(val) => updateMatch(index, 'p1', val)}
                                            teamId="A"
                                            players={teamA.players}
                                            placeholder="Player 1"
                                        />
                                        {match.type === 'doubles' && (
                                            <SmartPlayerSelect
                                                value={match.p3}
                                                onChange={(val) => updateMatch(index, 'p3', val)}
                                                teamId="A"
                                                players={teamA.players}
                                                placeholder="Player 2"
                                            />
                                        )}
                                    </div>
                                </td>
                                <td className="sx-47" >
                                    <div className="sx-43" >
                                        <SmartPlayerSelect
                                            value={match.p2}
                                            onChange={(val) => updateMatch(index, 'p2', val)}
                                            teamId="B"
                                            players={teamB.players}
                                            placeholder="Player 1"
                                        />
                                        {match.type === 'doubles' && (
                                            <SmartPlayerSelect
                                                value={match.p4}
                                                onChange={(val) => updateMatch(index, 'p4', val)}
                                                teamId="B"
                                                players={teamB.players}
                                                placeholder="Player 2"
                                            />
                                        )}
                                    </div>
                                </td>
                                <td className="sx-184" >
                                    <button
                                        className="btn btn-danger sx-120"
                                        
                                        onClick={() => removeMatch(index)}
                                        title="Remove Match"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="sx-185" >
                <button className="btn btn-secondary btn-block sx-186"  onClick={addMatch}>
                    <Plus size={16} className="sx-104"  /> Add Match
                </button>
            </div>

            {/* Match Summary Section */}
            <div className="sx-187" >
                <h3 className="sx-188" >
                    <Users size={20} />
                    Match Summary
                </h3>

                <div className="sx-189" >
                    {matches.length} {matches.length === 1 ? 'Match' : 'Matches'}
                </div>

                {/* Category Breakdown */}
                <div className="sx-190" >
                    {['MS', 'WS', 'MD', 'WD', 'XD'].map(category => {
                        const count = matches.filter(m => m.category === category).length;
                        if (count === 0) return null;

                        return (
                            <div key={category} className="sx-191" >
                                <div className="sx-137" >
                                    {category}
                                </div>
                                <div className="sx-192" >
                                    {count}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="sx-61" >
                <button className="btn btn-primary btn-block" onClick={handleStart}>
                    Start Recording Match Score
                </button>
                <button className="btn btn-secondary btn-block" onClick={handleSaveDraft}>
                    <Save size={18} className="sx-104"  /> Save Draft
                </button>
                <button className="btn btn-secondary btn-block" onClick={onBack}>
                    Back
                </button>
            </div>

            {/* Edit Info Modal */}
            {showEditInfoModal && (
                <div className="sx-193" >
                    <div className="card sx-194" >
                        <div className="sx-195" >
                            <h3 className="sx-119" >Edit Match Info</h3>
                            <button className="btn btn-secondary sx-196"  onClick={() => setShowEditInfoModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="sx-25" >
                            <div className="input-group">
                                <label className="label">Match Title</label>
                                <input className="input" value={matchTitle} onChange={(e) => setMatchTitle(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label className="label">Date</label>
                                <input type="date" className="input" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label className="label">Team A Name</label>
                                <input className="input" value={teamA.name} onChange={(e) => setTeamA({ ...teamA, name: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label className="label">Team B Name</label>
                                <input className="input" value={teamB.name} onChange={(e) => setTeamB({ ...teamB, name: e.target.value })} />
                            </div>
                            <button className="btn btn-primary btn-block" onClick={() => setShowEditInfoModal(false)}>Done</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manage Players Modal */}
            {showManagePlayersModal && (
                <div className="sx-193" >
                    <div className="card sx-194" >
                        <div className="sx-195" >
                            <h3 className="sx-119" >
                                Manage {showManagePlayersModal === 'A' ? teamA.name : teamB.name} Players
                            </h3>
                            <button className="btn btn-secondary sx-196"  onClick={() => setShowManagePlayersModal(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="input-group">
                            <div className="sx-94" >
                                <input
                                    className="input"
                                    placeholder="New Player Name"
                                    value={newPlayerName}
                                    onChange={(e) => setNewPlayerName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddPlayerToTeam(showManagePlayersModal)}
                                />
                                <button
                                    className="btn btn-primary sx-72"
                                    
                                    onClick={() => handleAddPlayerToTeam(showManagePlayersModal)}
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="sx-197" >
                            {(showManagePlayersModal === 'A' ? teamA.players : teamB.players).map((player, idx) => (
                                <div key={idx} className="sx-198" >
                                    {player}
                                    <X
                                        size={14}
                                        className="sx-32" 
                                        onClick={() => handleRemovePlayerFromTeam(showManagePlayersModal, idx)}
                                    />
                                </div>
                            ))}
                        </div>

                        <button className="btn btn-primary btn-block sx-199"  onClick={() => setShowManagePlayersModal(null)}>
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MatchupConfig;
