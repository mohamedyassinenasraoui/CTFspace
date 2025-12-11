import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, API_URL } from '../utils/api.js';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';
import './Reviews.css';

function Reviews() {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    content: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await apiClient.get('/api/reviews');
      setReviews(response.data.reviews || []);
      setAverageRating(response.data.averageRating || 0);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await apiClient.post(
        '/api/reviews',
        formData
      );

      setFormData({ rating: 5, title: '', content: '' });
      setShowForm(false);
      fetchReviews();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await apiClient.post(
        `/api/reviews/${reviewId}/helpful`,
        {}
      );
      fetchReviews();
    } catch (error) {
      console.error('Failed to mark helpful:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading reviews...</div>;
  }

  return (
    <div className="reviews-page">
      <div className="container">
        <h1>Community Reviews</h1>

        <div className="rating-overview">
          <div className="average-rating-display">
            <div className="rating-number-large">{averageRating.toFixed(1)}</div>
            <div className="stars-large">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < Math.round(averageRating) ? 'star filled' : 'star'}>
                  ★
                </span>
              ))}
            </div>
            <p className="rating-description">Based on {reviews.length} reviews</p>
          </div>
        </div>

        {user && !showForm && (
          <div className="review-cta-section">
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              Write a Review
            </button>
          </div>
        )}

        {showForm && (
          <div className="review-form-container">
            <h2>Write Your Review</h2>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Rating</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating })}
                      className={`star-btn ${formData.rating >= rating ? 'active' : ''}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Give your review a title"
                />
              </div>
              <div className="form-group">
                <label>Your Review</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows="6"
                  placeholder="Share your experience with the platform..."
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setError('');
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="reviews-list">
          {reviews.length === 0 ? (
            <div className="empty-state">
              <p>No reviews yet. Be the first to leave a review!</p>
            </div>
          ) : (
            reviews.map(review => (
              <ReviewCard
                key={review._id}
                review={review}
                onHelpful={handleHelpful}
                user={user}
                accessToken={accessToken}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review, onHelpful, user, accessToken }) {
  const [isHelpful, setIsHelpful] = useState(
    user && review.helpful?.some(id => id === user._id)
  );

  const handleHelpful = () => {
    if (user) {
      setIsHelpful(!isHelpful);
      onHelpful(review._id);
    }
  };

  return (
    <div className="review-card-detailed">
      <div className="review-header-detailed">
        <div className="reviewer-info-detailed">
          {review.userId?.avatar && (
            <img src={review.userId.avatar} alt={review.userId.username} className="reviewer-avatar-large" />
          )}
          <div>
            <div className="reviewer-name-detailed">{review.userId?.username || 'Anonymous'}</div>
            <div className="review-date-detailed">
              {new Date(review.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="review-rating-detailed">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < review.rating ? 'star filled' : 'star'}>★</span>
          ))}
          {review.verified && (
            <span className="verified-badge">✓ Verified</span>
          )}
        </div>
      </div>
      <h3 className="review-title-detailed">{review.title}</h3>
      <p className="review-content-detailed">{review.content}</p>
      <div className="review-actions-detailed">
        <button
          onClick={handleHelpful}
          className={`helpful-btn ${isHelpful ? 'active' : ''}`}
          disabled={!user}
        >
          👍 Helpful ({review.helpful?.length || 0})
        </button>
      </div>
    </div>
  );
}

export default Reviews;

