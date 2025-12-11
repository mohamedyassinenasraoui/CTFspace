# News Feed API Setup Guide

This guide explains how to set up and configure different APIs for the cybersecurity news feed.

## Current Implementation

The news feed system currently uses **FREE** sources that don't require API keys:

### 1. NVD (National Vulnerability Database) - ✅ Already Working

**Status**: No API key required (free public API)

**What it provides**: CVE (Common Vulnerabilities and Exposures) data with severity scores

**How it works**: 
- Already implemented in `backend/services/newsFeedService.js`
- Fetches from: `https://services.nvd.nist.gov/rest/json/cves/2.0`
- Rate limit: 50 requests per 30 seconds (we fetch every hour, so no issues)

**No setup needed** - it's already working!

---

### 2. RSS Feeds - ✅ Already Working

**Status**: No API key required (public RSS feeds)

**Current sources**:
- Krebs on Security: `https://krebsonsecurity.com/feed/`
- SecurityWeek: `https://feeds.feedburner.com/Securityweek`
- Dark Reading: `https://www.darkreading.com/rss.xml`

**How it works**:
- Uses `rss-parser` library to parse RSS feeds
- Already implemented and working

**No setup needed** - it's already working!

---

## Optional: Adding Paid/API Key Services

### Option 1: Feedly API (Recommended for Curated Content)

**What it provides**: Curated cybersecurity articles with metadata

**Setup Steps**:

1. **Get API Key**:
   - Go to https://feedly.com/v3/auth/dev
   - Sign up for a developer account
   - Create a new app
   - Get your `access_token`

2. **Add to Backend**:

Edit `backend/services/newsFeedService.js`:

```javascript
// Add this function
async function fetchFeedlyFeed(accessToken) {
  try {
    const response = await axios.get('https://cloud.feedly.com/v3/streams/contents', {
      params: {
        streamId: 'user/YOUR_USER_ID/category/security', // Your security category
        count: 20
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      timeout: 10000
    });

    const articles = [];
    const items = response.data.items || [];

    for (const item of items) {
      articles.push({
        title: item.title,
        content: item.content?.content || item.summary?.content || '',
        excerpt: item.summary?.content?.substring(0, 200) || '',
        url: item.alternate?.[0]?.href || item.canonical?.[0]?.href,
        source: 'feedly',
        sourceName: 'Feedly',
        author: item.author || '',
        publishedAt: new Date(item.published),
        category: 'news',
        tags: item.keywords || [],
        imageUrl: item.visual?.url
      });
    }

    return articles;
  } catch (error) {
    console.error('Error fetching Feedly feed:', error.message);
    return [];
  }
}
```

3. **Update fetchAndStoreNews function**:

```javascript
export async function fetchAndStoreNews() {
  // ... existing code ...
  
  const feedlyToken = process.env.FEEDLY_ACCESS_TOKEN;
  const feedlyArticles = feedlyToken ? await fetchFeedlyFeed(feedlyToken) : [];
  
  const allArticles = [...nvdArticles, ...rssArticles, ...feedlyArticles];
  // ... rest of code ...
}
```

4. **Add to `.env`**:
```env
FEEDLY_ACCESS_TOKEN=your-feedly-token-here
```

---

### Option 2: CyberSecFeed API

**What it provides**: Vulnerability-focused intelligence feed

**Setup Steps**:

1. **Get API Key**:
   - Visit https://cybersecfeed.com/api (if available)
   - Sign up for API access
   - Get your API key

2. **Add to Backend**:

```javascript
async function fetchCyberSecFeed(apiKey) {
  try {
    const response = await axios.get('https://api.cybersecfeed.com/v1/feed', {
      headers: {
        'X-API-Key': apiKey
      },
      timeout: 10000
    });

    const articles = [];
    const items = response.data.items || [];

    for (const item of items) {
      articles.push({
        title: item.title,
        content: item.description || '',
        excerpt: item.description?.substring(0, 200) || '',
        url: item.link,
        source: 'cybersecfeed',
        sourceName: 'CyberSecFeed',
        publishedAt: new Date(item.published_date),
        category: item.type === 'vulnerability' ? 'vulnerability' : 'threat',
        cveIds: item.cve_ids || [],
        severity: item.severity?.toLowerCase(),
        tags: item.tags || []
      });
    }

    return articles;
  } catch (error) {
    console.error('Error fetching CyberSecFeed:', error.message);
    return [];
  }
}
```

3. **Add to `.env`**:
```env
CYBERSECFEED_API_KEY=your-api-key-here
```

---

