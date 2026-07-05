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
        .map((p) => (
          <div className="product-row" key={p.id}>
            <div>
              <div className="name">{p.name}</div>
              <div className="price">
                {formatPrice(p.price)} {p.category_name ? `· ${p.category_name}` : ''}
              </div>
            </div>
            <button className="remove-x" onClick={() => remove(p.id)}>
              ✕
            </button>
          </div>
        ))}
      {products.filter((p) => p.active).length === 0 && (
        <div className="empty-state">No products yet.</div>
      )}
    </div>
  );
}
