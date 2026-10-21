import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createLeague } from '../../domain/createLeague';
import { saveKnockoutTournament } from '../../utils/storage';

const namesFrom = (text) => text.split('\n').map((line) => line.trim()).filter(Boolean);

const LeagueSetup = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('Club League');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [groupA, setGroupA] = useState('Team 1\nTeam 2\nTeam 3');
  const [groupB, setGroupB] = useState('Team 4\nTeam 5\nTeam 6');
  const [error, setError] = useState('');

  const handleCreate = (event) => {
    event.preventDefault();
    const a = namesFrom(groupA);
    const b = namesFrom(groupB);
    if (a.length < 2 || b.length < 2) {
      setError('Each group needs at least two teams.');
      return;
    }
    const tournament = saveKnockoutTournament(createLeague({
      title: title.trim() || 'Club League',
      date,
      groupA: a,
      groupB: b
    }));
    navigate(`/league/${tournament.id}`);
  };

  return (
    <form className="card sx-6" onSubmit={handleCreate}>
      <h2>New league</h2>
      <label className="label">Title</label>
      <input className="input" value={title} onChange={(event) => setTitle(event.target.value)} />
      <label className="label">Date</label>
      <input className="input" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      <label className="label">Group A teams, one per line</label>
      <textarea className="input" rows={5} value={groupA} onChange={(event) => setGroupA(event.target.value)} />
      <label className="label">Group B teams, one per line</label>
      <textarea className="input" rows={5} value={groupB} onChange={(event) => setGroupB(event.target.value)} />
      {error && <p className="sx-8">{error}</p>}
      <button type="submit" className="btn btn-primary btn-block">Create league</button>
      <button type="button" className="btn btn-secondary btn-block" onClick={() => navigate('/')}>Cancel</button>
    </form>
  );
};

export default LeagueSetup;
