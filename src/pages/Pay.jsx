import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import TopBar from '../components/TopBar.jsx';
import { formatPrice } from '../currency.js';

export default function Pay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [table, setTable] = useState(null);
  const [step, setStep] = useState('select'); // select -> confirm
  const [showCustomer, setShowCustomer] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .getTable(id)
      .then(({ table }) => setTable(table))
      .catch((err) => setError(err.message));
  }, [id]);

  async function confirmClose() {
    setBusy(true);
    setError('');
    try {
      await api.payTable(id, 'cash');
      navigate('/tables', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  if (!table) {
    return (
      <div className="screen">
        <TopBar title="Pay" back={`/tables/${id}`} />
        {error && <div className="error-text">{error}</div>}
      </div>
    );
  }

  if (showCustomer) {
    return (
      <div className="screen" onClick={() => setShowCustomer(false)}>
        <div className="center-flex">
          <span className="muted">Total due</span>
          <span className="customer-total">{formatPrice(table.total)}</span>
          <span className="muted">Tap anywhere to go back</span>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <TopBar title={`Pay · ${table.name}`} back={`/tables/${id}`} />

      {step === 'select' && (
        <div className="big-buttons">
          <div className="total-bar">
            <span>Total</span>
            <span className="amount">{formatPrice(table.total)}</span>
          </div>
          <button className="big-button primary" onClick={() => setStep('confirm')}>
            <span className="emoji">💵</span>
            Cash
          </button>
        </div>
      )}

      {step === 'confirm' && (
        <div className="center-flex">
          <span className="muted">Amount due</span>
          <span className="customer-total">{formatPrice(table.total)}</span>

          {error && <div className="error-text">{error}</div>}

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button className="btn ghost" onClick={() => setShowCustomer(true)}>
              Show total to customer
            </button>
            <button className="btn success" onClick={confirmClose} disabled={busy}>
              Confirm cash received & close table
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
