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
      const response = await apiClient.get(`/api/teams/${user.teamId}`);
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

        {/* Team Info Section */}
        {user && team && (
          <Link to="/team" className="sidebar-team-link">
            <div className="sidebar-team">
              <div className="team-header">
                <h4>👥 Your Team</h4>
                <span className="view-team-arrow">→</span>
              </div>
            <div className="team-info">
              <div className="team-name">{team.name}</div>
              <div className="team-stats">
                <div className="team-stat">
                  <span className="stat-label">Score:</span>
                  <span className="stat-value">{team.score || 0}</span>
                </div>
                <div className="team-stat">
                  <span className="stat-label">Members:</span>
                  <span className="stat-value">{team.members?.length || 0}/5</span>
                </div>
              </div>
              
              {/* Team Members List */}
              {team.members && team.members.length > 0 && (
                <div className="team-members-list">
                  <div className="members-label">Team Members:</div>
                  <div className="members-container">
                    {team.members.map((member) => (
                      <div key={member._id} className="team-member-item">
                        {member.avatar ? (
                          <img 
                            src={member.avatar} 
                            alt={member.username}
                            className="member-avatar"
                          />
                        ) : (
                          <div className="member-avatar-placeholder">
                            {member.username?.charAt(0).toUpperCase() || '?'}
                          </div>
                        )}
                        <div className="member-info">
                          <div className="member-name">
                            {member.username}
                            {(member._id?.toString() === user._id?.toString() || member._id === user._id) && (
                              <span className="member-you"> (You)</span>
                            )}
                          </div>
                          {member.email && (
                            <div className="member-email">{member.email}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {team.joinCode && (
                <div className="team-code">
                  <span className="code-label">Join Code:</span>
                  <div className="code-value" onClick={() => {
                    navigator.clipboard.writeText(team.joinCode);
                    alert('Code copied to clipboard!');
                  }}>
                    {team.joinCode}
                    <span className="copy-icon">📋</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          </Link>
        )}

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
                <div className="user-name">{user.username}</div>
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

