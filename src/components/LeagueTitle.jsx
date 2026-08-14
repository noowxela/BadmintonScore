import React from 'react';

const LeagueTitle = ({ tournament }) => {
  if (tournament?.logo) {
    return (
      <h1 className="league-logo-heading">
        <img src={tournament.logo} alt="" />
        <span className="league-logo-text">{tournament.title}</span>
      </h1>
    );
  }
  return <h1>{tournament?.title}</h1>;
};

export default LeagueTitle;
