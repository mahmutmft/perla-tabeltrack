const BASE = '/api';

function getToken() {
  return localStorage.getItem('perla_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

export const api = {
  bootstrapNeeded: () => request('/auth/bootstrap-needed'),
  bootstrap: (name, pin) => request('/auth/bootstrap', { method: 'POST', body: { name, pin } }),
  login: (pin) => request('/auth/login', { method: 'POST', body: { pin } }),
  me: () => request('/auth/me'),
  listUsers: () => request('/auth/users'),
  createUser: (payload) => request('/auth/users', { method: 'POST', body: payload }),
  deleteUser: (id) => request(`/auth/users/${id}`, { method: 'DELETE' }),

  listCategories: () => request('/categories'),
  createCategory: (payload) => request('/categories', { method: 'POST', body: payload }),
  updateCategory: (id, payload) => request(`/categories/${id}`, { method: 'PUT', body: payload }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  listProducts: (q) => request(`/products${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  listAllProducts: () => request('/products/all'),
  createProduct: (payload) => request('/products', { method: 'POST', body: payload }),
  updateProduct: (id, payload) => request(`/products/${id}`, { method: 'PUT', body: payload }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  listTables: () => request('/tables'),
  createTable: (name) => request('/tables', { method: 'POST', body: { name } }),
  getTable: (id) => request(`/tables/${id}`),
  addItem: (tableId, product_id, quantity = 1) =>
    request(`/tables/${tableId}/items`, { method: 'POST', body: { product_id, quantity } }),
  setItemDelivered: (tableId, itemId, delivered) =>
    request(`/tables/${tableId}/items/${itemId}`, { method: 'PATCH', body: { delivered } }),
  setItemQuantity: (tableId, itemId, quantity) =>
    request(`/tables/${tableId}/items/${itemId}`, { method: 'PATCH', body: { quantity } }),
  removeItem: (tableId, itemId) =>
    request(`/tables/${tableId}/items/${itemId}`, { method: 'DELETE' }),
  payTable: (tableId, method = 'cash') =>
    request(`/tables/${tableId}/pay`, { method: 'POST', body: { method } }),
};

export function setToken(token) {
  if (token) localStorage.setItem('perla_token', token);
  else localStorage.removeItem('perla_token');
}

export function hasToken() {
  return Boolean(getToken());
}
