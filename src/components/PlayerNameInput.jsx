import React, { useMemo } from 'react';
import { getPlayers } from '../utils/storage';

/**
 * Text input with roster datalist suggestions.
 * Keeps the existing string-based match model while helping pick roster names.
 */
const PlayerNameInput = ({
  value,
  onChange,
  placeholder,
  required = false,
  className = 'input',
  style,
  listId = 'roster-players',
  extraOptions = []
}) => {
  const options = useMemo(() => {
    const names = new Set();
    getPlayers().forEach((p) => {
      names.add(p.name);
      (p.aliases || []).forEach((alias) => names.add(alias));
    });
    extraOptions.filter(Boolean).forEach((name) => names.add(name));
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [extraOptions]);

  return (
    <>
      <input
        className={className}
        list={listId}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete="off"
        style={style}
      />
      <datalist id={listId}>
        {options.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
    </>
  );
};

export default PlayerNameInput;
