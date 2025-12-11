import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { apiClient, API_URL } from '../utils/api.js';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';
import './HiddenFlags.css';

function HiddenFlags() {
  const { flagId } = useParams();
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  const [allFlags, setAllFlags] = useState([]);
  const [discovered, setDiscovered] = useState([]);
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDiscovered();
    }
    fetchAllFlags();
  }, [user]);

  useEffect(() => {
    if (flagId && allFlags.length > 0) {
      const flag = allFlags.find(f => f._id === flagId || f.flagId === flagId);
      if (flag) {
        setSelectedFlag(flag);
      }
    } else if (!flagId) {
      setSelectedFlag(null);
    }
  }, [flagId, allFlags]);

  const fetchAllFlags = async () => {
    try {
      // Fetch challenges with challengeType='hidden'
      const response = await apiClient.get('/api/challenges', { params: { challengeType: 'hidden' } });
      setAllFlags(response.data.challenges || []);
    } catch (error) {
      console.error('Failed to fetch flags:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscovered = async () => {
    if (!accessToken) return;
    
    try {
      // Fetch solved challenges
      const response = await apiClient.get('/api/challenges/solved/mine');
      setDiscovered(response.data.challenges || []);
    } catch (error) {
      console.error('Failed to fetch discovered:', error);
    }
  };

  const handleCardClick = (flag) => {
    navigate(`/hidden-flags/${flag._id}`);
  };

  const handleCloseDetail = () => {
    navigate('/hidden-flags');
  };

  if (loading) {
    return <div className="loading">Loading challenges...</div>;
  }

  // Show detail view if flagId is in URL
  if (selectedFlag) {
    return (
      <FlagDetailView
        flag={selectedFlag}
        isDiscovered={discovered.some(f => f._id === selectedFlag._id)}
        user={user}
        accessToken={accessToken}
        onDiscover={fetchDiscovered}
        onClose={handleCloseDetail}
      />
    );
  }

  // Show grid view
  return (
    <div className="hidden-flags-page">
      <div className="container">
        <div className="page-header">
          <h1>🔍 Hidden Flags Challenge</h1>
          <p>Discover hidden flags throughout the platform using your browser's developer tools!</p>
        </div>

        <div className="challenges-grid">
          {allFlags.map(flag => (
            <FlagCard
              key={flag._id}
              flag={flag}
              isDiscovered={discovered.some(f => f._id === flag._id)}
              onClick={() => handleCardClick(flag)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FlagCard({ flag, isDiscovered, onClick }) {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#28a745';
      case 'medium': return '#ffc107';
      case 'hard': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getCategoryDisplay = (category) => {
    const categoryMap = {
      'beginner': 'General Skills',
      'intermediate': 'Web Exploitation',
      'advanced': 'Forensics',
      'expert': 'Binary Exploitation'
    };
    return categoryMap[category] || category;
  };

  const likePercentage = flag.solvedCount > 0 
    ? Math.round((flag.likes / flag.solvedCount) * 100) 
    : 0;

  return (
    <div 
      className={`flag-card ${isDiscovered ? 'solved' : ''}`}
      onClick={onClick}
    >
      <div className="card-header">
        <span className="card-category">{getCategoryDisplay(flag.category)}</span>
        <div className="card-difficulty">
          <span className="user-icon">👤</span>
          <span 
            className="difficulty-badge"
            style={{ backgroundColor: getDifficultyColor(flag.difficulty) }}
          >
            {flag.difficulty}
          </span>
        </div>
      </div>
      
      <h3 className="card-title">{flag.title}</h3>
      
      <div className="card-footer">
        <span className="solves-count">{flag.solvedCount || 0} solves</span>
        <span className="like-percentage">{likePercentage}% 👍</span>
      </div>
    </div>
  );
}

function FlagDetailView({ flag, isDiscovered, user, accessToken, onDiscover, onClose }) {
  const [flagInput, setFlagInput] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [activeHint, setActiveHint] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(flag.likes || 0);

  useEffect(() => {
    if (user && flag.likedBy) {
      setLiked(flag.likedBy.some(id => id === user._id || (typeof id === 'object' && id._id === user._id)));
    }
  }, [user, flag]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setMessage({ type: 'error', text: 'Please login to submit flags' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await apiClient.post(
        `/api/challenges/${flag._id}/submit`,
        { flag: flagInput }
      );

      if (response.data.correct) {
        setMessage({
          type: 'success',
          text: response.data.message
        });
        setFlagInput('');
        onDiscover();
      } else {
        setMessage({
          type: 'error',
          text: response.data.message || 'Incorrect flag'
        });
        setFlagInput('');
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

  const handleLike = async () => {
    if (!user) return;

    try {
      const response = await apiClient.post(
        `/api/challenges/${flag._id}/like`,
        {}
      );
      setLiked(response.data.liked);
      setLikes(response.data.likes);
    } catch (error) {
      console.error('Failed to like:', error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#28a745';
      case 'medium': return '#ffc107';
      case 'hard': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'beginner': return '#28a745';
      case 'intermediate': return '#ffc107';
      case 'advanced': return '#fd7e14';
      case 'expert': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div className="flag-detail-overlay" onClick={onClose}>
      <div className="flag-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="challenge-header">
          <div className="challenge-title-section">
            <h2 className="challenge-title">
              <span className="bookmark-icon">🔖</span>
              {flag.title}
            </h2>
            <div className="challenge-tags">
              <span
                className="tag difficulty-tag"
                style={{ backgroundColor: getDifficultyColor(flag.difficulty) }}
              >
                {flag.difficulty}
              </span>
              <span
                className="tag category-tag"
                style={{ backgroundColor: getCategoryColor(flag.category) }}
              >
                {flag.category}
              </span>
              {flag.tags && flag.tags.map((tag, idx) => (
                <span key={idx} className="tag">{tag}</span>
              ))}
            </div>
          </div>
          <div className="challenge-actions">
            {user && (
              <button
                onClick={handleLike}
                className={`like-btn ${liked ? 'liked' : ''}`}
                title={liked ? 'Unlike' : 'Like'}
              >
                {liked ? '👍' : '👎'} {likes}
              </button>
            )}
            {isDiscovered && (
              <span className="solved-badge">✓ Solved</span>
            )}
            <button onClick={onClose} className="close-btn">✕</button>
          </div>
        </div>

        <div className="challenge-author">
          AUTHOR: {flag.author}
        </div>

        <div className="challenge-content">
          <div className="challenge-description">
            <h3>Description</h3>
            <p>{flag.description}</p>
          </div>

          <div className="challenge-hints-section">
            <div className="hints-header">
              <h3>
                <span className="hint-icon">❓</span>
                Hints
              </h3>
              <button
                onClick={() => setShowHints(!showHints)}
                className="toggle-hints-btn"
              >
                {showHints ? 'Hide' : 'Show'} Hints
              </button>
            </div>

            {showHints && (
              <div className="hints-container">
                {flag.hints && flag.hints.map((hint, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveHint(activeHint === index ? null : index)}
                    className={`hint-btn ${activeHint === index ? 'active' : ''}`}
                  >
                    {index + 1}
                  </button>
                ))}
                {activeHint !== null && flag.hints && (
                  <div className="hint-content">
                    {flag.hints[activeHint]}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="challenge-stats">
            <span className="solved-count">
              {flag.solvedCount || 0} users solved
            </span>
            <span className="like-percentage">
              <span className="thumbs-down">👎</span>
              {flag.solvedCount > 0 ? Math.round((likes / flag.solvedCount) * 100) : 0}% Liked
              <span className="thumbs-up">👍</span>
            </span>
          </div>

          <form onSubmit={handleSubmit} className="flag-submit-form">
            {message.text && (
              <div className={`alert alert-${message.type}`}>
                {message.text}
              </div>
            )}
            <div className="flag-input-container">
              <span className="flag-icon">🏴</span>
              <input
                type="text"
                value={flagInput}
                onChange={(e) => setFlagInput(e.target.value)}
                placeholder="FLAG{...}"
                required
                disabled={submitting || isDiscovered}
                className="flag-input"
              />
              <button
                type="submit"
                className="submit-flag-btn"
                disabled={!user || submitting || isDiscovered}
              >
                {isDiscovered ? 'Already Solved' : submitting ? 'Submitting...' : 'Submit Flag'}
              </button>
            </div>
            {!user && (
              <p className="login-prompt">
                <Link to="/login">Login</Link> to submit flags
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default HiddenFlags;
