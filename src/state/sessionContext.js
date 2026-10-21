import React from 'react';

export const MatchSessionContext = React.createContext(null);

export const useMatchSession = () => {
  const value = React.useContext(MatchSessionContext);
  if (!value) throw new Error('useMatchSession must be used inside MatchSessionProvider');
  return value;
};
