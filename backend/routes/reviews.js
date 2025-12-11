import express from 'express';
import Review from '../models/Review.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { apiRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// Get all reviews
router.get('/', apiRateLimit, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find()
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Review.countDocuments();
    const averageRating = await Review.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    res.json({
      reviews,
      averageRating: averageRating[0]?.avgRating || 0,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Create review
router.post('/', authMiddleware, apiRateLimit, async (req, res) => {
  try {
    const { rating, title, content } = req.body;

    if (!rating || !title || !content) {
      return res.status(400).json({ error: 'Rating, title, and content are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({ userId: req.user._id });
    if (existingReview) {
      return res.status(400).json({ error: 'You have already submitted a review' });
    }

    const review = await Review.create({
      userId: req.user._id,
      rating: parseInt(rating),
      title,
      content
    });

    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'username avatar');

    res.status(201).json({ review: populatedReview });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Update review (own review only)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (!review.userId.equals(req.user._id)) {
      return res.status(403).json({ error: 'You can only edit your own review' });
    }

    if (req.body.rating) review.rating = parseInt(req.body.rating);
    if (req.body.title) review.title = req.body.title;
    if (req.body.content) review.content = req.body.content;

    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'username avatar');

    res.json({ review: populatedReview });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete review (own review or admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (!review.userId.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Mark review as helpful
router.post('/:id/helpful', authMiddleware, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const userId = req.user._id;
    const isHelpful = review.helpful.includes(userId);

    if (isHelpful) {
      review.helpful = review.helpful.filter(id => !id.equals(userId));
    } else {
      review.helpful.push(userId);
    }

    await review.save();

    res.json({ 
      helpful: !isHelpful,
      helpfulCount: review.helpful.length
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({ error: 'Failed to mark review as helpful' });
  }
});

// Verify review (admin only)
router.post('/:id/verify', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $set: { verified: true } },
      { new: true }
    ).populate('userId', 'username avatar');

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ review });
  } catch (error) {
    console.error('Verify review error:', error);
    res.status(500).json({ error: 'Failed to verify review' });
  }
});

export default router;

