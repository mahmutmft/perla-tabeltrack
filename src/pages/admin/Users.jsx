import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState('waiter');
  const [error, setError] = useState('');

  function load() {
    api.listUsers().then((r) => setUsers(r.users));
  }

  useEffect(load, []);

  async function add(e) {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Name is required');
    if (!/^\d{4}$/.test(pin)) return setError('PIN must be exactly 4 digits');
    try {
      await api.createUser({ name: name.trim(), pin, role });
      setName('');
      setPin('');
      setRole('waiter');
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(id) {
    try {
      await api.deleteUser(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="list" style={{ marginTop: 4 }}>
      <form className="field" onSubmit={add} style={{ gap: 10 }}>
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="btn-row">
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            placeholder="4-digit PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="waiter">Waiter</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button className="btn primary" type="submit">
          Add account
        </button>
      </form>

      {error && <div className="error-text">{error}</div>}

      {users.map((u) => (
        <div className="product-row" key={u.id}>
          <div>
            <div className="name">{u.name}</div>
            <div className="price">{u.role}</div>
          </div>
          {u.id !== me.id && (
            <button className="remove-x" onClick={() => remove(u.id)}>
              ✕
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
