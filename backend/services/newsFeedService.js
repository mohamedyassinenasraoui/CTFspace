import axios from 'axios';
import NewsArticle from '../models/NewsArticle.js';

// Cache to prevent duplicate fetches
const fetchCache = new Map();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

/**
 * Fetch NVD (National Vulnerability Database) CVE data
 */
async function fetchNVDFeed(limit = 50) {
  try {
    const response = await axios.get('https://services.nvd.nist.gov/rest/json/cves/2.0', {
      params: {
        resultsPerPage: limit,
        startIndex: 0
      },
      timeout: 10000
    });

    const articles = [];
    const cves = response.data.vulnerabilities || [];

    for (const item of cves) {
      const cve = item.cve;
      const descriptions = cve.descriptions || [];
      const description = descriptions.find(d => d.lang === 'en') || descriptions[0];

      // Get severity
      let severity = null;
      if (cve.metrics?.cvssMetricV31?.[0]) {
        const baseScore = cve.metrics.cvssMetricV31[0].cvssData.baseScore;
        if (baseScore >= 9.0) severity = 'critical';
        else if (baseScore >= 7.0) severity = 'high';
        else if (baseScore >= 4.0) severity = 'medium';
        else severity = 'low';
      }

      const article = {
        title: cve.id || 'CVE Alert',
        content: description?.value || '',
        excerpt: description?.value?.substring(0, 200) || '',
        url: `https://nvd.nist.gov/vuln/detail/${cve.id}`,
        source: 'nvd',
        sourceName: 'NVD (National Vulnerability Database)',
        publishedAt: new Date(cve.published || Date.now()),
        category: 'vulnerability',
        cveIds: [cve.id],
        severity: severity,
        tags: ['cve', 'vulnerability', ...(cve.weaknesses?.[0]?.description?.map(w => w.value.toLowerCase()) || [])],
        metadata: {
          cvssScore: cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore,
          cvssVector: cve.metrics?.cvssMetricV31?.[0]?.cvssData?.vectorString
        }
      };

      articles.push(article);
    }

    return articles;
  } catch (error) {
    console.error('Error fetching NVD feed:', error.message);
    return [];
  }
}

/**
 * Fetch from RSS feed using rss-parser library
 */
async function fetchRSSFeed(url, sourceName, category = 'news') {
  try {
    // Dynamic import to avoid issues if library not installed
    let Parser;
    try {
      Parser = (await import('rss-parser')).default;
    } catch (e) {
      console.warn('rss-parser not available, using fallback parser');
      return fetchRSSFeedFallback(url, sourceName, category);
    }

    const parser = new Parser({
      timeout: 10000,
      customFields: {
        item: ['media:content', 'enclosure']
      }
    });

    const feed = await parser.parseURL(url);
    const items = [];

    for (const item of feed.items.slice(0, 20)) {
      // Extract CVE IDs from title/description
      const cveRegex = /CVE-\d{4}-\d+/gi;
      const text = (item.title || '') + ' ' + (item.contentSnippet || item.content || '');
      const cveIds = [...new Set(text.match(cveRegex) || [])];

      // Get image from media or enclosure
      let imageUrl = null;
      if (item['media:content']?.['$']?.url) {
        imageUrl = item['media:content']['$'].url;
      } else if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
        imageUrl = item.enclosure.url;
      }

      items.push({
        title: item.title || 'Untitled',
        content: item.contentSnippet || item.content || '',
        excerpt: (item.contentSnippet || item.content || '').substring(0, 200),
        url: item.link || url,
        source: 'rss',
        sourceName,
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        category: cveIds.length > 0 ? 'vulnerability' : category,
        cveIds,
        imageUrl,
        tags: extractTags(text)
      });
    }

    return items;
  } catch (error) {
    console.error(`Error fetching RSS feed from ${url}:`, error.message);
    return fetchRSSFeedFallback(url, sourceName, category);
  }
}

/**
 * Fallback RSS parser using regex (basic)
 */
