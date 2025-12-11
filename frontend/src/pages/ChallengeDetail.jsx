import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/api.js';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

function ChallengeDetail() {
  const { id } = useParams();
  const { accessToken, user } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [flag, setFlag] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchChallenge();
    fetchSubmissions();
  }, [id]);

  const fetchChallenge = async () => {
    try {
      const response = await apiClient.get(`/api/challenges/${id}`);
      setChallenge(response.data.challenge);
    } catch (error) {
      console.error('Failed to fetch challenge:', error);
      setMessage({ type: 'error', text: 'Failed to load challenge' });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await apiClient.get(`/api/challenges/${id}/submissions`);
      setSubmissions(response.data.submissions);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    if (!user?.teamId) {
      setMessage({ type: 'error', text: 'You must be in a team to submit flags' });
      setSubmitting(false);
      return;
    }

    try {
      const response = await apiClient.post(
        `/api/challenges/${id}/submit`,
        { flag }
      );

      if (response.data.correct) {
        setMessage({
          type: 'success',
          text: `Correct! You earned ${response.data.pointsAwarded} points!`
        });
        setFlag('');
        fetchSubmissions();
        setTimeout(() => navigate('/challenges'), 2000);
      } else {
        setMessage({ type: 'error', text: 'Incorrect flag. Try again!' });
        setFlag('');
        fetchSubmissions();
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to submit flag'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const hasSolved = submissions.some(s => s.correct);

  if (loading) {
    return <div className="loading">Loading challenge...</div>;
  }

  if (!challenge) {
    return <div className="container">Challenge not found</div>;
  }

  return (
    <div>
      <button onClick={() => navigate('/challenges')} className="btn btn-secondary" style={{ marginBottom: '1rem' }}>
        ← Back to Challenges
      </button>

      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
          <h1>{challenge.title}</h1>
          <div>
            <span className={`badge badge-${challenge.difficulty}`} style={{ marginRight: '0.5rem' }}>
              {challenge.difficulty}
            </span>
            <span style={{ color: '#4a9eff', fontWeight: 'bold', fontSize: '1.2rem' }}>
              {challenge.points} points
            </span>
          </div>
        </div>

        <p style={{ color: '#888', marginBottom: '1rem' }}>
          Category: {challenge.category}
        </p>

        {hasSolved && (
          <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
            ✓ You've already solved this challenge!
          </div>
        )}

        <div style={{ marginBottom: '2rem' }}>
          <h2>Description</h2>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
            {challenge.description}
          </div>
        </div>

        {challenge.files && challenge.files.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2>Files</h2>
            <ul>
              {challenge.files.map((file, idx) => (
                <li key={idx}>
                  <a href={file} target="_blank" rel="noopener noreferrer">
                    {file}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {message.text && (
          <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Submit Flag</label>
            <input
              type="text"
              value={flag}
              onChange={(e) => setFlag(e.target.value)}
              placeholder="Enter flag here"
              required
              disabled={submitting || hasSolved}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || hasSolved}
          >
            {submitting ? 'Submitting...' : 'Submit Flag'}
          </button>
        </form>
      </div>

      {submissions.length > 0 && (
        <div className="container">
          <h2>Your Submissions</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Points</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub, idx) => (
                <tr key={idx}>
                  <td>
                    {sub.correct ? (
                      <span style={{ color: '#28a745' }}>✓ Correct</span>
                    ) : (
                      <span style={{ color: '#dc3545' }}>✗ Incorrect</span>
                    )}
                  </td>
                  <td>{sub.pointsAwarded}</td>
                  <td>{new Date(sub.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ChallengeDetail;

