import React, { useState, useEffect } from 'react';
import { Users, User, Trash2, Plus, Save, Edit2, X, Calendar } from 'lucide-react';

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

        if (teamId === 'A') {
            if (!teamA.players.includes(playerName.trim())) {
                setTeamA(prev => ({ ...prev, players: [...prev.players, playerName.trim()] }));
            }
        } else {
            if (!teamB.players.includes(playerName.trim())) {
                setTeamB(prev => ({ ...prev, players: [...prev.players, playerName.trim()] }));
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
            }

            onChange(trimmed);
        };

        return (
            <>
                <input
                    className="input"
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
                    style={{ padding: '0.5rem', fontSize: '0.875rem', width: '100%' }}
                />
                <datalist id={`players-${teamId}`}>
                    {players.map(p => <option key={p} value={p} />)}
                </datalist>
            </>
        );
    };

    return (
        <div className="card" style={{ position: 'relative' }}>
            {/* Header Section */}
            <div style={{ marginBottom: '2rem', textAlign: 'center', position: 'relative' }}>
                <button
                    className="btn btn-secondary"
                    style={{ position: 'absolute', right: 0, top: 0, width: 'auto', padding: '0.5rem' }}
                    onClick={() => setShowEditInfoModal(true)}
                    title="Edit Match Info"
                >
                    <Edit2 size={16} />
                </button>

                <h2 className="title" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                    {matchTitle}
                </h2>
                {matchDate && (
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Calendar size={16} />
                        {formatDate(matchDate)}
                    </div>
                )}
            </div>

            {/* Matches Table */}
            <div style={{ overflowX: 'auto', marginBottom: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '1rem', textAlign: 'left', width: '100px' }}>Category</th>
                            <th
                                style={{ padding: '1rem', textAlign: 'left', color: 'var(--color-primary)', cursor: 'pointer' }}
                                onClick={() => setShowManagePlayersModal('A')}
                                title="Click to manage Team A players"
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {teamA.name} <Edit2 size={12} style={{ opacity: 0.5 }} />
                                </div>
                            </th>
                            <th
                                style={{ padding: '1rem', textAlign: 'left', color: 'var(--color-accent)', cursor: 'pointer' }}
                                onClick={() => setShowManagePlayersModal('B')}
                                title="Click to manage Team B players"
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {teamB.name} <Edit2 size={12} style={{ opacity: 0.5 }} />
                                </div>
                            </th>
                            <th style={{ padding: '1rem', textAlign: 'right', width: '50px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {matches.map((match, index) => (
                            <tr key={match.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '1rem' }}>
                                    <select
                                        className="input"
                                        value={match.category || 'MS'}
                                        onChange={(e) => updateMatch(index, 'category', e.target.value)}
                                        style={{ padding: '0.5rem', width: '100%' }}
                                    >
                                        <option value="MS">MS</option>
                                        <option value="WS">WS</option>
                                        <option value="MD">MD</option>
                                        <option value="WD">WD</option>
                                        <option value="XD">XD</option>
                                    </select>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button
                                        className="btn btn-danger"
                                        style={{ padding: '0.5rem', width: 'auto' }}
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

            <div style={{ marginBottom: '2rem' }}>
                <button className="btn btn-secondary" style={{ width: '100%', padding: '0.75rem', borderStyle: 'dashed' }} onClick={addMatch}>
                    <Plus size={16} style={{ marginRight: '0.5rem' }} /> Add Match
                </button>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
                <button className="btn btn-primary" onClick={handleStart}>
                    Start Team Match
                </button>
                <button className="btn btn-secondary" onClick={handleSaveDraft}>
                    <Save size={18} style={{ marginRight: '0.5rem' }} /> Save Draft
                </button>
                <button className="btn btn-secondary" onClick={onBack}>
                    Back
                </button>
            </div>

            {/* Edit Info Modal */}
            {showEditInfoModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Edit Match Info</h3>
                            <button className="btn btn-secondary" style={{ width: 'auto', padding: '0.25rem' }} onClick={() => setShowEditInfoModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                            <button className="btn btn-primary" onClick={() => setShowEditInfoModal(false)}>Done</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manage Players Modal */}
            {showManagePlayersModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="card" style={{ width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                                Manage {showManagePlayersModal === 'A' ? teamA.name : teamB.name} Players
                            </h3>
                            <button className="btn btn-secondary" style={{ width: 'auto', padding: '0.25rem' }} onClick={() => setShowManagePlayersModal(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="input-group">
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    className="input"
                                    placeholder="New Player Name"
                                    value={newPlayerName}
                                    onChange={(e) => setNewPlayerName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddPlayerToTeam(showManagePlayersModal)}
                                />
                                <button
                                    className="btn btn-primary"
                                    style={{ width: 'auto' }}
                                    onClick={() => handleAddPlayerToTeam(showManagePlayersModal)}
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                            {(showManagePlayersModal === 'A' ? teamA.players : teamB.players).map((player, idx) => (
                                <div key={idx} style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: 'var(--radius-full)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.875rem'
                                }}>
                                    {player}
                                    <X
                                        size={14}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleRemovePlayerFromTeam(showManagePlayersModal, idx)}
                                    />
                                </div>
                            ))}
                        </div>

                        <button className="btn btn-primary" style={{ marginTop: '2rem' }} onClick={() => setShowManagePlayersModal(null)}>
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MatchupConfig;
