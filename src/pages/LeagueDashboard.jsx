import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarClock, CalendarDays, Check, Eye, Home, Info, RefreshCw, RotateCcw, Users, X } from 'lucide-react';
import { computeStandings } from '../utils/league';
import { AGENDA_POSTER, ensureLaksaBowl50, LAKSA_BOWL_ID, TEAM_POSTER } from '../data/laksaBowl50';
import { getKnockoutTournament } from '../utils/storage';
import LeagueTitle from '../components/LeagueTitle';

const rpClass = (value) => (value > 0 ? 'is-pos' : value < 0 ? 'is-neg' : '');

const formatRp = (value) => (value > 0 ? `+${value}` : String(value));

const STAT_LEGEND = [
  { code: 'GW', description: 'Total Group Match Won' },
  { code: 'GL', description: 'Total Group Match Lost' },
  { code: 'TW', description: 'Total Wins for each Pair Match' },
  { code: 'TL', description: 'Total Losses for each Pair Match' },
  { code: 'GP', description: 'Gain Points (ex: Winning 21-15 will gain 21 GP)' },
  { code: 'LP', description: 'Lose Points (ex: Losing 18-21 will gain 18 LP)' },
  { code: 'RP', description: 'Result Points (= Gain Points - Lose Points)' }
];

const RANK_RULES = [
  { code: 'GW', direction: 'Higher is better' },
  { code: 'GL', direction: 'Lower is better' },
  { code: 'TW', direction: 'Higher is better' },
  { code: 'TL', direction: 'Lower is better' },
  { code: 'RP', direction: 'Higher is better' },
  { code: 'GP', direction: 'Higher is better' },
  { code: 'LP', direction: 'Lower is better' }
];

