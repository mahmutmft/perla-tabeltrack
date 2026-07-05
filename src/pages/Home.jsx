import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <div className="screen">
      <div className="topbar">
        <h1>Hi, {user?.name}</h1>
        {user?.role === 'admin' && (
          <button className="icon-btn" onClick={() => navigate('/admin')} aria-label="Admin">
            ⚙️
          </button>
        )}
        <button className="icon-btn" onClick={logout} aria-label="Log out">
          ⏻
        </button>
      </div>

      <div className="big-buttons">
        <button className="big-button primary" onClick={() => navigate('/tables/new')}>
          <span className="emoji">➕</span>
          Add Table
        </button>
        <button className="big-button" onClick={() => navigate('/tables')}>
          <span className="emoji">🍽️</span>
          See Existing
        </button>
      </div>
    </div>
  );
}
