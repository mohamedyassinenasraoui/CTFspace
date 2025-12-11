import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { apiClient, API_URL } from '../utils/api.js';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

function Leaderboard() {
  const { accessToken } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();

    // Set up Socket.IO connection for real-time updates
    const socket = io(API_URL, {
      transports: ['websocket'],
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('Connected to leaderboard');
      socket.emit('join:leaderboard');
    });

    socket.on('leaderboard:init', (data) => {
      setTeams(data.teams || []);
      setLoading(false);
    });

    socket.on('leaderboard:update', (data) => {
      setTeams(data.teams || []);
    });

    return () => {
      socket.emit('leave:leaderboard');
      socket.disconnect();
    };
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await apiClient.get('/api/teams');
      const sorted = response.data.teams.sort((a, b) => b.score - a.score);
      setTeams(sorted);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading leaderboard...</div>;
  }

  return (
    <div>
      <h1>Leaderboard</h1>
      <div className="container">
        {teams.length === 0 ? (
          <p>No teams yet. Be the first to create a team!</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team Name</th>
                <th>Score</th>
                <th>Members</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, index) => (
                <tr key={team._id}>
                  <td>
                    <strong>
                      {index === 0 && '🥇 '}
                      {index === 1 && '🥈 '}
                      {index === 2 && '🥉 '}
                      {index + 1}
                    </strong>
                  </td>
                  <td>{team.name}</td>
                  <td>
                    <strong style={{ color: '#4a9eff' }}>{team.score}</strong>
                  </td>
                  <td>{team.members?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;