### Option 3: Adding More RSS Feeds (Easiest - No API Keys)

**How to add more RSS feeds**:

Edit `backend/services/newsFeedService.js`, find `fetchMultipleRSSFeeds()`:

```javascript
const rssFeeds = [
  {
    url: 'https://krebsonsecurity.com/feed/',
    sourceName: 'Krebs on Security',
    category: 'news'
  },
  {
    url: 'https://feeds.feedburner.com/Securityweek',
    sourceName: 'SecurityWeek',
    category: 'news'
  },
  {
    url: 'https://www.darkreading.com/rss.xml',
    sourceName: 'Dark Reading',
    category: 'news'
  },
  // ADD MORE HERE:
  {
    url: 'https://www.bleepingcomputer.com/feed/',
    sourceName: 'BleepingComputer',
    category: 'news'
  },
  {
    url: 'https://threatpost.com/feed/',
    sourceName: 'Threatpost',
    category: 'threat'
  },
  {
    url: 'https://www.csoonline.com/index.rss',
    sourceName: 'CSO Online',
    category: 'news'
  },
  {
    url: 'https://www.infosecurity-magazine.com/rss/news/',
    sourceName: 'Infosecurity Magazine',
    category: 'news'
  }
];
```

**Popular Security RSS Feeds** (all free, no API keys):
- BleepingComputer: `https://www.bleepingcomputer.com/feed/`
- Threatpost: `https://threatpost.com/feed/`
- CSO Online: `https://www.csoonline.com/index.rss`
- Infosecurity Magazine: `https://www.infosecurity-magazine.com/rss/news/`
- The Hacker News: `https://feeds.feedburner.com/TheHackersNews`
- Security Affairs: `https://securityaffairs.co/wordpress/feed`
- SC Magazine: `https://www.scmagazine.com/rss`

---

## Quick Setup: Add More RSS Feeds (Recommended)

The easiest way to get more news is to add more RSS feeds. Here's how:

1. **Open the file**:
   ```
   backend/services/newsFeedService.js
   ```

2. **Find the `fetchMultipleRSSFeeds()` function** (around line 150)

3. **Add more feeds to the array**:

```javascript
const rssFeeds = [
  // ... existing feeds ...
  {
    url: 'https://www.bleepingcomputer.com/feed/',
    sourceName: 'BleepingComputer',
    category: 'news'
  },
  {
    url: 'https://threatpost.com/feed/',
    sourceName: 'Threatpost',
    category: 'threat'
  }
];
```

4. **Restart the backend server** - new feeds will be fetched automatically!

---

## Testing the News Feed

### 1. Manual Fetch (Test)

```bash
# Using curl
curl -X POST http://localhost:5000/api/news/fetch

# Or using browser
# Navigate to: http://localhost:5000/api/news/fetch
```

### 2. Check if Articles are Stored

```bash
# Get all news
curl http://localhost:5000/api/news

# Get vulnerabilities only
curl http://localhost:5000/api/news?category=vulnerability

# Search for specific term
curl http://localhost:5000/api/news?search=ransomware
```

### 3. View in Frontend

- Navigate to: `http://localhost:5173/news`
- Articles should appear automatically

---

## Current Status

✅ **Working Now (No Setup Required)**:
- NVD CVE feed (vulnerabilities)
- 3 RSS feeds (Krebs, SecurityWeek, Dark Reading)
- Automatic fetching every hour
- Frontend display at `/news`

❌ **Requires Setup**:
- Feedly API (optional, requires API key)
- CyberSecFeed API (optional, requires API key)
- Additional RSS feeds (easy, just add URLs)

---

## Troubleshooting

### No Articles Appearing

1. **Check server logs** for fetch errors
2. **Wait a few minutes** - first fetch happens on startup
3. **Trigger manual fetch**: `POST /api/news/fetch`
4. **Check MongoDB** - verify articles are being stored

### RSS Feed Errors

- Some RSS feeds may be temporarily unavailable
- Check feed URLs are accessible
- System will continue with other feeds if one fails

### NVD API Rate Limits

- NVD allows 50 requests per 30 seconds
- We fetch every hour, so no issues
- If you need more frequent updates, consider caching

---

## Recommended Setup

**For immediate use (no API keys needed)**:
1. Add more RSS feeds (see list above)
2. Restart backend
3. Wait for automatic fetch or trigger manually

**For enhanced content (optional)**:
1. Sign up for Feedly API
2. Add Feedly integration code
3. Add API key to `.env`
4. Restart backend

The current setup with NVD + RSS feeds provides excellent coverage without any API keys!

