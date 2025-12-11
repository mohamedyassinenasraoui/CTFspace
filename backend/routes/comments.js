import express from 'express';
import Comment from '../models/Comment.js';
import Blog from '../models/Blog.js';
import { authMiddleware } from '../middleware/auth.js';
import { apiRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// Get comments for a blog
router.get('/blog/:blogId', apiRateLimit, async (req, res) => {
  try {
    const comments = await Comment.find({ blogId: req.params.blogId })
      .populate('userId', 'username avatar')
      .populate('parentId')
      .sort({ createdAt: -1 });

    res.json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Create comment
router.post('/', authMiddleware, apiRateLimit, async (req, res) => {
  try {
    const { blogId, content, parentId } = req.body;

    if (!blogId || !content) {
      return res.status(400).json({ error: 'Blog ID and content are required' });
    }

    // Verify blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    const comment = await Comment.create({
      blogId,
      userId: req.user._id,
      content,
      parentId: parentId || null
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'username avatar')
      .populate('parentId');

    res.status(201).json({ comment: populatedComment });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Update comment (own comment only)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (!comment.userId.equals(req.user._id)) {
      return res.status(403).json({ error: 'You can only edit your own comments' });
    }

    comment.content = req.body.content;
    await comment.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'username avatar');

    res.json({ comment: populatedComment });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// Delete comment (own comment or admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (!comment.userId.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete nested comments
    await Comment.deleteMany({ parentId: comment._id });
    await Comment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Like/Unlike comment
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const userId = req.user._id;
    const isLiked = comment.likes.includes(userId);

    if (isLiked) {
      comment.likes = comment.likes.filter(id => !id.equals(userId));
    } else {
      comment.likes.push(userId);
    }

    await comment.save();

    res.json({ 
      liked: !isLiked,
      likesCount: comment.likes.length
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ error: 'Failed to like comment' });
  }
});

export default router;

