import { useNavigate } from 'react-router-dom';

export default function TopBar({ title, back, right }) {
  const navigate = useNavigate();
  return (
    <div className="topbar">
      {back && (
        <button className="icon-btn" onClick={() => navigate(back === true ? -1 : back)} aria-label="Back">
          ←
        </button>
      )}
      <h1>{title}</h1>
      {right}
    </div>
  );
}
