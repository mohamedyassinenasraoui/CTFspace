# Quick API Setup for News Feed

## 🎯 Current Status: Already Working!

**Good news!** The news feed is **already working** with FREE sources that don't require any API keys:

✅ **NVD (National Vulnerability Database)** - CVE data  
✅ **RSS Feeds** - Multiple security news sources

## 📋 What You Get Right Now (No Setup)

The system automatically fetches from:

1. **NVD API** (Free, no key needed)
   - CVE vulnerabilities
   - Severity scores
   - Published dates

2. **RSS Feeds** (Free, no key needed)
   - Krebs on Security
   - SecurityWeek
   - Dark Reading
   - BleepingComputer
   - Threatpost
   - The Hacker News

## 🚀 How It Works

1. **Automatic**: News fetches every hour automatically
2. **On Startup**: First fetch happens when server starts
3. **Manual Trigger**: You can trigger a fetch via API

## 🔧 To Add More News Sources

### Option 1: Add More RSS Feeds (Easiest - No API Keys)

Edit: `backend/services/newsFeedService.js`

Find the `fetchMultipleRSSFeeds()` function and add more feeds:

```javascript
const rssFeeds = [
  // ... existing feeds ...
  {
    url: 'https://securityaffairs.co/wordpress/feed',
    sourceName: 'Security Affairs',
    category: 'news'
  },
  {
    url: 'https://www.scmagazine.com/rss',
    sourceName: 'SC Magazine',
    category: 'news'
  }
];
```

Then restart the backend server.

### Option 2: Add Feedly API (Requires API Key)

1. Get API key from https://feedly.com/v3/auth/dev
2. Add to `backend/.env`:
   ```
   FEEDLY_ACCESS_TOKEN=your-token-here
   ```
3. Add Feedly function to `newsFeedService.js` (see API_SETUP_GUIDE.md)
4. Restart server

## 🧪 Test the News Feed

### Check if it's working:

1. **Wait 1-2 minutes** after server starts (first fetch happens automatically)

2. **Or trigger manually**:
   ```bash
   curl -X POST http://localhost:5000/api/news/fetch
   ```

3. **View articles**:
   - Frontend: http://localhost:5173/news
   - API: http://localhost:5000/api/news

## 📊 View News in Browser

1. Start the servers (already running)
2. Open: http://localhost:5173/news
3. You should see articles from NVD and RSS feeds

## ❓ Troubleshooting

**No articles showing?**
- Wait a few minutes (first fetch takes time)
- Check backend console for errors
- Trigger manual fetch: `POST /api/news/fetch`
- Check MongoDB connection

**Want more sources?**
- Add RSS feeds (easiest, no API keys)
- See `API_SETUP_GUIDE.md` for paid API options

## 📝 Summary

**You don't need to do anything!** The news feed is already configured and working with free sources. Articles will start appearing automatically within a few minutes of server startup.

To get MORE news, simply add more RSS feed URLs to the `rssFeeds` array in `newsFeedService.js`.

