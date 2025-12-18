import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../utils/api.js';
import logo from '../assets/Gemini_Generated_Image_uhu42xuhu42xuhu4-removebg-preview.png';
import './Navbar.css';

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.teamId) {
      fetchTeam();
    }
  }, [user]);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      // Handle both string ID and populated object
      const teamId = typeof user.teamId === 'object' ? user.teamId._id : user.teamId;
      const response = await apiClient.get(`/api/teams/${teamId}`);
      setTeam(response.data.team);
    } catch (error) {
      console.error('Failed to fetch team:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        className={`sidebar-toggle ${isOpen ? 'open' : ''}`}
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {isOpen ? (
          <img src={logo} alt="CTF Platform Logo" className="toggle-logo" />
        ) : (
          <>
            <span></span>
            <span></span>
            <span></span>
          </>
        )}
      </button>

      {/* Overlay when sidebar is open on mobile - only closes on overlay click, not sidebar links */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand">
            <img src={logo} alt="CTF Platform Logo" className="sidebar-logo" />
            <div className="brand-text">
              <span className="brand-title">CTF Platform</span>
              <span className="brand-subtitle">Capture The Flag</span>
            </div>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {user ? (
            <>
              <Link to="/" className="sidebar-link">
                <span>📝</span> Blog
              </Link>
              <Link to="/news" className="sidebar-link">
                <span>📰</span> News Feed
              </Link>
              <Link to="/dashboard" className="sidebar-link">
                <span>📊</span> Dashboard
              </Link>
              <Link to="/challenges" className="sidebar-link">
                <span>🎯</span> Challenges
              </Link>
              <Link to="/leaderboard" className="sidebar-link">
                <span>🏆</span> Leaderboard
              </Link>
              <Link to="/team" className="sidebar-link">
                <span>👥</span> My Team
              </Link>
              <Link to="/reviews" className="sidebar-link">
                <span>⭐</span> Reviews
              </Link>
              <Link to="/tutorials" className="sidebar-link">
                <span>📚</span> Tutorials
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="sidebar-link">
                  <span>⚙️</span> Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/" className="sidebar-link">
                <span>📝</span> Blog
              </Link>
              <Link to="/news" className="sidebar-link">
                <span>📰</span> News Feed
              </Link>
              <Link to="/login" className="sidebar-link">
                <span>🔐</span> Login
              </Link>
              <Link to="/register" className="sidebar-link">
                <span>✏️</span> Register
              </Link>
              <Link to="/reviews" className="sidebar-link">
                <span>⭐</span> Reviews
              </Link>
              <Link to="/tutorials" className="sidebar-link">
                <span>📚</span> Tutorials
              </Link>
            </>
          )}
        </nav>

        {/* User Info Section */}
        {user && (
          <div className="sidebar-user">
            <div className="user-info">
              {user.avatar && (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="user-avatar"
                />
              )}
              <div className="user-details">
                <Link to={`/profile/${user._id}`} className="user-name-link">
                  {user.username}
                </Link>
                {user.role === 'admin' && (
                  <div className="user-role">Admin</div>
                )}
              </div>
            </div>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export default Sidebar;

