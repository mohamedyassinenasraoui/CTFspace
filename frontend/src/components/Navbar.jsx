import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          CTF Platform
        </Link>
        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/">Blog</Link>
              <Link to="/news">News Feed</Link>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/challenges">Challenges</Link>
              <Link to="/leaderboard">Leaderboard</Link>
              <Link to="/reviews">Reviews</Link>
              <Link to="/tutorials">Tutorials</Link>
              {user.role === 'admin' && (
                <Link to="/admin">Admin</Link>
              )}
              {user.avatar && (
                <img 
                  src={user.avatar} 
                  alt={user.username}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    marginRight: '0.5rem',
                    border: '2px solid #4a9eff'
                  }}
                />
              )}
              <span className="navbar-user">{user.username}</span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/">Blog</Link>
              <Link to="/news">News Feed</Link>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
              <Link to="/reviews">Reviews</Link>
              <Link to="/tutorials">Tutorials</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

