import React, { useMemo, useState } from 'react';
import {
  addPlayer,
  addPlayerAlias,
  deletePlayer,
  getPlayers,
  mergePlayers,
  removePlayerAlias,
  syncPlayersFromHistory,
  updatePlayer
} from '../utils/storage';
import { GitMerge, Plus, Trash2, UserRound, X } from 'lucide-react';

const Players = () => {
  const [players, setPlayers] = useState(() => {
    syncPlayersFromHistory();
    return getPlayers().sort((a, b) => a.name.localeCompare(b.name));
  });
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [aliasDrafts, setAliasDrafts] = useState({});
  const [mergeFromId, setMergeFromId] = useState('');
  const [mergeIntoId, setMergeIntoId] = useState('');

  const refresh = () => {
    setPlayers(getPlayers().sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    setError('');
    try {
      if (!newName.trim()) return;
      addPlayer(newName.trim());
      setNewName('');
      refresh();
    } catch (err) {
      setError(err.message || 'Could not add player');
    }
  };

  const startRename = (player) => {
    setEditingId(player.id);
    setEditName(player.name);
    setError('');
  };

  const saveRename = (id) => {
    setError('');
    try {
      updatePlayer(id, { name: editName.trim() });
      setEditingId(null);
      refresh();
    } catch (err) {
      setError(err.message || 'Could not rename player');
    }
  };

  const handleAddAlias = (id) => {
    setError('');
    try {
      const alias = (aliasDrafts[id] || '').trim();
      if (!alias) return;
      addPlayerAlias(id, alias);
      setAliasDrafts((prev) => ({ ...prev, [id]: '' }));
      refresh();
    } catch (err) {
      setError(err.message || 'Could not add alias');
    }
  };

  const handleDelete = (player) => {
    if (!window.confirm(`Remove "${player.name}" from the roster? Match history is kept.`)) return;
    deletePlayer(player.id);
    refresh();
  };

  const handleMerge = (e) => {
    e.preventDefault();
    setError('');
    if (!mergeFromId || !mergeIntoId || mergeFromId === mergeIntoId) {
      setError('Pick two different players to merge');
      return;
    }
    const from = players.find((p) => p.id === mergeFromId);
    const into = players.find((p) => p.id === mergeIntoId);
    if (!window.confirm(`Merge "${from?.name}" into "${into?.name}"? Stats will combine under "${into?.name}".`)) {
      return;
    }
    mergePlayers(mergeIntoId, mergeFromId);
    setMergeFromId('');
    setMergeIntoId('');
    refresh();
  };

  const empty = players.length === 0;
  const mergeOptions = useMemo(() => players, [players]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.35rem' }}>Player roster</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Canonical names keep stats together. Add aliases for spelling variants like "Alex" and "alex woon".
        </p>
      </div>

      {error && (
        <div
          className="card"
          style={{
            padding: '0.85rem 1rem',
            borderLeft: '4px solid var(--color-danger)',
            color: 'var(--color-danger)',
            fontSize: '0.875rem'
          }}
        >
          {error}
        </div>
      )}

      <form className="card" onSubmit={handleAdd} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <input
          className="input"
          placeholder="Add player name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={{ marginBottom: 0 }}
        />
        <button type="submit" className="btn btn-primary" style={{ width: 'auto', whiteSpace: 'nowrap' }}>
          <Plus size={18} style={{ marginRight: '0.35rem' }} /> Add
        </button>
      </form>

      {players.length >= 2 && (
        <form className="card" onSubmit={handleMerge} style={{ display: 'grid', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            <GitMerge size={18} /> Merge duplicate players
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center' }}>
            <select className="input" value={mergeFromId} onChange={(e) => setMergeFromId(e.target.value)} style={{ marginBottom: 0 }}>
              <option value="">Merge from…</option>
              {mergeOptions.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>into</span>
            <select className="input" value={mergeIntoId} onChange={(e) => setMergeIntoId(e.target.value)} style={{ marginBottom: 0 }}>
              <option value="">Keep as…</option>
              {mergeOptions.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-secondary">Merge</button>
        </form>
      )}

      {empty ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
          <UserRound size={40} style={{ opacity: 0.45, marginBottom: '0.75rem' }} />
          <h3 style={{ marginBottom: '0.35rem' }}>No players yet</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Add names here, or play a match — players are picked up automatically from history.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {players.map((player) => (
            <div key={player.id} className="card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {editingId === player.id ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        className="input"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        style={{ marginBottom: 0 }}
                      />
                      <button type="button" className="btn btn-primary" style={{ width: 'auto' }} onClick={() => saveRename(player.id)}>
                        Save
                      </button>
                      <button type="button" className="btn btn-secondary" style={{ width: 'auto', padding: '0.75rem' }} onClick={() => setEditingId(null)}>
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startRename(player)}
                      style={{ fontWeight: 700, fontSize: '1.05rem', color: 'inherit', textAlign: 'left' }}
                      title="Click to rename"
                    >
                      {player.name}
                    </button>
                  )}

                  <div style={{ marginTop: '0.65rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.35rem' }}>Aliases</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
                      {(player.aliases || []).length === 0 && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>None</span>
                      )}
                      {(player.aliases || []).map((alias) => (
                        <button
                          key={alias}
                          type="button"
                          className="btn btn-secondary"
                          style={{ width: 'auto', padding: '0.2rem 0.55rem', fontSize: '0.75rem', gap: '0.25rem' }}
                          onClick={() => {
                            removePlayerAlias(player.id, alias);
                            refresh();
                          }}
                          title="Remove alias"
                        >
                          {alias} <X size={12} />
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        className="input"
                        placeholder="Add alias spelling"
                        value={aliasDrafts[player.id] || ''}
                        onChange={(e) => setAliasDrafts((prev) => ({ ...prev, [player.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAlias(player.id))}
                        style={{ marginBottom: 0 }}
                      />
                      <button type="button" className="btn btn-secondary" style={{ width: 'auto' }} onClick={() => handleAddAlias(player.id)}>
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: 'auto', padding: '0.5rem', color: 'var(--color-danger)' }}
                  onClick={() => handleDelete(player)}
                  title="Remove from roster"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Players;
