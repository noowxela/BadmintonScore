import React, { useRef, useState } from 'react';
import {
  downloadExportFile,
  getAllAppData,
  importAllData
} from '../utils/storage';
import { Download, Upload, Database, AlertTriangle } from 'lucide-react';

const DataBackup = () => {
  const fileRef = useRef(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [importMode, setImportMode] = useState('merge');
  const snapshot = getAllAppData();

  const counts = {
    matches: snapshot.matchHistory?.length || 0,
    teamMatches: snapshot.teamMatchHistory?.length || 0,
    drafts: snapshot.savedConfigs?.length || 0,
    tournaments: snapshot.knockoutTournaments?.length || 0,
    players: snapshot.players?.length || 0
  };

  const handleExport = () => {
    setError('');
    downloadExportFile();
    setMessage('Backup downloaded.');
  };

  const handleImportFile = async (file) => {
    setError('');
    setMessage('');
    if (!file) return;

    try {
      const text = await file.text();
      if (importMode === 'replace') {
        const ok = window.confirm(
          'Replace ALL local data with this backup? Current matches, drafts, and roster will be overwritten.'
        );
        if (!ok) return;
      }

      importAllData(text, importMode);
      setMessage(
        importMode === 'replace'
          ? 'Backup restored (replaced local data). Reloading…'
          : 'Backup merged into local data. Reloading…'
      );
      setTimeout(() => window.location.reload(), 700);
    } catch (err) {
      setError(err.message || 'Could not import backup file');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.35rem' }}>Backup & restore</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          All app data lives in this browser. Export a JSON backup before clearing storage or switching devices.
        </p>
      </div>

      <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem' }}>
        {[
          ['Matches', counts.matches],
          ['Team ties', counts.teamMatches],
          ['Drafts', counts.drafts],
          ['Tournaments', counts.tournaments],
          ['Players', counts.players]
        ].map(([label, value]) => (
          <div key={label} style={{ textAlign: 'center', padding: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{label}</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </div>

      {message && (
        <div className="card" style={{ padding: '0.85rem 1rem', borderLeft: '4px solid var(--color-primary)', fontSize: '0.875rem' }}>
          {message}
        </div>
      )}
      {error && (
        <div className="card" style={{ padding: '0.85rem 1rem', borderLeft: '4px solid var(--color-danger)', color: 'var(--color-danger)', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <div className="card" style={{ display: 'grid', gap: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <Download size={18} /> Export
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Downloads a JSON file with match history, team matches, drafts, tournaments, and the player roster.
        </p>
        <button type="button" className="btn btn-primary" onClick={handleExport}>
          Download backup
        </button>
      </div>

      <div className="card" style={{ display: 'grid', gap: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <Upload size={18} /> Import
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <button
            type="button"
            className={`btn ${importMode === 'merge' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setImportMode('merge')}
          >
            Merge
          </button>
          <button
            type="button"
            className={`btn ${importMode === 'replace' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setImportMode('replace')}
          >
            Replace
          </button>
        </div>

        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          {importMode === 'merge'
            ? 'Merge keeps existing records and adds anything new from the file (players matched by id/name).'
            : 'Replace overwrites everything currently stored in this browser.'}
        </p>

        {importMode === 'replace' && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', color: 'var(--color-accent)', fontSize: '0.8rem' }}>
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            Export a backup first if you might need the current data again.
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={(e) => handleImportFile(e.target.files?.[0])}
        />
        <button type="button" className="btn btn-secondary" onClick={() => fileRef.current?.click()}>
          Choose backup file
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
        <Database size={14} /> Data stays on-device unless you export it.
      </div>
    </div>
  );
};

export default DataBackup;
