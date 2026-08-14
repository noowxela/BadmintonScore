import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Trophy } from 'lucide-react';
import { CATEGORIES, generateEventBracket, getCategoryMeta } from '../utils/bracket';
import { saveKnockoutTournament } from '../utils/storage';

const emptyPair = () => ({ id: Date.now() + Math.random(), name: '', p1: '', p2: '' });

const KnockoutSetup = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('Knockout Cup');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventName, setEventName] = useState('Mixed Doubles Cup');
  const [category, setCategory] = useState('XD');
  const [level, setLevel] = useState('L');
  const [includeBronze, setIncludeBronze] = useState(true);
  const [pairs, setPairs] = useState([emptyPair(), emptyPair(), emptyPair(), emptyPair()]);
  const [error, setError] = useState('');

  const meta = useMemo(() => getCategoryMeta(category), [category]);
  const filledCount = pairs.filter(p => p.name.trim() || p.p1.trim()).length;

  const updatePair = (index, field, value) => {
    setPairs(prev => prev.map((pair, i) => i === index ? { ...pair, [field]: value } : pair));
  };

  const handleCategory = (value) => {
    setCategory(value);
    const next = getCategoryMeta(value);
    setEventName(`${next.label} Cup`);
  };

  const handleGenerate = () => {
    try {
      const normalized = pairs.map((pair, index) => ({
        ...pair,
        name: pair.name.trim() || pair.p1.trim() || `Pair ${index + 1}`
      })).filter(p => p.name.trim() || p.p1.trim());

      const event = generateEventBracket({
        name: eventName.trim() || `${meta.label} Cup`,
        category,
        level: level.trim(),
        pairs: normalized,
        includeBronze
      });

      const tournament = saveKnockoutTournament({
        id: Date.now(),
        title: title.trim() || 'Knockout Cup',
        date,
        status: 'active',
        events: [event]
      });

      navigate(`/knockout/${tournament.id}`);
    } catch (err) {
      setError(err.message || 'Could not generate bracket.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <Trophy size={22} color="var(--color-accent)" /> Elimination bracket
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          Add pairs, generate a knockout tree, then score matches from the bracket.
        </p>
      </div>

      <div className="card">
        <div className="input-group">
          <label className="label">Tournament name</label>
          <input className="input" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div className="input-group">
          <label className="label">Date</label>
          <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="input-group">
          <label className="label">Event name</label>
          <input className="input" value={eventName} onChange={e => setEventName(e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="input-group">
            <label className="label">Category</label>
            <select className="input" value={category} onChange={e => handleCategory(e.target.value)}>
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label className="label">Level</label>
            <input className="input" value={level} onChange={e => setLevel(e.target.value)} placeholder="L" />
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
          <input type="checkbox" checked={includeBronze} onChange={e => setIncludeBronze(e.target.checked)} />
          Include bronze medal match
        </label>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Pairs ({filledCount})</h3>
          <button
            className="btn btn-secondary"
            style={{ width: 'auto', padding: '0.5rem 0.75rem' }}
            onClick={() => setPairs(prev => [...prev, emptyPair()])}
          >
            <Plus size={16} style={{ marginRight: '0.35rem' }} /> Add pair
          </button>
        </div>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {pairs.map((pair, index) => (
            <div key={pair.id} style={{ display: 'grid', gridTemplateColumns: meta.type === 'doubles' ? '1.2fr 1fr 1fr auto' : '1.2fr 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
              <input
                className="input"
                placeholder={`Team ${index + 1}`}
                value={pair.name}
                onChange={e => updatePair(index, 'name', e.target.value)}
              />
              <input
                className="input"
                placeholder={meta.type === 'doubles' ? 'Player 1' : 'Player'}
                value={pair.p1}
                onChange={e => updatePair(index, 'p1', e.target.value)}
              />
              {meta.type === 'doubles' && (
                <input
                  className="input"
                  placeholder="Player 2"
                  value={pair.p2}
                  onChange={e => updatePair(index, 'p2', e.target.value)}
                />
              )}
              <button
                className="btn btn-danger"
                style={{ width: 'auto', padding: '0.65rem' }}
                onClick={() => setPairs(prev => prev.filter((_, i) => i !== index))}
                disabled={pairs.length <= 2}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && <div style={{ color: 'var(--color-danger)', fontSize: '0.9rem' }}>{error}</div>}

      <button className="btn btn-primary" onClick={handleGenerate}>
        Generate bracket
      </button>
    </div>
  );
};

export default KnockoutSetup;
