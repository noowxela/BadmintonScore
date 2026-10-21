import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, FileSpreadsheet, Home, RefreshCw, Trophy } from 'lucide-react';
import { ensureLaksaBowl50, LAKSA_BOWL_ID } from '../data/laksaBowl50';
import { getKnockoutTournament } from '../utils/storage';
import { buildOverallTimetable, filterTimetable, timetableToCsv } from '../utils/timetable';

const MATCH_FILTERS = [
  { id: 'MS', label: 'Single' },
  { id: 'MD', label: 'Double' },
  { id: 'XD', label: 'Mix Double' }
];

const playerLine = (players) => players?.filter(Boolean).join('/') || 'TBD';

const MatchDetailModal = ({ slot, onClose, onRefresh }) => {
  const detail = slot.detail || {};
  const titleNo = String(slot.label || '').replace(/^Match:\s*/i, '') || detail.matchNo;
  return (
    <div className="bracket-modal" onClick={onClose}>
      <div className="match-modal" onClick={e => e.stopPropagation()}>
        <div className="match-modal-head">
          <div>
            <h3><Trophy size={20} color="var(--color-primary)" /> Match-{titleNo} [{detail.type || slot.type}]</h3>
            <p>Category: {detail.categoryLabel || slot.type} | Level: {detail.level || 'L'}</p>
          </div>
          <button type="button" className="match-modal-close" onClick={onClose}>Close</button>
        </div>

        <div className={`match-submit ${detail.submitted ? 'is-done' : ''}`}>
          <span>● Left Team {detail.submitted ? <Check size={14} /> : null} {detail.submitted ? 'Submitted' : 'Pending'}</span>
          <span>● Right Team {detail.submitted ? <Check size={14} /> : null} {detail.submitted ? 'Submitted' : 'Pending'}</span>
        </div>

        <div className="match-sheet">
          <div className="match-sheet-bar">
            <span>#{titleNo} • {detail.type || slot.type}</span>
            <span>Court {detail.court || slot.court}</span>
            <span>{detail.dayLabel} {detail.startTime} ~ {detail.endTime}</span>
            <span className={`match-status ${detail.status === 'Completed' ? 'is-done' : ''}`}>{detail.status || 'Upcoming'}</span>
            <button type="button" className="match-refresh" onClick={onRefresh} aria-label="Refresh"><RefreshCw size={14} /></button>
          </div>
          <div className="match-sides">
            <div className="match-side-card">
              <small>{detail.teamAName}</small>
              <strong>{playerLine(detail.leftPlayers)}</strong>
            </div>
            <div className="match-vs">vs</div>
            <div className="match-side-card">
              <small>{detail.teamBName}</small>
              <strong>{playerLine(detail.rightPlayers)}</strong>
            </div>
          </div>
          <div className="match-set">
            <span>Set 1</span>
            <div className="match-scores">
              <span>{detail.score1 ?? '-'}</span>
              <b>-</b>
              <span>{detail.score2 ?? '-'}</span>
            </div>
          </div>
        </div>

        <div className="match-modal-foot">
          <button type="button" className="match-modal-refresh" onClick={onRefresh}><RefreshCw size={14} /> Refresh</button>
          <button type="button" className="match-modal-close" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

const LeagueTimetable = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [view, setView] = useState('overall');
  const [filters, setFilters] = useState(['MS', 'MD', 'XD']);
  const [selected, setSelected] = useState(null);
  const [tournament, setTournament] = useState(() => (
    id === LAKSA_BOWL_ID ? ensureLaksaBowl50() : getKnockoutTournament(id)
  ));

  const reload = () => setTournament(id === LAKSA_BOWL_ID ? ensureLaksaBowl50() : getKnockoutTournament(id));
  const table = useMemo(() => tournament ? buildOverallTimetable(tournament) : null, [tournament]);
  const visible = useMemo(() => filterTimetable(table, filters), [table, filters]);

  const toggleFilter = (id) => {
    setFilters(current => {
      const next = current.includes(id)
        ? current.filter(item => item !== id)
        : [...current, id];
      return next.length ? next : current;
    });
  };

  const exportExcel = () => {
    if (!visible) return;
    const csv = timetableToCsv(visible);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tournament.title.replaceAll(' ', '_')}_timetable.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!tournament || !visible) {
    return (
      <div className="timetable-page">
        <p>Timetable not found.</p>
        <button type="button" onClick={() => navigate('/')}>Home</button>
      </div>
    );
  }

  return (
    <div className="timetable-page">
      <header className="timetable-header">
        <div className="bracket-brand">Badminton<span>Score</span></div>
        <div className="timetable-view-tabs">
          <button type="button" className={view === 'single' ? 'is-active' : ''} onClick={() => setView('single')}>Single</button>
          <button type="button" className={view === 'overall' ? 'is-active' : ''} onClick={() => setView('overall')}>Overall</button>
        </div>
        <h1>Overall Timetable</h1>
        <p>{table.date} | 09:00 - 23:00</p>
        <div className="league-toolbar">
          <button type="button" onClick={reload}><RefreshCw size={14} /> Refresh</button>
          <button type="button" className="timetable-excel" onClick={exportExcel}>
            <FileSpreadsheet size={14} /> Excel
          </button>
        </div>
        <div className="timetable-filters">
          {MATCH_FILTERS.map(filter => (
            <button
              key={filter.id}
              type="button"
              className={filters.includes(filter.id) ? 'is-active' : ''}
              onClick={() => toggleFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </header>

      {view === 'overall' ? (
        <div className="timetable-wrap">
          <table className="timetable-grid">
            <thead>
              <tr>
                <th>Time</th>
                {visible.courts.map(court => <th key={court}>Court {court}</th>)}
              </tr>
            </thead>
            <tbody>
              {visible.grid.map(row => (
                <tr key={row.time}>
                  <th>{row.time}</th>
                  {visible.courts.map(court => {
                    const cell = row.cells[court];
                    return (
                      <td key={court}>
                        {cell ? (
                          <button
                            type="button"
                            className={`timetable-cell tt-${cell.color}`}
                            onClick={() => setSelected(cell)}
                          >
                            <strong>{cell.label}</strong>
                            <span>{cell.type}</span>
                            <span>{cell.vs}</span>
                          </button>
                        ) : (
                          <div className="timetable-cell tt-empty">—</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="timetable-list">
          {visible.slots.map(slot => (
            <button
              key={slot.id}
              type="button"
              className={`timetable-list-row tt-${slot.color}`}
              onClick={() => setSelected(slot)}
            >
              <strong>{slot.time} · Court {slot.court}</strong>
              <span>{slot.label} · {slot.type}</span>
              <span>{slot.names}</span>
            </button>
          ))}
        </div>
      )}

      <footer className="bracket-footer">
        <button type="button" onClick={() => navigate(`/league/${tournament.id}`)} aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <button type="button" onClick={() => navigate('/')} aria-label="Home">
          <Home size={18} />
        </button>
      </footer>

      {selected ? (
        <MatchDetailModal
          slot={selected}
          onClose={() => setSelected(null)}
          onRefresh={reload}
        />
      ) : null}
    </div>
  );
};

export default LeagueTimetable;
