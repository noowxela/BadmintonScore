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
} from '../../utils/storage';
import { GitMerge, Plus, Trash2, UserRound, X } from 'lucide-react';
import { askConfirm } from '../../ui/confirm';

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

  const handleDelete = async (player) => {
    if (!await askConfirm(`Remove "${player.name}" from the roster? Match history is kept.`)) return;
    deletePlayer(player.id);
    refresh();
  };

  const handleMerge = async (e) => {
    e.preventDefault();
    setError('');
    if (!mergeFromId || !mergeIntoId || mergeFromId === mergeIntoId) {
      setError('Pick two different players to merge');
      return;
    }
    const from = players.find((p) => p.id === mergeFromId);
    const into = players.find((p) => p.id === mergeIntoId);
    if (!await askConfirm(`Merge "${from?.name}" into "${into?.name}"? Stats will combine under "${into?.name}".`)) {
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
    <div className="sx-6" >
      <div>
        <h2 className="sx-7" >Player roster</h2>
        <p className="sx-8" >
          Canonical names keep stats together. Add aliases for spelling variants like "Alex" and "alex woon".
        </p>
      </div>

      {error && (
        <div
          className="card sx-14"
          
        >
          {error}
        </div>
      )}

      <form className="card sx-84" onSubmit={handleAdd} >
        <input
          className="input sx-85"
          placeholder="Add player name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          
        />
        <button type="submit" className="btn btn-primary sx-86" >
          <Plus size={18} className="sx-80"  /> Add
        </button>
      </form>

      {players.length >= 2 && (
        <form className="card sx-81" onSubmit={handleMerge} >
          <div className="sx-16" >
            <GitMerge size={18} /> Merge duplicate players
          </div>
          <div className="sx-87" >
            <select className="input sx-85" value={mergeFromId} onChange={(e) => setMergeFromId(e.target.value)} >
              <option value="">Merge from…</option>
              {mergeOptions.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <span className="sx-88" >into</span>
            <select className="input sx-85" value={mergeIntoId} onChange={(e) => setMergeIntoId(e.target.value)} >
              <option value="">Keep as…</option>
              {mergeOptions.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-secondary btn-block">Merge</button>
        </form>
      )}

      {empty ? (
        <div className="card sx-89" >
          <UserRound size={40} className="sx-90"  />
          <h3 className="sx-91" >No players yet</h3>
          <p className="sx-8" >
            Add names here, or play a match — players are picked up automatically from history.
          </p>
        </div>
      ) : (
        <div className="sx-81" >
          {players.map((player) => (
            <div key={player.id} className="card sx-47" >
              <div className="sx-92" >
                <div className="sx-93" >
                  {editingId === player.id ? (
                    <div className="sx-94" >
                      <input
                        className="input sx-85"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        
                      />
                      <button type="button" className="btn btn-primary sx-72"  onClick={() => saveRename(player.id)}>
                        Save
                      </button>
                      <button type="button" className="btn btn-secondary sx-95"  onClick={() => setEditingId(null)}>
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startRename(player)}
                      className="sx-96" 
                      title="Click to rename"
                    >
                      {player.name}
                    </button>
                  )}

                  <div className="sx-97" >
                    <div className="sx-98" >Aliases</div>
                    <div className="sx-99" >
                      {(player.aliases || []).length === 0 && (
                        <span className="sx-100" >None</span>
                      )}
                      {(player.aliases || []).map((alias) => (
                        <button
                          key={alias}
                          type="button"
                          className="btn btn-secondary sx-101"
                          
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
                    <div className="sx-94" >
                      <input
                        className="input sx-85"
                        placeholder="Add alias spelling"
                        value={aliasDrafts[player.id] || ''}
                        onChange={(e) => setAliasDrafts((prev) => ({ ...prev, [player.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAlias(player.id))}
                        
                      />
                      <button type="button" className="btn btn-secondary sx-72"  onClick={() => handleAddAlias(player.id)}>
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary sx-102"
                  
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
