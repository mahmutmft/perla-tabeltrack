import { useNavigate, Route, Routes, useLocation } from 'react-router-dom';
import TopBar from '../../components/TopBar.jsx';
import Categories from './Categories.jsx';
import Products from './Products.jsx';
import Users from './Users.jsx';

const TABS = [
  { path: '/admin', label: 'Categories' },
  { path: '/admin/products', label: 'Products' },
  { path: '/admin/users', label: 'Users' },
];

export default function Admin() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="screen">
      <TopBar title="Admin" back="/" />

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.path}
            className={location.pathname === t.path ? 'active' : ''}
            onClick={() => navigate(t.path)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Routes>
        <Route index element={<Categories />} />
        <Route path="products" element={<Products />} />
        <Route path="users" element={<Users />} />
      </Routes>
    </div>
  );
}
