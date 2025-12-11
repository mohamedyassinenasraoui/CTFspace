import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/api.js';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

function Challenges() {
  const { accessToken } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await apiClient.get('/api/challenges');
      setChallenges(response.data.challenges);
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChallenges = filter === 'all'
    ? challenges
    : challenges.filter(c => c.category === filter);

  const categories = ['all', ...new Set(challenges.map(c => c.category))];

  if (loading) {
    return <div className="loading">Loading challenges...</div>;
  }

  return (
    <div>
      <h1>Challenges</h1>

      <div className="container">
        <div className="form-group">
          <label>Filter by Category</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredChallenges.length === 0 ? (
        <div className="container">
          <p>No challenges available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid">
          {filteredChallenges.map((challenge) => (
            <div key={challenge._id} className="card" onClick={() => navigate(`/challenges/${challenge._id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <h3>{challenge.title}</h3>
                <span className={`badge badge-${challenge.difficulty}`}>
                  {challenge.difficulty}
                </span>
              </div>
              <p style={{ color: '#b0b0b0', marginBottom: '1rem' }}>
                {challenge.description.substring(0, 150)}...
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#4a9eff', fontWeight: 'bold' }}>
                  {challenge.points} points
                </span>
                <span style={{ color: '#888' }}>
                  {challenge.category}
                </span>
              </div>
              {challenge.solvedCount > 0 && (
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#888' }}>
                  Solved by {challenge.solvedCount} team(s)
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Challenges;

