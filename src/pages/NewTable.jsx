import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import TopBar from '../components/TopBar.jsx';

export default function NewTable() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return setError('Give the table a name');
    setBusy(true);
    setError('');
    try {
      const { table } = await api.createTable(name.trim());
      navigate(`/tables/${table.id}/add`, { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="screen">
      <TopBar title="New Table" back="/" />

      <form className="field" onSubmit={submit} style={{ gap: 20, flex: 1 }}>
        <div className="field">
          <label>Table name</label>
          <input
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Window Booth, John's Party"
          />
          <span className="muted">Duplicate names are fine — this is just to help you remember.</span>
        </div>

        {error && <div className="error-text">{error}</div>}

        <button className="btn primary" type="submit" disabled={busy}>
          Continue to order
        </button>
      </form>
    </div>
  );
}
