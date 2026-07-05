import { useEffect, useState } from 'react';
import { api } from '../../api.js';
import { formatPrice } from '../../currency.js';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  function load() {
    Promise.all([api.listAllProducts(), api.listCategories()]).then(([p, c]) => {
      setProducts(p.products);
      setCategories(c.categories);
    });
  }

  useEffect(load, []);

  async function add(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');
    try {
      await api.createProduct({
        name: name.trim(),
        price: Number(price) || 0,
        category_id: categoryId || null,
      });
      setName('');
      setPrice('');
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(id) {
    try {
      await api.deleteProduct(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(p) {
    setError('');
    setEditingId(p.id);
    setEditName(p.name);
    setEditPrice(String(p.price));
    setEditCategoryId(p.category_id ? String(p.category_id) : '');
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(e) {
    e.preventDefault();
    if (!editName.trim()) return;
    setSavingEdit(true);
    setError('');
    try {
      await api.updateProduct(editingId, {
        name: editName.trim(),
        price: Number(editPrice) || 0,
        category_id: editCategoryId || null,
      });
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div className="list" style={{ marginTop: 4 }}>
      <form className="field" onSubmit={add} style={{ gap: 10 }}>
        <input type="text" placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="btn-row">
          <input
            type="number"
            step="1"
            placeholder="Price (ден)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button className="btn primary" type="submit">
          Add product
        </button>
      </form>

      {error && <div className="error-text">{error}</div>}

      {products
        .filter((p) => p.active)
        .map((p) =>
          editingId === p.id ? (
            <form className="field" onSubmit={saveEdit} key={p.id} style={{ gap: 10 }}>
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} />
              <div className="btn-row">
                <input
                  type="number"
                  step="1"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                />
                <select value={editCategoryId} onChange={(e) => setEditCategoryId(e.target.value)}>
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="btn-row">
                <button className="btn ghost" type="button" onClick={cancelEdit}>
                  Cancel
                </button>
                <button className="btn primary" type="submit" disabled={savingEdit}>
                  Save
                </button>
              </div>
            </form>
          ) : (
            <div className="product-row editable" key={p.id} onClick={() => startEdit(p)}>
              <div>
                <div className="name">{p.name}</div>
                <div className="price">
                  {formatPrice(p.price)} {p.category_name ? `· ${p.category_name}` : ''}
                </div>
              </div>
              <button
                className="remove-x"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(p.id);
                }}
              >
                ✕
              </button>
            </div>
          )
        )}
      {products.filter((p) => p.active).length === 0 && (
        <div className="empty-state">No products yet.</div>
      )}
    </div>
  );
}
