import React, { useRef, useState } from 'react';
import {
  downloadExportFile,
  getAllAppData,
  importAllData
} from '../../utils/storage';
import { Download, Upload, Database, AlertTriangle } from 'lucide-react';
import { askConfirm } from '../../ui/confirm';

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
        const ok = await askConfirm(
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
    <div className="sx-6" >
      <div>
        <h2 className="sx-7" >Backup & restore</h2>
        <p className="sx-8" >
          All app data lives in this browser. Export a JSON backup before clearing storage or switching devices.
        </p>
      </div>

      <div className="card sx-9" >
        {[
          ['Matches', counts.matches],
          ['Team ties', counts.teamMatches],
          ['Drafts', counts.drafts],
          ['Tournaments', counts.tournaments],
          ['Players', counts.players]
        ].map(([label, value]) => (
          <div key={label} className="sx-10" >
            <div className="sx-11" >{label}</div>
            <div className="sx-12" >{value}</div>
          </div>
        ))}
      </div>

      {message && (
        <div className="card sx-13" >
          {message}
        </div>
      )}
      {error && (
        <div className="card sx-14" >
          {error}
        </div>
      )}

      <div className="card sx-15" >
        <div className="sx-16" >
          <Download size={18} /> Export
        </div>
        <p className="sx-8" >
          Downloads a JSON file with match history, team matches, drafts, tournaments, and the player roster.
        </p>
        <button type="button" className="btn btn-primary btn-block" onClick={handleExport}>
          Download backup
        </button>
      </div>

      <div className="card sx-15" >
        <div className="sx-16" >
          <Upload size={18} /> Import
        </div>

        <div className="sx-17" >
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

        <p className="sx-8" >
          {importMode === 'merge'
            ? 'Merge keeps existing records and adds anything new from the file (players matched by id/name).'
            : 'Replace overwrites everything currently stored in this browser.'}
        </p>

        {importMode === 'replace' && (
          <div className="sx-18" >
            <AlertTriangle size={16} className="sx-19"  />
            Export a backup first if you might need the current data again.
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="sx-20" 
          onChange={(e) => handleImportFile(e.target.files?.[0])}
        />
        <button type="button" className="btn btn-secondary btn-block" onClick={() => fileRef.current?.click()}>
          Choose backup file
        </button>
      </div>

      <div className="sx-21" >
        <Database size={14} /> Data stays on-device unless you export it.
      </div>
    </div>
  );
};

export default DataBackup;
