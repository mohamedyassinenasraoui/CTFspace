import express from 'express';
import NewsArticle from '../models/NewsArticle.js';
import { apiRateLimit } from '../middleware/rateLimit.js';
import { fetchAndStoreNews } from '../services/newsFeedService.js';

const router = express.Router();

// Get news articles with filtering
router.get('/', apiRateLimit, async (req, res) => {
  try {
    const {
      category,
      source,
      severity,
      search,
      page = 1,
      limit = 20,
      sort = 'publishedAt'
    } = req.query;

    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (source) {
      query.source = source;
    }

    if (severity) {
      query.severity = severity;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    if (sort === 'publishedAt') {
      sortOptions.publishedAt = -1;
    } else if (sort === 'views') {
      sortOptions.views = -1;
    } else {
      sortOptions.createdAt = -1;
    }

    const articles = await NewsArticle.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-content'); // Don't send full content in list

    const total = await NewsArticle.countDocuments(query);

    // Get statistics
    const stats = await NewsArticle.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      articles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      stats: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Get single article
router.get('/:id', apiRateLimit, async (req, res) => {
  try {
    const article = await NewsArticle.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Increment views
    article.views += 1;
    await article.save();

    res.json({ article });
  } catch (error) {
    console.error('Get article error:', error);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// Get articles by CVE ID
router.get('/cve/:cveId', apiRateLimit, async (req, res) => {
  try {
    const articles = await NewsArticle.find({
      cveIds: { $in: [req.params.cveId.toUpperCase()] }
    })
      .sort({ publishedAt: -1 })
      .limit(50);

    res.json({ articles });
  } catch (error) {
    console.error('Get CVE articles error:', error);
    res.status(500).json({ error: 'Failed to fetch CVE articles' });
  }
});

// Manual trigger to fetch news (admin only - add auth middleware if needed)
router.post('/fetch', apiRateLimit, async (req, res) => {
  try {
    const result = await fetchAndStoreNews();
    res.json({
      message: 'News fetch completed',
      ...result
    });
  } catch (error) {
    console.error('Manual fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Get sources list
router.get('/sources/list', apiRateLimit, async (req, res) => {
  try {
    const sources = await NewsArticle.distinct('source', {});
    const sourceDetails = await NewsArticle.aggregate([
      {
        $group: {
          _id: '$source',
          name: { $first: '$sourceName' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({ sources: sourceDetails });
  } catch (error) {
    console.error('Get sources error:', error);
    res.status(500).json({ error: 'Failed to fetch sources' });
  }
});

export default router;

