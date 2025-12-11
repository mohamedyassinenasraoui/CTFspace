import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient, API_URL } from '../utils/api.js';
import '../App.css';
import './NewsFeed.css';

function NewsFeed() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({});
  const [sources, setSources] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchNews();
    fetchSources();
  }, [selectedCategory, selectedSource, selectedSeverity, searchQuery, page]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(selectedSource !== 'all' && { source: selectedSource }),
        ...(selectedSeverity !== 'all' && { severity: selectedSeverity }),
        ...(searchQuery && { search: searchQuery })
      };

      const response = await apiClient.get('/api/news', { params });
      setArticles(response.data.articles || []);
      setStats(response.data.stats || {});
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSources = async () => {
    try {
      const response = await apiClient.get('/api/news/sources/list');
      setSources(response.data.sources || []);
    } catch (error) {
      console.error('Failed to fetch sources:', error);
    }
  };

  const categories = [
    { value: 'all', label: 'All News' },
    { value: 'news', label: 'General News' },
    { value: 'vulnerability', label: 'Vulnerabilities' },
    { value: 'threat', label: 'Threats' },
    { value: 'alert', label: 'Alerts' },
    { value: 'analysis', label: 'Analysis' }
  ];

  const severities = [
    { value: 'all', label: 'All Severities' },
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  return (
    <div className="news-feed-page">
      <div className="container">
        <div className="news-header">
          <h1>Cybersecurity News Feed</h1>
          <p>Stay updated with the latest security news, vulnerabilities, and threats</p>
        </div>

        {/* Stats Bar */}
        <div className="stats-bar">
          {Object.entries(stats).map(([category, count]) => (
            <div key={category} className="stat-item">
              <span className="stat-label">{category}</span>
              <span className="stat-value">{count}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="news-filters">
          <div className="filter-group">
            <label>Category</label>
            <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Source</label>
            <select value={selectedSource} onChange={(e) => { setSelectedSource(e.target.value); setPage(1); }}>
              <option value="all">All Sources</option>
              {sources.map(source => (
                <option key={source._id} value={source._id}>{source.name} ({source.count})</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Severity</label>
            <select value={selectedSeverity} onChange={(e) => { setSelectedSeverity(e.target.value); setPage(1); }}>
              {severities.map(sev => (
                <option key={sev.value} value={sev.value}>{sev.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group search-group">
            <label>Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder="Search articles..."
            />
          </div>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="loading">Loading news...</div>
        ) : articles.length === 0 ? (
          <div className="empty-state">
            <p>No articles found. Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <div className="news-grid">
              {articles.map(article => (
                <NewsCard key={article._id} article={article} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-secondary"
                >
                  Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn btn-secondary"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function NewsCard({ article }) {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="news-card"
    >
      {article.imageUrl && (
        <div className="news-image">
          <img src={article.imageUrl} alt={article.title} />
        </div>
      )}
      <div className="news-content">
        <div className="news-meta">
          <span className={`news-category category-${article.category}`}>
            {article.category}
          </span>
          {article.severity && (
            <span
              className="news-severity"
              style={{ color: getSeverityColor(article.severity) }}
            >
              {article.severity.toUpperCase()}
            </span>
          )}
          <span className="news-source">{article.sourceName}</span>
        </div>
        <h3 className="news-title">{article.title}</h3>
        {article.excerpt && <p className="news-excerpt">{article.excerpt}</p>}
        {article.cveIds && article.cveIds.length > 0 && (
          <div className="news-cves">
            {article.cveIds.map(cve => (
              <span key={cve} className="cve-badge">{cve}</span>
            ))}
          </div>
        )}
        <div className="news-footer">
          <span className="news-date">
            {new Date(article.publishedAt).toLocaleDateString()}
          </span>
          <span className="news-views">👁 {article.views || 0}</span>
        </div>
      </div>
    </a>
  );
}

export default NewsFeed;

