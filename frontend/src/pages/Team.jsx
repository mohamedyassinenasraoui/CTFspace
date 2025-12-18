import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/api.js';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';
import './Team.css';

function Team() {
  const { user, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.teamId) {
      fetchTeam();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/teams/${user.teamId}`);
      setTeam(response.data.team);
    } catch (error) {
      console.error('Failed to fetch team:', error);
      setError('Failed to load team information');
    } finally {
      setLoading(false);
    }
  };

  const leaveTeam = async () => {
    if (!confirm('Are you sure you want to leave this team? You will need to join or create a new team to participate.')) return;

    try {
      await apiClient.post(`/api/teams/${team._id}/leave`);
      setTeam(null);
      setSuccess('Left team successfully');
      await fetchUser();
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to leave team');
    }
  };

  const copyJoinCode = () => {
    if (team?.joinCode) {
      navigator.clipboard.writeText(team.joinCode);
      setSuccess('Join code copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  if (loading) {
    return <div className="loading">Loading team...</div>;
  }

  if (!team) {
    return (
      <div>
        <h1>My Team</h1>
        <div className="container">
          <div className="no-team-message">
            <h2>You're not in a team yet</h2>
            <p>Join or create a team to start competing with others!</p>
            <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="team-page">
      <h1>My Team</h1>
      
      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Team Header */}
      <div className="container team-header-section">
        <div className="team-header-content">
          <div className="team-title-section">
            <h2 className="team-name-large">{team.name}</h2>
            <p className="team-created">
              Created {new Date(team.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="team-actions">
            {team.joinCode && (
              <button onClick={copyJoinCode} className="btn btn-secondary">
                📋 Copy Join Code
              </button>
            )}
            <button onClick={leaveTeam} className="btn btn-danger">
              Leave Team
            </button>
          </div>
        </div>

        {/* Team Stats */}
        <div className="team-stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <div className="stat-value-large">{team.score || 0}</div>
              <div className="stat-label-large">Total Score</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value-large">{team.members?.length || 0}/5</div>
              <div className="stat-label-large">Members</div>
            </div>
          </div>
          {team.joinCode && (
            <div className="stat-card">
              <div className="stat-icon">🔑</div>
              <div className="stat-content">
                <div className="stat-value-large code-display">{team.joinCode}</div>
                <div className="stat-label-large">Join Code</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Team Members Section */}
      <div className="container">
        <h3 className="section-title">Team Members</h3>
        {team.members && team.members.length > 0 ? (
          <div className="members-grid">
            {team.members.map((member) => {
              const isCurrentUser = member._id?.toString() === user._id?.toString() || member._id === user._id;
              return (
                <div key={member._id} className={`member-card ${isCurrentUser ? 'current-user' : ''}`}>
                  <div className="member-card-header">
                    {member.avatar ? (
                      <img 
                        src={member.avatar} 
                        alt={member.username}
                        className="member-avatar-large"
                      />
                    ) : (
                      <div className="member-avatar-large placeholder">
                        {member.username?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                    {isCurrentUser && (
                      <span className="you-badge">You</span>
                    )}
                  </div>
                  <div className="member-card-body">
                    <h4 className="member-name-large">{member.username}</h4>
                    {member.email && (
                      <p className="member-email-large">{member.email}</p>
                    )}
                    <div className="member-meta">
                      <span className="member-role">
                        {member.role === 'admin' ? '👑 Admin' : '👤 Member'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p>No team members found.</p>
          </div>
        )}
      </div>

      {/* Team Info */}
      <div className="container">
        <h3 className="section-title">Team Information</h3>
        <div className="team-info-card">
          <div className="info-row">
            <span className="info-label">Team Name:</span>
            <span className="info-value">{team.name}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Team Score:</span>
            <span className="info-value">{team.score || 0} points</span>
          </div>
          <div className="info-row">
            <span className="info-label">Members:</span>
            <span className="info-value">{team.members?.length || 0} of 5</span>
          </div>
          {team.joinCode && (
            <div className="info-row">
              <span className="info-label">Join Code:</span>
              <span className="info-value code-value-large">{team.joinCode}</span>
            </div>
          )}
          <div className="info-row">
            <span className="info-label">Created:</span>
            <span className="info-value">{new Date(team.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Team;

