import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Home, Maximize, Minimize2, Plus, RefreshCw, Share2, CalendarClock
} from 'lucide-react';
import BracketMatchCard from './BracketMatchCard';
import LeagueTitle from '../league/LeagueTitle';
import ShareModal from '../../components/ui/ShareModal';
import { canPlayMatch, CATEGORIES, generateEventBracket, getCategoryMeta, sideLabel } from '../../utils/bracket';
import { createId } from '../../domain/ids';
import { getTournament } from '../../data/laksaBowl50';
import { saveKnockoutTournament } from '../../utils/storage';

const loadTournament = (tournamentId) => getTournament(tournamentId);

const KnockoutBracket = ({ onPlayMatch }) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tournamentId, setTournamentId] = useState(id);
  const [tournament, setTournament] = useState(() => loadTournament(id));
  const [eventIndex, setEventIndex] = useState(() => Number(searchParams.get('event') || 0));
  const [zoom, setZoom] = useState(() => {
    const stored = Number(sessionStorage.getItem('bracket_zoom') || '80');
    return Math.min(100, Math.max(50, stored));
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lines, setLines] = useState([]);
  const [showTimetable, setShowTimetable] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [addEventError, setAddEventError] = useState('');
  const [newEvent, setNewEvent] = useState({
    name: 'Loser Pool Cup',
    category: 'XD',
    level: 'L',
    includeBronze: true,
    pairsText: ''
  });

  const pageRef = useRef(null);
  const canvasRef = useRef(null);
  const cardRefs = useRef(new Map());

  const event = tournament?.events?.[eventIndex] || tournament?.events?.[0];
  const columns = useMemo(() => {
    if (!event) return [];
    const cols = event.rounds.map(round => ({ name: round.name, matches: round.matches }));
    if (event.bronzeMatch) {
      cols.push({ name: 'Bronze Medal', matches: [event.bronzeMatch] });
    }
    return cols;
  }, [event]);

  if (id !== tournamentId) {
    setTournamentId(id);
    setTournament(loadTournament(id));
    setEventIndex(0);
  }

  const reload = () => {
    setTournament(loadTournament(id));
  };

  useEffect(() => {
    sessionStorage.setItem('bracket_zoom', String(zoom));
  }, [zoom]);

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const setCardRef = (matchId, node) => {
    if (node) cardRefs.current.set(matchId, node);
    else cardRefs.current.delete(matchId);
  };

  useEffect(() => {
    const drawConnectors = () => {
      if (!event || !canvasRef.current) {
        setLines([]);
        return;
      }
      const canvasBox = canvasRef.current.getBoundingClientRect();
      const scale = zoom / 100;
      const next = [];

      event.rounds.forEach(round => {
        round.matches.forEach(match => {
          if (!match.nextMatchId) return;
          const from = cardRefs.current.get(match.id);
          const to = cardRefs.current.get(match.nextMatchId);
          if (!from || !to) return;
          const a = from.getBoundingClientRect();
          const b = to.getBoundingClientRect();
          const x1 = (a.right - canvasBox.left) / scale;
          const y1 = (a.top + a.height / 2 - canvasBox.top) / scale;
          const x2 = (b.left - canvasBox.left) / scale;
          const y2 = (b.top + b.height / 2 - canvasBox.top) / scale;
          const mid = x1 + (x2 - x1) / 2;
          next.push(`M ${x1} ${y1} H ${mid} V ${y2} H ${x2}`);
        });
      });
      setLines(prev => {
        if (prev.length === next.length && prev.every((path, index) => path === next[index])) {
          return prev;
        }
        return next;
      });
    };

    const frame = requestAnimationFrame(drawConnectors);
    const observer = new ResizeObserver(() => drawConnectors());
    if (canvasRef.current) observer.observe(canvasRef.current);
    window.addEventListener('resize', drawConnectors);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', drawConnectors);
    };
  }, [event, zoom, columns, tournament]);

  const shareUrl = (() => {
    const url = new URL(window.location.href);
    url.searchParams.set('event', String(eventIndex));
    return url.toString();
  })();

  const toggleFullscreen = async () => {
    if (!pageRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await pageRef.current.requestFullscreen();
    }
  };

  const handleAddEvent = () => {
    const meta = getCategoryMeta(newEvent.category);
    const pairs = newEvent.pairsText
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map((name) => ({ id: createId('pair'), name, p1: name, p2: '', isFreePass: false }));

    try {
      const generated = generateEventBracket({
        name: newEvent.name || `${meta.label} Loser Pool Cup`,
        category: newEvent.category,
        level: newEvent.level,
        pairs,
        includeBronze: newEvent.includeBronze
      });
      const next = {
        ...tournament,
        events: [...tournament.events, generated]
      };
      saveKnockoutTournament(next);
      setTournament(next);
      setEventIndex(next.events.length - 1);
      setAddEventError('');
      setShowAddEvent(false);
    } catch (err) {
      setAddEventError(err.message);
    }
  };

  if (!tournament || !event) {
    return (
      <div className="bracket-page">
        <div className="bracket-empty">
          <p>Bracket not found.</p>
          <button className="btn btn-primary sx-72"  onClick={() => navigate('/')}>Home</button>
        </div>
      </div>
    );
  }

  const timetable = [
    ...event.rounds.flatMap(round => round.matches.map(m => ({ ...m, roundName: round.name }))),
    ...(event.bronzeMatch ? [{ ...event.bronzeMatch, roundName: 'Bronze Medal' }] : [])
  ];

  return (
    <div className="bracket-page" ref={pageRef}>
      <header className="bracket-header">
        <div className="bracket-brand">Badminton<span>Score</span></div>
        <LeagueTitle tournament={tournament} />
        <p className="bracket-sub">
          Category: {event.name}{event.level ? ` | Level: ${event.level}` : ''}
        </p>
        <div className="bracket-toolbar">
          <button type="button" onClick={reload}><RefreshCw size={14} /> Refresh</button>
          <button type="button" onClick={() => setShowShare(true)}><Share2 size={14} /> Share</button>
          <button type="button" onClick={() => setShowTimetable(true)}><CalendarClock size={14} /> Timetable</button>
          <div className="bracket-zoom">
            <button type="button" onClick={() => setZoom(z => Math.max(50, z - 10))}>-</button>
            <input
              type="range"
              min="50"
              max="100"
              value={zoom}
              onChange={e => setZoom(Number(e.target.value))}
            />
            <button type="button" onClick={() => setZoom(z => Math.min(100, z + 10))}>+</button>
            <span>{zoom}%</span>
          </div>
          <button type="button" className="bracket-fs" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize size={14} />} Full Screen
          </button>
        </div>
        <div className="bracket-tabs">
          {tournament.format === 'league-knockout' ? (
            <>
              <button type="button" onClick={() => navigate(`/league/${tournament.id}`)}>1: Group Stage</button>
              <button
                type="button"
                className={eventIndex === 0 ? 'is-active' : ''}
                onClick={() => setEventIndex(0)}
              >
                2: Winner Pool Cup
              </button>
              <button
                type="button"
                className={eventIndex === 1 ? 'is-active' : ''}
                onClick={() => setEventIndex(1)}
              >
                3: Loser Pool Cup
              </button>
            </>
          ) : (
            <>
              {tournament.events.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={index === eventIndex ? 'is-active' : ''}
                  onClick={() => setEventIndex(index)}
                >
                  {index + 1}: {item.name}
                </button>
              ))}
              <button type="button" className="bracket-add-tab" onClick={() => setShowAddEvent(true)}>
                <Plus size={14} /> Category
              </button>
            </>
          )}
        </div>
      </header>

      <div className="bracket-viewport">
        <div className="bracket-scale" style={{ transform: `scale(${zoom / 100})` }}>
          <div className="bracket-canvas" ref={canvasRef}>
            <svg className="bracket-svg" aria-hidden="true">
              {lines.map(d => (
                <path key={d} d={d} fill="none" stroke="#ef4444" strokeWidth="2" />
              ))}
            </svg>
            {columns.map(column => (
              <section key={column.name} className="bracket-round">
                <h2>{column.name}</h2>
                <div className="bracket-round-matches">
                  {column.matches.map(match => (
                    <BracketMatchCard
                      key={match.id}
                      match={match}
                      onPlay={(m) => onPlayMatch(tournament, event, m)}
                      cardRef={(node) => setCardRef(match.id, node)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>

      <footer className="bracket-footer">
        <button type="button" onClick={() => navigate(tournament.format === 'league-knockout' ? `/league/${tournament.id}` : -1)} aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <button type="button" onClick={() => navigate('/')} aria-label="Home">
          <Home size={18} />
        </button>
      </footer>

      {showShare && (
        <ShareModal
          url={shareUrl}
          logo={tournament.logo}
          title="BadmintonScore"
          fileName={`${(tournament.title || 'bracket').replaceAll(/\s+/g, '_')}_qr.png`}
          onClose={() => setShowShare(false)}
        />
      )}

      {showTimetable && (
        <div className="bracket-modal" onClick={() => setShowTimetable(false)}>
          <div className="bracket-modal-card" onClick={e => e.stopPropagation()}>
            <h3>Timetable</h3>
            <div className="bracket-timetable">
              {timetable.map(match => (
                <div key={match.id} className="bracket-timetable-row">
                  <strong>{match.roundName} · No {match.matchNo}</strong>
                  <span>{sideLabel(match.pair1)} vs {sideLabel(match.pair2)}</span>
                  <span>{match.court ? `Court ${match.court}` : 'Court TBA'} · {match.startTime || 'Time TBA'}</span>
                  {canPlayMatch(match) && (
                    <button type="button" onClick={() => { setShowTimetable(false); onPlayMatch(tournament, event, match); }}>
                      Open match
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" className="btn btn-secondary btn-block" onClick={() => setShowTimetable(false)}>Close</button>
          </div>
        </div>
      )}

      {showAddEvent && (
        <div className="bracket-modal" onClick={() => setShowAddEvent(false)}>
          <div className="bracket-modal-card" onClick={e => e.stopPropagation()}>
            <h3>Add category</h3>
            {addEventError && (
              <p className="sx-73" >{addEventError}</p>
            )}
            <label className="label">Event name</label>
            <input className="input" value={newEvent.name} onChange={e => setNewEvent(v => ({ ...v, name: e.target.value }))} />
            <label className="label">Category</label>
            <select className="input" value={newEvent.category} onChange={e => setNewEvent(v => ({ ...v, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <label className="label">Level</label>
            <input className="input" value={newEvent.level} onChange={e => setNewEvent(v => ({ ...v, level: e.target.value }))} />
            <label className="label">Pairs (one name per line)</label>
            <textarea
              className="input"
              rows={6}
              value={newEvent.pairsText}
              onChange={e => setNewEvent(v => ({ ...v, pairsText: e.target.value }))}
              placeholder={'Kabus\nBadai\nOmbak\nBayu\nGuruh'}
            />
            <label className="sx-74" >
              <input
                type="checkbox"
                checked={newEvent.includeBronze}
                onChange={e => setNewEvent(v => ({ ...v, includeBronze: e.target.checked }))}
              />
              Bronze medal match
            </label>
            <div className="sx-5" >
              <button type="button" className="btn btn-secondary btn-block" onClick={() => setShowAddEvent(false)}>Cancel</button>
              <button type="button" className="btn btn-primary btn-block" onClick={handleAddEvent}>Generate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnockoutBracket;
