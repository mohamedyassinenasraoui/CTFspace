# News Feed Integration Guide

## Overview

The platform now includes a comprehensive cybersecurity news feed system that aggregates articles from multiple sources including:

- **NVD (National Vulnerability Database)**: CVE data and vulnerability information
- **RSS Feeds**: Security news from trusted sources
  - Krebs on Security
  - SecurityWeek
  - Dark Reading

## Features

### Backend Services

1. **News Feed Service** (`backend/services/newsFeedService.js`)
   - Fetches from NVD API for CVE data
   - Parses RSS feeds from multiple security news sources
   - Normalizes and stores articles in MongoDB
   - Automatic CVE ID extraction
   - Severity classification based on CVSS scores

2. **Scheduled Fetcher** (`backend/services/newsScheduler.js`)
   - Automatically fetches news every hour (configurable)
   - Runs on server startup
   - Graceful shutdown handling

3. **API Routes** (`backend/routes/news.js`)
   - `GET /api/news` - Get articles with filtering
   - `GET /api/news/:id` - Get single article
   - `GET /api/news/cve/:cveId` - Get articles by CVE ID
   - `POST /api/news/fetch` - Manual trigger (admin)
   - `GET /api/news/sources/list` - List all sources

### Frontend Components

1. **News Feed Page** (`/news`)
   - Category filtering (News, Vulnerabilities, Threats, Alerts, Analysis)
   - Source filtering
   - Severity filtering
   - Search functionality
   - Pagination
   - Statistics display

2. **Landing Page Integration**
   - Preview of latest security alerts
   - Quick access to news feed

## Configuration

### Environment Variables

Add to `backend/.env`:

```env
# News feed fetch interval (in minutes, default: 60)
NEWS_FETCH_INTERVAL_MINUTES=60
```

### Adding More RSS Feeds

Edit `backend/services/newsFeedService.js` in the `fetchMultipleRSSFeeds()` function:

```javascript
const rssFeeds = [
  {
    url: 'https://your-feed-url.com/rss',
    sourceName: 'Your Source Name',
    category: 'news'
  },
  // Add more feeds here
];
```

### Adding Other APIs

To integrate Feedly, CyberSecFeed, or other APIs, add new functions in `newsFeedService.js`:

```javascript
async function fetchFeedlyFeed() {
  // Implementation
  // Add to fetchAndStoreNews() function
}
```

## Usage

### Automatic Fetching

News is automatically fetched:
- On server startup
- Every hour (or interval set in `NEWS_FETCH_INTERVAL_MINUTES`)

### Manual Fetching

Trigger a manual fetch via API:

```bash
POST /api/news/fetch
```

### Filtering Articles

```javascript
// Get vulnerabilities only
GET /api/news?category=vulnerability

// Get critical severity items
GET /api/news?severity=critical

// Search
GET /api/news?search=ransomware

// By source
GET /api/news?source=nvd

// Combined filters
GET /api/news?category=vulnerability&severity=high&page=1&limit=20
```

## Data Model

### NewsArticle Schema

```javascript
{
  title: String,
  content: String,
  excerpt: String,
  url: String (unique),
  source: String, // 'nvd', 'rss', etc.
  sourceName: String,
  author: String,
  publishedAt: Date,
  category: String, // 'news', 'vulnerability', 'threat', etc.
  tags: [String],
  cveIds: [String],
  severity: String, // 'low', 'medium', 'high', 'critical'
  imageUrl: String,
  metadata: Object,
  views: Number
}
```

## Rate Limiting & Caching

- **API Rate Limiting**: Applied via `express-rate-limit` middleware
- **Fetch Caching**: 15-minute cache to prevent duplicate fetches
- **Database Indexing**: Indexed on `publishedAt`, `category`, `cveIds`, and `url`

## Future Enhancements

1. **Additional Sources**:
   - Feedly API integration
   - CyberSecFeed API
   - Arachne Digital API
   - Custom RSS feeds

2. **Features**:
   - Email alerts for critical vulnerabilities
   - User subscriptions to specific categories
   - Bookmarking articles
   - Sharing functionality
   - Related articles suggestions

3. **Analytics**:
   - Most viewed articles
   - Trending topics
   - Source performance metrics

## Troubleshooting

### No Articles Appearing

1. Check server logs for fetch errors
2. Verify RSS feed URLs are accessible
3. Check NVD API availability
4. Ensure MongoDB connection is working

### RSS Parser Errors

If `rss-parser` library fails, the system falls back to a basic regex parser. For better results, ensure the library is installed:

```bash
cd backend
npm install rss-parser
```

### Rate Limiting

If you hit API rate limits:
- Increase cache TTL in `newsFeedService.js`
- Reduce fetch frequency
- Use multiple API keys if available

## Security Considerations

- All external URLs are validated
- User input is sanitized
- Rate limiting prevents abuse
- CORS is properly configured
- No sensitive data stored in articles

