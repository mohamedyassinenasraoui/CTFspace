import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/api.js';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

function Dashboard() {
  const { user, fetchUser } = useAuth();
  const [team, setTeam] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'join'
  const navigate = useNavigate();

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
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await apiClient.post('/api/teams', { name: teamName });
      setTeam(response.data.team);
      setTeamName('');
      setSuccess('Team created successfully!');
      await fetchUser();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create team');
    }
  };

  const joinTeamByCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await apiClient.post('/api/teams/join/code', { code: joinCode });
      setTeam(response.data.team);
      setJoinCode('');
      setSuccess('Joined team successfully!');
      await fetchUser();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to join team');
    }
  };

  const leaveTeam = async () => {
    if (!confirm('Are you sure you want to leave this team?')) return;

    try {
      await apiClient.post(`/api/teams/${team._id}/leave`);
      setTeam(null);
      setSuccess('Left team successfully');
      await fetchUser();
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
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      
      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="container">
        <h2>Welcome, {user?.username}!</h2>
        
        {team ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Your Team: {team.name}</h3>
              <button onClick={leaveTeam} className="btn btn-danger">
                Leave Team
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(74, 158, 255, 0.1)', borderRadius: '12px', border: '1px solid rgba(74, 158, 255, 0.2)' }}>
                <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Score</div>
                <div style={{ color: '#4a9eff', fontSize: '1.5rem', fontWeight: 'bold' }}>{team.score || 0}</div>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(74, 158, 255, 0.1)', borderRadius: '12px', border: '1px solid rgba(74, 158, 255, 0.2)' }}>
                <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Members</div>
                <div style={{ color: '#4a9eff', fontSize: '1.5rem', fontWeight: 'bold' }}>{team.members?.length || 0}/5</div>
              </div>
            </div>

            {team.joinCode && (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(15, 20, 34, 0.6)', borderRadius: '12px', border: '1px solid rgba(74, 158, 255, 0.3)' }}>
                <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Join Code</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    fontFamily: 'Courier New, monospace', 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    color: '#4a9eff',
                    letterSpacing: '2px'
                  }}>
                    {team.joinCode}
                  </div>
                  <button onClick={copyJoinCode} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                    📋 Copy
                  </button>
                </div>
                <div style={{ color: '#888', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  Share this code with others to let them join your team
                </div>
              </div>
            )}
            
            {team.members && team.members.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>Team Members</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                  {team.members.map((member) => (
                    <div 
                      key={member._id} 
                      style={{ 
                        padding: '1rem', 
                        background: 'rgba(26, 31, 58, 0.6)', 
                        borderRadius: '12px',
                        border: '1px solid rgba(74, 158, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}
                    >
                      {member.avatar && (
                        <img 
                          src={member.avatar} 
                          alt={member.username}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            border: '2px solid #4a9eff'
                          }}
                        />
                      )}
                      <div>
                        <div style={{ color: '#ffffff', fontWeight: '600' }}>{member.username}</div>
                        <div style={{ color: '#888', fontSize: '0.85rem' }}>{member.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3>Create or Join a Team</h3>
            <p>You need to be in a team to submit flags and compete.</p>
            
            {/* Tab Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
              <button
                onClick={() => setActiveTab('create')}
                className={`btn ${activeTab === 'create' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
              >
                Create Team
              </button>
              <button
                onClick={() => setActiveTab('join')}
                className={`btn ${activeTab === 'join' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
              >
                Join by Code
              </button>
            </div>

            {/* Create Team Form */}
            {activeTab === 'create' && (
              <form onSubmit={createTeam}>
                <div className="form-group">
                  <label>Team Name</label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter team name"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Create Team
                </button>
              </form>
            )}

            {/* Join by Code Form */}
            {activeTab === 'join' && (
              <form onSubmit={joinTeamByCode}>
                <div className="form-group">
                  <label>Join Code</label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-character join code"
                    maxLength={6}
                    style={{ 
                      textTransform: 'uppercase',
                      fontFamily: 'Courier New, monospace',
                      letterSpacing: '2px',
                      fontSize: '1.2rem',
                      textAlign: 'center'
                    }}
                    required
                  />
                  <small style={{ color: '#888', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>
                    Ask your team leader for the join code
                  </small>
                </div>
                <button type="submit" className="btn btn-primary">
                  Join Team
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      <div className="container">
        <h2>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/challenges')}
            className="btn btn-primary"
          >
            View Challenges
          </button>
          <button
            onClick={() => navigate('/leaderboard')}
            className="btn btn-secondary"
          >
            View Leaderboard
          </button>
          <button
            onClick={() => navigate('/tutorials')}
            className="btn btn-secondary"
          >
            Learn & Practice
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