async function fetchRSSFeedFallback(url, sourceName, category = 'news') {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (CTF Platform News Aggregator)'
      }
    });

    const items = [];
    const xmlText = response.data;
    
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(xmlText)) !== null && items.length < 20) {
      const itemXml = match[1];
      
      const titleMatch = itemXml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const linkMatch = itemXml.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
      const descMatch = itemXml.match(/<description[^>]*>([\s\S]*?)<\/description>/i);
      const dateMatch = itemXml.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i);

      if (titleMatch && linkMatch) {
        const title = titleMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();
        const link = linkMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim();
        const description = descMatch ? descMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '').trim() : '';
        const pubDate = dateMatch ? new Date(dateMatch[1].trim()) : new Date();

        const cveRegex = /CVE-\d{4}-\d+/gi;
        const cveIds = [...new Set([...(title.match(cveRegex) || []), ...(description.match(cveRegex) || [])])];

        items.push({
          title,
          content: description,
          excerpt: description.substring(0, 200),
          url: link,
          source: 'rss',
          sourceName,
          publishedAt: pubDate,
          category: cveIds.length > 0 ? 'vulnerability' : category,
          cveIds,
          tags: extractTags(title + ' ' + description)
        });
      }
    }

    return items;
  } catch (error) {
    console.error(`Error in fallback RSS parser for ${url}:`, error.message);
    return [];
  }
}

/**
 * Extract tags from text
 */
function extractTags(text) {
  const commonTags = [
    'ransomware', 'malware', 'phishing', 'ddos', 'breach', 'exploit',
    'vulnerability', 'patch', 'security', 'cyber', 'threat', 'attack',
    'iot', 'cloud', 'api', 'zero-day', 'apt', 'crypto', 'blockchain'
  ];

  const lowerText = text.toLowerCase();
  return commonTags.filter(tag => lowerText.includes(tag));
}

/**
 * Fetch from multiple RSS sources
 */
async function fetchMultipleRSSFeeds() {
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
      url: 'https://feeds.feedburner.com/TheHackersNews',
      sourceName: 'The Hacker News',
      category: 'news'
    },
    {
        url: 'https://securityaffairs.co/wordpress/feed',
        sourceName: 'Security Affairs',
        category: 'news'
      }
  ];

  const allArticles = [];
  
  for (const feed of rssFeeds) {
    try {
      const articles = await fetchRSSFeed(feed.url, feed.sourceName, feed.category);
      allArticles.push(...articles);
    } catch (error) {
      console.error(`Failed to fetch ${feed.sourceName}:`, error.message);
    }
  }

  return allArticles;
}

/**
 * Main function to fetch and store news articles
 */
export async function fetchAndStoreNews() {
  console.log('Starting news feed fetch...');
  const startTime = Date.now();

  try {
    // Fetch from multiple sources
    const [nvdArticles, rssArticles] = await Promise.all([
      fetchNVDFeed(30),
      fetchMultipleRSSFeeds()
    ]);

    const allArticles = [...nvdArticles, ...rssArticles];
    console.log(`Fetched ${allArticles.length} articles from all sources`);

    // Store articles in database (skip duplicates)
    let storedCount = 0;
    let skippedCount = 0;

    for (const article of allArticles) {
      try {
        // Check if article already exists
        const existing = await NewsArticle.findOne({ url: article.url });
        
        if (!existing) {
          await NewsArticle.create(article);
          storedCount++;
        } else {
          skippedCount++;
        }
      } catch (error) {
        if (error.code !== 11000) { // Ignore duplicate key errors
          console.error('Error storing article:', error.message);
        }
      }
    }

    const duration = Date.now() - startTime;
    console.log(`News fetch completed in ${duration}ms. Stored: ${storedCount}, Skipped: ${skippedCount}`);

    return { stored: storedCount, skipped: skippedCount, total: allArticles.length };
  } catch (error) {
    console.error('Error in fetchAndStoreNews:', error);
    throw error;
  }
}

/**
 * Get cached fetch result or fetch new
 */
export async function getCachedNewsFetch() {
  const cacheKey = 'news_fetch';
  const cached = fetchCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const result = await fetchAndStoreNews();
  fetchCache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}

