import { useEffect, useState } from 'react';
import { api } from '../../api.js';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  function load() {
    api.listCategories().then((r) => setCategories(r.categories));
  }

  useEffect(load, []);

  async function add(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');
    try {
      await api.createCategory({ name: name.trim() });
      setName('');
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(id) {
    try {
      await api.deleteCategory(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="list" style={{ marginTop: 4 }}>
      <form className="btn-row" onSubmit={add}>
        <input
          type="text"
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="btn primary" type="submit" style={{ flex: '0 0 auto', width: 80 }}>
          Add
        </button>
      </form>

      {error && <div className="error-text">{error}</div>}

      {categories.map((c) => (
        <div className="row-between item-row" key={c.id}>
          <span className="name">{c.name}</span>
          <button className="remove-x" onClick={() => remove(c.id)}>
            ✕
          </button>
        </div>
      ))}
      {categories.length === 0 && <div className="empty-state">No categories yet.</div>}
    </div>
  );
}
