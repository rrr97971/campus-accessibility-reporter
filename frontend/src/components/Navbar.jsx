import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
      <div className="container row" style={{ justifyContent: 'space-between', height: 68 }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'var(--color-text)' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.15rem' }}>
            ♿ Campus Accessibility Reporter
          </span>
        </Link>

        <nav className="row gap-4">
          {!user && (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          )}
          {user && user.role === 'student' && (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/my-reports">My Reports</Link>
              <Link to="/report">Report an Issue</Link>
              <Link to="/profile">Profile</Link>
            </>
          )}
          {user && user.role === 'admin' && (
            <>
              <Link to="/admin/dashboard">Admin Dashboard</Link>
              <Link to="/admin/issues">All Issues</Link>
              <Link to="/profile">Profile</Link>
            </>
          )}
          {user && (
            <button className="btn btn-secondary" onClick={handleLogout}>
              Log out
            </button>
          )}
                  <button
            className="btn btn-secondary"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </nav>
      </div>
    </header>
  );
}
