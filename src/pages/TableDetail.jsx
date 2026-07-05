import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import TopBar from '../components/TopBar.jsx';
import { formatPrice } from '../currency.js';

export default function TableDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [table, setTable] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    function load() {
      api
        .getTable(id)
        .then(({ table }) => !cancelled && setTable(table))
        .catch((err) => !cancelled && setError(err.message));
    }
    load();
    const interval = setInterval(load, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [id]);

  async function toggleDelivered(item) {
    setTable((t) => ({
      ...t,
      items: t.items.map((i) => (i.id === item.id ? { ...i, delivered: item.delivered ? 0 : 1 } : i)),
    }));
    try {
      const { table } = await api.setItemDelivered(id, item.id, !item.delivered);
      setTable(table);
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeItem(item) {
    try {
      const { table } = await api.removeItem(id, item.id);
      setTable(table);
    } catch (err) {
      setError(err.message);
    }
  }

  if (!table) {
    return (
      <div className="screen">
        <TopBar title="Table" back="/tables" />
        {error && <div className="error-text">{error}</div>}
      </div>
    );
  }

  if (table.status !== 'open') {
    return (
      <div className="screen">
        <TopBar title={table.name} back="/tables" />
        <div className="empty-state">This table has been paid and closed.</div>
      </div>
    );
  }

  return (
    <div className="screen">
      <TopBar title={`#${table.id} · ${table.name}`} back="/tables" />

      {error && <div className="error-text">{error}</div>}

      {table.items.length === 0 && (
        <div className="empty-state">No items yet. Add what the table ordered.</div>
      )}

      <div className="list">
        {table.items.map((item) => (
          <div key={item.id} className={`item-row ${item.delivered ? 'delivered' : ''}`}>
            <button
              className={`check-toggle ${item.delivered ? 'checked' : ''}`}
              onClick={() => toggleDelivered(item)}
              aria-label="Mark delivered"
            >
              {item.delivered ? '✓' : ''}
            </button>
            <div className="details">
              <div className="name">
                {item.quantity}× {item.name_snapshot}
              </div>
              <div className="sub">{item.delivered ? 'Delivered' : 'Not delivered yet'}</div>
            </div>
            <button className="remove-x" onClick={() => removeItem(item)} aria-label="Remove">
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="total-bar">
        <span>Total</span>
        <span className="amount">{formatPrice(table.total)}</span>
      </div>

      <div className="btn-row">
        <button className="btn ghost" onClick={() => navigate(`/tables/${id}/add`)}>
          + Add items
        </button>
        <button
          className="btn success"
          disabled={table.items.length === 0}
          onClick={() => navigate(`/tables/${id}/pay`)}
        >
          Pay
        </button>
      </div>
    </div>
  );
}
