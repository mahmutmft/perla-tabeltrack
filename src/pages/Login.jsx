import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import PinPad from '../components/PinPad.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const [needsBootstrap, setNeedsBootstrap] = useState(null);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .bootstrapNeeded()
      .then(({ needed }) => setNeedsBootstrap(needed))
      .catch(() => setNeedsBootstrap(false));
  }, []);

  useEffect(() => {
    if (!needsBootstrap && pin.length === 4 && !busy) {
      signIn(pin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, needsBootstrap]);

  if (user) return <Navigate to="/" replace />;

  async function signIn(enteredPin) {
    setError('');
    setBusy(true);
    try {
      const { token, user } = await api.login(enteredPin);
      login(token, user);
    } catch (err) {
      setError(err.message);
      setPin('');
    } finally {
      setBusy(false);
    }
  }

  async function submitBootstrap(e) {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Enter your name');
    if (pin.length !== 4) return setError('PIN must be 4 digits');

    setBusy(true);
    try {
      const { token, user } = await api.bootstrap(name.trim(), pin);
      login(token, user);
    } catch (err) {
      setError(err.message);
      setPin('');
    } finally {
      setBusy(false);
    }
  }

  if (needsBootstrap === null) return null;

  if (needsBootstrap) {
    return (
      <div className="screen">
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <h1 style={{ marginBottom: 4 }}>Perla TableTrack</h1>
          <p className="muted">Set up the first admin account</p>
        </div>

        <form className="field" onSubmit={submitBootstrap} style={{ gap: 20 }}>
          <div className="field">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="off"
            />
          </div>

          <div className="field">
            <label>4-digit PIN</label>
            <PinPad value={pin} onChange={setPin} />
          </div>

          {error && <div className="error-text">{error}</div>}

          <button className="btn primary" type="submit" disabled={busy}>
            Create admin account
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="screen">
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <h1 style={{ marginBottom: 4 }}>Perla TableTrack</h1>
        <p className="muted">Enter your PIN</p>
      </div>

      <div className="field" style={{ gap: 20 }}>
        <PinPad value={pin} onChange={setPin} />
        {error && <div className="error-text">{error}</div>}
      </div>
    </div>
  );
}
