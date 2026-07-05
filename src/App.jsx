import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import NewTable from './pages/NewTable.jsx';
import Tables from './pages/Tables.jsx';
import TableDetail from './pages/TableDetail.jsx';
import AddItems from './pages/AddItems.jsx';
import Pay from './pages/Pay.jsx';
import Admin from './pages/admin/Admin.jsx';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        }
      />
      <Route
        path="/tables"
        element={
          <RequireAuth>
            <Tables />
          </RequireAuth>
        }
      />
      <Route
        path="/tables/new"
        element={
          <RequireAuth>
            <NewTable />
          </RequireAuth>
        }
      />
      <Route
        path="/tables/:id"
        element={
          <RequireAuth>
            <TableDetail />
          </RequireAuth>
        }
      />
      <Route
        path="/tables/:id/add"
        element={
          <RequireAuth>
            <AddItems />
          </RequireAuth>
        }
      />
      <Route
        path="/tables/:id/pay"
        element={
          <RequireAuth>
            <Pay />
          </RequireAuth>
        }
      />
      <Route
        path="/admin/*"
        element={
          <RequireAdmin>
            <Admin />
          </RequireAdmin>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
