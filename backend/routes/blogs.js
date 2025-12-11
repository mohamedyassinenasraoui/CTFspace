import express from 'express';
import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { apiRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// Get all published blogs
router.get('/', apiRateLimit, async (req, res) => {
  try {
    const { category, tag, page = 1, limit = 10 } = req.query;
    const query = { published: true };
    
    if (category) query.category = category;
    if (tag) query.tags = tag;

    const blogs = await Blog.find(query)
      .populate('author', 'username avatar')
      .select('-content') // Don't send full content in list
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// Get single blog by slug
router.get('/:slug', apiRateLimit, async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, published: true })
      .populate('author', 'username avatar email');

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    // Get comments for this blog
    const comments = await Comment.find({ blogId: blog._id })
      .populate('userId', 'username avatar')
      .populate('parentId')
      .sort({ createdAt: -1 });

    res.json({ blog, comments });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
});

// Create blog (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, featuredImage, published } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const blog = await Blog.create({
      title,
      content,
      excerpt,
      category: category || 'general',
      tags: tags || [],
      featuredImage,
      author: req.user._id,
      published: published || false,
      publishedAt: published ? new Date() : null
    });

    const populatedBlog = await Blog.findById(blog._id)
      .populate('author', 'username avatar');

    res.status(201).json({ blog: populatedBlog });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ error: 'Failed to create blog' });
  }
});

// Update blog (admin only)
router.patch('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.author; // Don't allow changing author

    if (updateData.published && !updateData.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).populate('author', 'username avatar');

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({ blog });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ error: 'Failed to update blog' });
  }
});

// Delete blog (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ blogId: req.params.id });
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ error: 'Failed to delete blog' });
  }
});

export default router;

