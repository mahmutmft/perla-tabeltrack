import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import TopBar from '../components/TopBar.jsx';
import { formatPrice } from '../currency.js';

export default function AddItems() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({}); // product_id -> { itemId, quantity }
  const [activeCategory, setActiveCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const cartRef = useRef({});
  const queuesRef = useRef({}); // product_id -> promise chain, keeps taps from racing each other

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  function refreshCart(table) {
    const map = {};
    table.items
      .filter((i) => !i.delivered)
      .forEach((i) => {
        map[i.product_id] = { itemId: i.id, quantity: i.quantity };
      });
    setCart(map);
  }

  function resync() {
    return api
      .getTable(id)
      .then(({ table }) => refreshCart(table))
      .catch(() => {});
  }

  function runQueued(productId, task) {
    const previous = queuesRef.current[productId] || Promise.resolve();
    const next = previous.then(task, task);
    queuesRef.current[productId] = next;
    return next;
  }

  useEffect(() => {
    Promise.all([api.listCategories(), api.listProducts(), api.getTable(id)])
      .then(([catRes, prodRes, tableRes]) => {
        setCategories(catRes.categories);
        setProducts(prodRes.products);
        refreshCart(tableRes.table);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = activeCategory === 'all' || p.category_id === activeCategory;
      const matchesQuery = p.name.toLowerCase().includes(query.trim().toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [products, activeCategory, query]);

  function increment(product) {
    setError('');
    setCart((prev) => ({
      ...prev,
      [product.id]: {
        itemId: prev[product.id]?.itemId ?? null,
        quantity: (prev[product.id]?.quantity || 0) + 1,
      },
    }));
    runQueued(product.id, () =>
      api
        .addItem(id, product.id, 1)
        .then(({ table }) => refreshCart(table))
        .catch((err) => {
          setError(err.message);
          return resync();
        })
    );
  }

  function decrement(product) {
    if (!cart[product.id]) return;
    setError('');
    setCart((prev) => {
      const entry = prev[product.id];
      if (!entry) return prev;
      const nextQty = entry.quantity - 1;
      const copy = { ...prev };
      if (nextQty <= 0) delete copy[product.id];
      else copy[product.id] = { ...entry, quantity: nextQty };
      return copy;
    });
    runQueued(product.id, () => {
      const entry = cartRef.current[product.id];
      if (!entry?.itemId) return resync();
      const request =
        entry.quantity <= 1
          ? api.removeItem(id, entry.itemId)
          : api.setItemQuantity(id, entry.itemId, entry.quantity - 1);
      return request
        .then(({ table }) => refreshCart(table))
        .catch((err) => {
          setError(err.message);
          return resync();
        });
    });
  }

  return (
    <div className="screen">
      <TopBar title="Add Items" back={`/tables/${id}`} />

      <div className="search-bar">
        <span className="search-icon">🔎</span>
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="chip-row">
        <button
          className={`chip ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`chip ${activeCategory === c.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      {error && <div className="error-text">{error}</div>}

      <div className="product-list">
        {filtered.length === 0 && <div className="empty-state">No products match.</div>}
        {filtered.map((p) => {
          const qty = cart[p.id]?.quantity || 0;
          return (
            <div className="product-row" key={p.id}>
              <div>
                <div className="name">{p.name}</div>
                <div className="price">{formatPrice(p.price)}</div>
              </div>
              <div className="stepper">
                {qty > 0 && (
                  <>
                    <button onClick={() => decrement(p)}>−</button>
                    <span className="qty-badge">{qty}</span>
                  </>
                )}
                <button onClick={() => increment(p)}>+</button>
              </div>
            </div>
          );
        })}
      </div>

      <button className="btn primary" onClick={() => navigate(`/tables/${id}`)}>
        Done
      </button>
    </div>
  );
}