const RuleLegendModal = ({ onClose }) => (
  <div className="bracket-modal" onClick={onClose}>
    <div className="rule-modal" onClick={e => e.stopPropagation()}>
      <div className="rule-modal-head">
        <h3><Info size={20} color="#2563eb" /> Legend (Match Stats)</h3>
        <button type="button" className="rule-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
      </div>
      <table className="rule-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {STAT_LEGEND.map(row => (
            <tr key={row.code}>
              <td><strong>{row.code}</strong></td>
              <td>{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="rule-sort">
        <h4>How Rank Is Sorted</h4>
        <p>Teams are ranked using these rules in order. If tied, we move to the next rule:</p>
        <ol>
          {RANK_RULES.map((row, index) => (
            <li key={row.code}>
              <strong>{index + 1}. {row.code}:</strong> {row.direction}
            </li>
          ))}
        </ol>
        <p className="rule-empty">Empty values are placed last for each rule.</p>
      </div>
      <button type="button" className="rule-got-it" onClick={onClose}>
        <Check size={18} /> Got it
      </button>
    </div>
  </div>
);

const PosterModal = ({ src, title, alt, icon, onClose }) => (
  <div className="bracket-modal" onClick={onClose}>
    <div className="team-poster-modal" onClick={e => e.stopPropagation()}>
      <div className="team-poster-head">
        <h3>{icon} {title}</h3>
        <button type="button" className="rule-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
      </div>
      <div className="team-poster-frame">
        <img src={src} alt={alt} />
      </div>
    </div>
  </div>
);

const GroupTable = ({ title, rows, onViewMatches, onOpenRules }) => (
  <section className="league-group">
    <div className="league-group-head">
      <h2>{title}</h2>
      <button type="button" onClick={onViewMatches}><Eye size={14} /> View Matches</button>
    </div>
    <div className="league-table-wrap">
      <table className="league-table">
        <thead>
          <tr>
            <th>
              <span className="league-team-head">
                Team
                <button type="button" className="rule-chip" onClick={onOpenRules}>
                  Rule
                </button>
              </span>
            </th>
            <th>GW</th>
            <th>GL</th>
            <th>TW</th>
            <th>TL</th>
            <th>GP</th>
            <th>LP</th>
            <th>RP</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.team.id} className={index < 2 ? 'is-qualified' : ''}>
              <td>
                <div className="league-team-cell">
                  {row.team.logo && (
                    <img className="league-team-logo" src={row.team.logo} alt="" />
                  )}
                  <div>
                    <strong>{row.team.code}: {row.team.name}</strong>
                    {index < 2 && <span className="league-qual">Winner pool</span>}
                  </div>
                </div>
              </td>
              <td>{row.GW}</td>
              <td>{row.GL}</td>
              <td>{row.TW}</td>
              <td>{row.TL}</td>
              <td>{row.GP}</td>
              <td>{row.LP}</td>
              <td className={rpClass(row.RP)}>{formatRp(row.RP)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

const LeagueDashboard = ({ onOpenTie }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(() => (
    id === LAKSA_BOWL_ID ? ensureLaksaBowl50() : getKnockoutTournament(id)
  ));
  const [groupMatches, setGroupMatches] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [showPoster, setShowPoster] = useState(false);
  const [showAgenda, setShowAgenda] = useState(false);

  const reload = () => setTournament(id === LAKSA_BOWL_ID ? ensureLaksaBowl50() : getKnockoutTournament(id));

  const groupA = useMemo(() => tournament ? computeStandings(tournament.teams, tournament.ties, 'A') : [], [tournament]);
  const groupB = useMemo(() => tournament ? computeStandings(tournament.teams, tournament.ties, 'B') : [], [tournament]);

  const resetExample = () => {
    if (id !== LAKSA_BOWL_ID) return;
    setTournament(ensureLaksaBowl50(true));
    setGroupMatches(null);
  };

  if (!tournament) {
    return (
      <div className="league-page">
        <div className="league-empty">
          <p>League not found.</p>
          <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => navigate('/')}>Home</button>
        </div>
      </div>
    );
  }

  const tiesForGroup = (group) => (tournament.ties || []).filter(tie => tie.group === group);
  const teamName = (teamId) => tournament.teams.find(team => team.id === teamId)?.name || teamId;

  return (
    <div className="league-page">
      <header className="league-header">
        <div className="bracket-brand">Badminton<span>Score</span></div>
        <LeagueTitle tournament={tournament} />
        <p>{tournament.subtitle || 'Group stage · top 2 to winner pool, the rest to loser pool'}</p>
        <p className="league-meta">Each team fight: Men Singles · Men Doubles · Mixed Doubles</p>
        <div className="league-toolbar">
          <button type="button" onClick={reload}><RefreshCw size={14} /> Refresh</button>
          {id === LAKSA_BOWL_ID && (
            <button type="button" onClick={resetExample}><RotateCcw size={14} /> Reset example</button>
          )}
          <button type="button" className="league-ko-btn" onClick={() => navigate(`/league/${tournament.id}/timetable`)}>
            <CalendarClock size={14} /> Timetable
          </button>
          <button type="button" className="league-poster-btn" onClick={() => setShowPoster(true)}>
            <Users size={14} /> Team poster
          </button>
          <button type="button" className="league-agenda-btn" onClick={() => setShowAgenda(true)}>
            <CalendarDays size={14} /> Agenda poster
          </button>
        </div>
        <div className="bracket-tabs">
          <button type="button" className="is-active">1: Group Stage</button>
          <button type="button" onClick={() => navigate(`/knockout/${tournament.id}?event=0`)}>2: Winner Pool Cup</button>
          <button type="button" onClick={() => navigate(`/knockout/${tournament.id}?event=1`)}>3: Loser Pool Cup</button>
        </div>
      </header>

      <div className="league-grid">
        <GroupTable title="Group A" rows={groupA} onViewMatches={() => setGroupMatches('A')} onOpenRules={() => setShowRules(true)} />
        <GroupTable title="Group B" rows={groupB} onViewMatches={() => setGroupMatches('B')} onOpenRules={() => setShowRules(true)} />
      </div>

      <p className="league-note">No current matches — group stage is complete. Top 2 from each group are in the winner-pool semifinals.</p>

      <footer className="bracket-footer">
        <button type="button" onClick={() => navigate('/')} aria-label="Back"><ArrowLeft size={18} /></button>
        <button type="button" onClick={() => navigate('/')} aria-label="Home"><Home size={18} /></button>
      </footer>

      {showRules && <RuleLegendModal onClose={() => setShowRules(false)} />}
      {showPoster && (
        <PosterModal
          src={tournament.poster || TEAM_POSTER}
          title="Team assignments"
          alt="Laksa Bowl team assignments poster"
          icon={<Users size={20} color="#2563eb" />}
          onClose={() => setShowPoster(false)}
        />
      )}
      {showAgenda && (
        <PosterModal
          src={tournament.agendaPoster || AGENDA_POSTER}
          title="Day program flow"
          alt="Laksa Bowl agenda poster"
          icon={<CalendarDays size={20} color="#eab308" />}
          onClose={() => setShowAgenda(false)}
        />
      )}

      {groupMatches && (
        <div className="bracket-modal" onClick={() => setGroupMatches(null)}>
          <div className="bracket-modal-card league-match-list" onClick={e => e.stopPropagation()}>
            <h3>Group {groupMatches} matches</h3>
            {tiesForGroup(groupMatches).map(tie => (
              <button
                key={tie.id}
                type="button"
                className="league-tie-row"
                onClick={() => onOpenTie({
                  ...tie,
                  league: { tournamentId: tournament.id, tieId: tie.id }
                })}
              >
                <strong>{teamName(tie.teamAId)} vs {teamName(tie.teamBId)}</strong>
                <span>{tie.scoreA} - {tie.scoreB}</span>
                <small>MS · MD · XD</small>
              </button>
            ))}
            <button type="button" className="btn btn-secondary" onClick={() => setGroupMatches(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeagueDashboard;
