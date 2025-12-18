import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../utils/api.js';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/Gemini_Generated_Image_uhu42xuhu42xuhu4-removebg-preview.png';
import '../App.css';
import './Landing.css';

function NewsPreview() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await apiClient.get('/api/news', {
        params: { limit: 3, category: 'vulnerability' }
      });
      setNews(response.data.articles || []);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || news.length === 0) return null;

  return (
    <section className="news-preview-section">
      <div className="container">
        <div className="section-header">
          <h2>Latest Security Alerts</h2>
          <Link to="/news" className="view-all-link">View All News →</Link>
        </div>
        <div className="news-preview-grid">
          {news.map(article => (
            <a
              key={article._id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="news-preview-card"
            >
              <div className="news-preview-meta">
                <span className="news-preview-source">{article.sourceName}</span>
                {article.severity && (
                  <span className={`news-preview-severity severity-${article.severity}`}>
                    {article.severity}
                  </span>
                )}
              </div>
              <h3 className="news-preview-title">{article.title}</h3>
              {article.cveIds && article.cveIds.length > 0 && (
                <div className="news-preview-cves">
                  {article.cveIds[0]}
                </div>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Landing() {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchBlogs();
  }, [selectedCategory]);

  useEffect(() => {
    fetchReviews();
  }, []); // Only fetch reviews once on mount

  const fetchBlogs = async () => {
    try {
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const response = await apiClient.get('/api/blogs', { params });
      setBlogs(response.data.blogs || []);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await apiClient.get('/api/reviews', { params: { limit: 6 } });
      setReviews(response.data.reviews || []);
      setAverageRating(response.data.averageRating || 0);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const categories = [
    { value: 'all', label: 'All Posts' },
    { value: 'threats', label: 'Threats' },
    { value: 'news', label: 'News' },
    { value: 'tutorials', label: 'Tutorials' },
    { value: 'analysis', label: 'Analysis' }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-logo">
            <img src={logo} alt="CTF Platform Logo" />
          </div>
          <h1 className="hero-title">
            <span className="hero-text-blue">Stay Secure in a</span>{' '}
            <span className="hero-text-bright-blue">Digital</span>{' '}
            <span className="hero-text-purple">World</span>
          </h1>
          <p className="hero-subtitle">
            Your trusted source for cybersecurity insights, threat intelligence, and expert analysis
          </p>
          <div className="hero-buttons">
            {!user ? (
              <>
                <Link to="/register" className="btn btn-primary btn-large">
                  Get Started
                </Link>
                <Link to="/tutorials" className="btn btn-secondary btn-large">
                  Learn More
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="btn btn-primary btn-large">
                  Go to Dashboard
                </Link>
                <Link to="/challenges" className="btn btn-secondary btn-large">
                  View Challenges
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-particles"></div>
      </section>

      {/* Blog Section */}
      <section className="blog-section">
        <div className="container">
          <div className="section-header">
            <h2>Latest Cybersecurity Insights</h2>
            <p>Stay informed about the latest threats, vulnerabilities, and security news</p>
          </div>

          {/* Category Filter */}
          <div className="category-filter">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`filter-btn ${selectedCategory === cat.value ? 'active' : ''}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Blog Grid */}
          {loading ? (
            <div className="loading">Loading blogs...</div>
          ) : blogs.length === 0 ? (
            <div className="empty-state">
              <p>No blog posts available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="blog-grid">
              {blogs.map(blog => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* News Preview Section */}
      <NewsPreview />

      {/* Reviews Section */}
      <section className="reviews-section">
        <div className="container">
          <div className="section-header">
            <h2>What Our Community Says</h2>
            <div className="rating-summary">
              <div className="average-rating">
                <span className="rating-number">{averageRating.toFixed(1)}</span>
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.round(averageRating) ? 'star filled' : 'star'}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="rating-count">Based on {reviews.length} reviews</span>
              </div>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="empty-state">
              <p>No reviews yet. Be the first to leave a review!</p>
            </div>
          ) : (
            <div className="reviews-grid">
              {reviews.map(review => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>
          )}

          {user && (
            <div className="review-cta">
              <Link to="/reviews" className="btn btn-primary">
                Write a Review
              </Link>
            </div>
          )}
          {!user && (
            <div className="review-cta">
              <Link to="/login" className="btn btn-primary">
                Login to Write a Review
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function BlogCard({ blog }) {
  return (
    <Link to={`/blog/${blog.slug}`} className="blog-card">
      {blog.featuredImage && (
        <div className="blog-image">
          <img src={blog.featuredImage} alt={blog.title} />
        </div>
      )}
      <div className="blog-content">
        <div className="blog-meta">
          <span className="blog-category">{blog.category}</span>
          <span className="blog-date">
            {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}
          </span>
        </div>
        <h3 className="blog-title">{blog.title}</h3>
        {blog.excerpt && <p className="blog-excerpt">{blog.excerpt}</p>}
        <div className="blog-footer">
          <div className="blog-author">
            {blog.author?.avatar && (
              <img src={blog.author.avatar} alt={blog.author.username} className="author-avatar" />
            )}
            <span>{blog.author?.username || 'Admin'}</span>
          </div>
          <span className="blog-views">👁 {blog.views || 0}</span>
        </div>
      </div>
    </Link>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="review-card">
      <div className="review-header">
        <div className="reviewer-info">
          {review.userId?.avatar && (
            <img src={review.userId.avatar} alt={review.userId.username} className="reviewer-avatar" />
          )}
          <div>
            <div className="reviewer-name">{review.userId?.username || 'Anonymous'}</div>
            <div className="review-date">
              {new Date(review.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="review-rating">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < review.rating ? 'star filled' : 'star'}>★</span>
          ))}
        </div>
      </div>
      <h4 className="review-title">{review.title}</h4>
      <p className="review-content">{review.content}</p>
      {review.verified && (
        <span className="verified-badge">✓ Verified</span>
      )}
    </div>
  );
}

export default Landing;

