import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/api.js';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

function Dashboard() {
  const { user, accessToken, fetchUser } = useAuth();
  const [team, setTeam] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

  const leaveTeam = async () => {
    if (!confirm('Are you sure you want to leave this team?')) return;

    try {
      await apiClient.post(`/api/teams/${team._id}/leave`, {});
      setTeam(null);
      setSuccess('Left team successfully');
      await fetchUser();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to leave team');
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
            <h3>Your Team: {team.name}</h3>
            <p><strong>Score:</strong> {team.score} points</p>
            <p><strong>Members:</strong> {team.members?.length || 0}/5</p>
            
            {team.members && team.members.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h4>Team Members:</h4>
                <ul>
                  {team.members.map((member) => (
                    <li key={member._id}>{member.username}</li>
                  ))}
                </ul>
              </div>
            )}

            <button onClick={leaveTeam} className="btn btn-danger" style={{ marginTop: '1rem' }}>
              Leave Team
            </button>
          </div>
        ) : (
          <div>
            <h3>Create or Join a Team</h3>
            <p>You need to be in a team to submit flags and compete.</p>
            <form onSubmit={createTeam} style={{ marginTop: '1rem' }}>
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

