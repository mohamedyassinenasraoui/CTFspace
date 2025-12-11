import { useState, useEffect } from 'react';
import { apiClient } from '../utils/api.js';
import { useAuth } from '../contexts/AuthContext';
import './AdminPanel.css';

function AdminPanel() {
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  
  // Data states
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [news, setNews] = useState([]);

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'teams') fetchTeams();
    if (activeTab === 'challenges') fetchChallenges();
    if (activeTab === 'submissions') fetchSubmissions();
    if (activeTab === 'blogs') fetchBlogs();
    if (activeTab === 'news') fetchNews();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/api/admin/stats');
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/api/admin/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await apiClient.get('/api/admin/teams');
      setTeams(response.data.teams);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    }
  };

  const fetchChallenges = async () => {
    try {
      const response = await apiClient.get('/api/admin/challenges');
      setChallenges(response.data.challenges);
    } catch (error) {
      console.error('Failed to fetch challenges:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await apiClient.get('/api/admin/submissions');
      setSubmissions(response.data.submissions);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    }
  };

  const fetchBlogs = async () => {
    try {
      const response = await apiClient.get('/api/admin/blogs');
      setBlogs(response.data.blogs);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    }
  };

  const fetchNews = async () => {
    try {
      const response = await apiClient.get('/api/admin/news');
      setNews(response.data.articles);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      await apiClient.delete(`/api/admin/${type}/${id}`);
      
      // Refresh the current tab
      if (type === 'users') fetchUsers();
      else if (type === 'teams') fetchTeams();
      else if (type === 'challenges') fetchChallenges();
      else if (type === 'blogs') fetchBlogs();
      else if (type === 'news') fetchNews();
      
      alert(`${type} deleted successfully`);
    } catch (error) {
      alert(error.response?.data?.error || `Failed to delete ${type}`);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await apiClient.patch(
        `/api/admin/users/${userId}`,
        { role: newRole }
      );
      fetchUsers();
      alert('User role updated successfully');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update role');
    }
  };

  const handleToggleVisibility = async (challengeId, currentVisible) => {
    try {
      await apiClient.patch(
        `/api/admin/challenges/${challengeId}`,
        { visible: !currentVisible }
      );
      fetchChallenges();
    } catch (error) {
      alert('Failed to update challenge visibility');
    }
  };

  const handleFetchNews = async () => {
    try {
      await apiClient.post(
        '/api/admin/news/fetch',
        {}
      );
      alert('News fetch started in background');
      setTimeout(fetchNews, 5000); // Refresh after 5 seconds
    } catch (error) {
      alert('Failed to trigger news fetch');
    }
  };

  if (loading) {
    return <div className="loading">Loading admin panel...</div>;
  }

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'users', label: '👥 Users', icon: '👥' },
    { id: 'teams', label: '👨‍👩‍👧‍👦 Teams', icon: '👨‍👩‍👧‍👦' },
    { id: 'challenges', label: '🎯 Challenges', icon: '🎯' },
    { id: 'submissions', label: '📝 Submissions', icon: '📝' },
    { id: 'blogs', label: '📰 Blogs', icon: '📰' },
    { id: 'news', label: '📡 News', icon: '📡' }
  ];

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🔐 Admin Panel</h1>
        <p>Manage your CTF platform</p>
      </div>

      <div className="admin-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div className="dashboard">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>{stats.overview.totalUsers}</h3>
                  <p>Total Users</p>
                  <small>{stats.overview.adminUsers} admins</small>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👨‍👩‍👧‍👦</div>
                <div className="stat-info">
                  <h3>{stats.overview.totalTeams}</h3>
                  <p>Teams</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-info">
                  <h3>{stats.overview.totalChallenges}</h3>
                  <p>Challenges</p>
                  <small>{stats.overview.visibleChallenges} visible</small>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>{stats.overview.correctSubmissions}</h3>
                  <p>Correct Submissions</p>
                  <small>of {stats.overview.totalSubmissions} total</small>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📰</div>
                <div className="stat-info">
                  <h3>{stats.overview.totalBlogs}</h3>
                  <p>Blogs</p>
                  <small>{stats.overview.publishedBlogs} published</small>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📡</div>
                <div className="stat-info">
                  <h3>{stats.overview.totalNews}</h3>
                  <p>News Articles</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔍</div>
                <div className="stat-info">
                  <h3>{stats.overview.totalHiddenFlags}</h3>
                  <p>Hidden Flags</p>
                  <small>{stats.overview.totalDiscoveries} discovered</small>
                </div>
              </div>
            </div>

            <div className="dashboard-sections">
              <div className="dashboard-section">
                <h2>🏆 Top Teams</h2>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Team</th>
                      <th>Score</th>
                      <th>Members</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topTeams.map((team, idx) => (
                      <tr key={team._id}>
                        <td>#{idx + 1}</td>
                        <td>{team.name}</td>
                        <td>{team.score}</td>
                        <td>{team.members?.length || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="dashboard-section">
                <h2>🕐 Recent Activity</h2>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Challenge</th>
                      <th>Status</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentSubmissions.map(sub => (
                      <tr key={sub._id}>
                        <td>{sub.userId?.username || 'N/A'}</td>
                        <td>{sub.challengeId?.title || 'N/A'}</td>
                        <td>
                          {sub.correct ? (
                            <span className="status-success">✓ Correct</span>
                          ) : (
                            <span className="status-error">✗ Incorrect</span>
                          )}
                        </td>
                        <td>{new Date(sub.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="admin-section">
            <h2>User Management</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Team</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                        className="role-select"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>{user.teamId?.name || 'No team'}</td>
                    <td>
                      <button
                        onClick={() => handleDelete('users', user._id)}
                        className="btn-danger"
                        disabled={user._id === stats?.overview?.adminUsers}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div className="admin-section">
            <h2>Team Management</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Score</th>
                  <th>Members</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams.map(team => (
                  <tr key={team._id}>
                    <td>{team.name}</td>
                    <td>{team.score}</td>
                    <td>
                      {team.members?.map(m => m.username).join(', ') || 'No members'}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete('teams', team._id)}
                        className="btn-danger"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Challenges Tab */}
        {activeTab === 'challenges' && (
          <div className="admin-section">
            <h2>Challenge Management</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="btn-primary"
              style={{ marginBottom: '1rem' }}
            >
              {showCreateForm ? 'Cancel' : 'Create New Challenge'}
            </button>

            {showCreateForm && (
              <ChallengeForm
                accessToken={accessToken}
                onSuccess={() => {
                  setShowCreateForm(false);
                  fetchChallenges();
                }}
              />
            )}

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Points</th>
                  <th>Difficulty</th>
                  <th>Solved</th>
                  <th>Visible</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {challenges.map(challenge => (
                  <tr key={challenge._id}>
                    <td>{challenge.title}</td>
                    <td>{challenge.category}</td>
                    <td>{challenge.points}</td>
                    <td>
                      <span className={`badge badge-${challenge.difficulty}`}>
                        {challenge.difficulty}
                      </span>
                    </td>
                    <td>{challenge.solvedCount || 0}</td>
                    <td>{challenge.visible ? '✓' : '✗'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleToggleVisibility(challenge._id, challenge.visible)}
                          className="btn-secondary"
                        >
                          {challenge.visible ? 'Hide' : 'Show'}
                        </button>
                        <button
                          onClick={() => handleDelete('challenges', challenge._id)}
                          className="btn-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <div className="admin-section">
            <h2>Submission History</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Team</th>
                  <th>Challenge</th>
                  <th>Status</th>
                  <th>Points</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(sub => (
                  <tr key={sub._id}>
                    <td>{sub.userId?.username || 'N/A'}</td>
                    <td>{sub.teamId?.name || 'N/A'}</td>
                    <td>{sub.challengeId?.title || 'N/A'}</td>
                    <td>
                      {sub.correct ? (
                        <span className="status-success">✓ Correct</span>
                      ) : (
                        <span className="status-error">✗ Incorrect</span>
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

        {/* Blogs Tab */}
        {activeTab === 'blogs' && (
          <div className="admin-section">
            <h2>Blog Management</h2>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Published</th>
                  <th>Views</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map(blog => (
                  <tr key={blog._id}>
                    <td>{blog.title}</td>
                    <td>{blog.author?.username || 'N/A'}</td>
                    <td>{blog.category}</td>
                    <td>{blog.published ? '✓' : '✗'}</td>
                    <td>{blog.views || 0}</td>
                    <td>
                      <button
                        onClick={() => handleDelete('blogs', blog._id)}
                        className="btn-danger"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* News Tab */}
        {activeTab === 'news' && (
          <div className="admin-section">
            <h2>News Management</h2>
            <button
              onClick={handleFetchNews}
              className="btn-primary"
              style={{ marginBottom: '1rem' }}
            >
              🔄 Fetch Latest News
            </button>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Source</th>
                  <th>Category</th>
                  <th>Published</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {news.map(article => (
                  <tr key={article._id}>
                    <td>{article.title}</td>
                    <td>{article.sourceName}</td>
                    <td>{article.category}</td>
                    <td>{new Date(article.publishedAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleDelete('news', article._id)}
                        className="btn-danger"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}

// Challenge Form Component
function ChallengeForm({ accessToken, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'web',
    points: 100,
    difficulty: 'easy',
    flag: '',
    visible: false,
    files: '',
    hints: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post(
        '/api/admin/challenges',
        {
          ...formData,
          files: formData.files ? formData.files.split(',').map(f => f.trim()) : [],
          hints: formData.hints ? formData.hints.split(',').map(h => h.trim()) : [],
          points: parseInt(formData.points)
        }
      );
      alert('Challenge created successfully!');
      onSuccess();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create challenge');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="form-group">
        <label>Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label>Description *</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          rows="4"
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Category *</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="web">Web</option>
            <option value="crypto">Crypto</option>
            <option value="pwn">Pwn</option>
            <option value="forensics">Forensics</option>
            <option value="reverse">Reverse</option>
            <option value="misc">Misc</option>
          </select>
        </div>
        <div className="form-group">
          <label>Points *</label>
          <input
            type="number"
            value={formData.points}
            onChange={(e) => setFormData({ ...formData, points: e.target.value })}
            required
            min="1"
          />
        </div>
        <div className="form-group">
          <label>Difficulty *</label>
          <select
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Flag *</label>
        <input
          type="text"
          value={formData.flag}
          onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
          required
          placeholder="CTF{...}"
        />
      </div>
      <div className="form-group">
        <label>Files (comma-separated URLs)</label>
        <input
          type="text"
          value={formData.files}
          onChange={(e) => setFormData({ ...formData, files: e.target.value })}
          placeholder="https://example.com/file1.zip, https://example.com/file2.txt"
        />
      </div>
      <div className="form-group">
        <label>Hints (comma-separated)</label>
        <input
          type="text"
          value={formData.hints}
          onChange={(e) => setFormData({ ...formData, hints: e.target.value })}
          placeholder="Hint 1, Hint 2, Hint 3"
        />
      </div>
      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={formData.visible}
            onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
          />
          {' '}Visible to users
        </label>
      </div>
      <button type="submit" className="btn-primary">Create Challenge</button>
    </form>
  );
}

export default AdminPanel;
