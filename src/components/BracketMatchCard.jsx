import React from 'react';
import { canPlayMatch, formatMatchTime, sideLabel } from '../utils/bracket';

const SideRow = ({ side, score, isWinner, pending }) => (
  <div className={`bracket-side${isWinner ? ' is-winner' : ''}${pending ? ' is-pending' : ''}`}>
    <span className="bracket-side-name">{sideLabel(side)}</span>
    <span className="bracket-side-score">{pending ? '' : score}</span>
  </div>
);

const BracketMatchCard = ({ match, onPlay, cardRef }) => {
  const pending = !match.pair1?.id || !match.pair2?.id;
  const playable = canPlayMatch(match);
  const meta = [
    match.court ? `Court ${match.court}` : null,
    formatMatchTime(match.startTime)
  ].filter(Boolean);

  return (
    <article className="bracket-card" ref={cardRef} data-match-id={match.id}>
      <div className="bracket-card-meta">
        {meta.length ? meta.join(' | ') : match.roundName}
      </div>
      <div className="bracket-card-body">
        <div className="bracket-card-sides">
          <SideRow
            side={match.pair1}
            score={match.score1}
            isWinner={match.winner === 1}
            pending={pending && !match.pair1?.id}
          />
          <SideRow
            side={match.pair2}
            score={match.score2}
            isWinner={match.winner === 2}
            pending={pending && !match.pair2?.id}
          />
        </div>
        <button
          type="button"
          className="bracket-match-btn"
          disabled={!playable}
          onClick={() => playable && onPlay(match)}
        >
          Match
        </button>
      </div>
    </article>
  );
};

export default BracketMatchCard;
