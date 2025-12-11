import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiClient, API_URL } from '../utils/api.js';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';
import './BlogDetail.css';

function BlogDetail() {
  const { slug } = useParams();
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    try {
      const response = await apiClient.get(`/api/blogs/${slug}`);
      setBlog(response.data.blog);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Failed to fetch blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await apiClient.post(
        '/api/comments',
        {
          blogId: blog._id,
          content: newComment,
          parentId: replyTo
        }
      );

      setComments([response.data.comment, ...comments]);
      setNewComment('');
      setReplyTo(null);
    } catch (error) {
      console.error('Failed to submit comment:', error);
      alert(error.response?.data?.error || 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await apiClient.post(
        `/api/comments/${commentId}/like`,
        {}
      );

      setComments(comments.map(comment =>
        comment._id === commentId
          ? { 
              ...comment, 
              likes: response.data.liked 
                ? [...(comment.likes || []), user._id] 
                : (comment.likes || []).filter(id => id !== user._id),
              likesCount: response.data.likesCount || comment.likes?.length || 0
            }
          : comment
      ));
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading blog post...</div>;
  }

  if (!blog) {
    return (
      <div className="container">
        <h2>Blog post not found</h2>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="blog-detail-page">
      <div className="container">
        <Link to="/" className="back-link">← Back to Blog</Link>

        <article className="blog-article">
          {blog.featuredImage && (
            <div className="article-image">
              <img src={blog.featuredImage} alt={blog.title} />
            </div>
          )}

          <div className="article-header">
            <div className="article-meta">
              <span className="article-category">{blog.category}</span>
              <span className="article-date">
                {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="article-title">{blog.title}</h1>
            <div className="article-author">
              {blog.author?.avatar && (
                <img src={blog.author.avatar} alt={blog.author.username} className="author-avatar" />
              )}
              <div>
                <div className="author-name">{blog.author?.username || 'Admin'}</div>
                <div className="article-views">👁 {blog.views || 0} views</div>
              </div>
            </div>
          </div>

          <div className="article-content" dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br />') }} />
        </article>

        {/* Comments Section */}
        <section className="comments-section">
          <h2>Comments ({comments.length})</h2>

          {user ? (
            <form onSubmit={handleSubmitComment} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyTo ? "Write a reply..." : "Leave a comment..."}
                required
                rows="4"
              />
              {replyTo && (
                <div className="reply-indicator">
                  Replying to comment
                  <button type="button" onClick={() => setReplyTo(null)}>Cancel</button>
                </div>
              )}
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Post Comment'}
              </button>
            </form>
          ) : (
            <div className="login-prompt">
              <p>Please <Link to="/login">login</Link> to leave a comment</p>
            </div>
          )}

          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map(comment => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  onReply={setReplyTo}
                  onLike={handleLikeComment}
                  user={user}
                  accessToken={accessToken}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function CommentItem({ comment, onReply, onLike, user, accessToken }) {
  const [isLiked, setIsLiked] = useState(
    user && comment.likes?.some(id => id === user._id)
  );

  const handleLike = () => {
    if (user) {
      setIsLiked(!isLiked);
      onLike(comment._id);
    }
  };

  return (
    <div className="comment-item">
      <div className="comment-header">
        <div className="commenter-info">
          {comment.userId?.avatar && (
            <img src={comment.userId.avatar} alt={comment.userId.username} className="commenter-avatar" />
          )}
          <div>
            <div className="commenter-name">{comment.userId?.username || 'Anonymous'}</div>
            <div className="comment-date">
              {new Date(comment.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
      <div className="comment-content">{comment.content}</div>
      <div className="comment-actions">
        <button
          onClick={handleLike}
          className={`like-btn ${isLiked ? 'liked' : ''}`}
          disabled={!user}
        >
          ❤️ {comment.likes?.length || 0}
        </button>
        {user && (
          <button onClick={() => onReply(comment._id)} className="reply-btn">
            Reply
          </button>
        )}
      </div>
    </div>
  );
}

export default BlogDetail;

