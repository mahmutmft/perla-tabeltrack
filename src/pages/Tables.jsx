import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import TopBar from '../components/TopBar.jsx';
import { timeAgo } from '../timeAgo.js';

export default function Tables() {
  const navigate = useNavigate();
  const [tables, setTables] = useState(null);
  const [error, setError] = useState('');
  const fetchingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    function load() {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      api
        .listTables()
        .then(({ tables }) => !cancelled && setTables(tables))
        .catch((err) => !cancelled && setError(err.message))
        .finally(() => {
          fetchingRef.current = false;
        });
    }
    load();
    const interval = setInterval(load, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="screen">
      <TopBar title="Existing Tables" back="/" />

      {error && <div className="error-text">{error}</div>}

      {tables && tables.length === 0 && (
        <div className="empty-state">No open tables right now. Add one from the home screen.</div>
      )}

      {tables && tables.length > 0 && (
        <div className="tables-grid">
          {tables.map((t) => {
            const pendingCount = t.items.filter((i) => !i.delivered).length;
            return (
              <button key={t.id} className="table-card" onClick={() => navigate(`/tables/${t.id}`)}>
                <span className="num">TABLE #{t.id}</span>
                <span className="name">{t.name}</span>
                <span className="meta">
                  {t.items.length} item{t.items.length === 1 ? '' : 's'}
                  {pendingCount > 0 ? ` · ${pendingCount} pending` : ' · all delivered'}
                </span>
                <span className="meta">{timeAgo(t.opened_at)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
