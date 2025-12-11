import express from 'express';
import Challenge from '../models/Challenge.js';
import Submission from '../models/Submission.js';
import Team from '../models/Team.js';
import { authMiddleware } from '../middleware/auth.js';
import { apiRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// Get all visible challenges (supports filtering by challengeType)
router.get('/', apiRateLimit, async (req, res) => {
  try {
    const { challengeType, category, difficulty } = req.query;
    const query = { visible: true };
    
    if (challengeType) {
      query.challengeType = challengeType;
    }
    if (category) {
      query.category = category;
    }
    if (difficulty) {
      query.difficulty = difficulty;
    }

    const challenges = await Challenge.find(query)
      .select('-flagHash -flagSalt -flag') // Never expose flags
      .sort({ category: 1, points: 1 });

    res.json({ challenges });
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({ error: 'Failed to get challenges' });
  }
});

// Get challenge details (no flag info)
router.get('/:id', apiRateLimit, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .select('-flagHash -flagSalt -flag'); // Never expose flags

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    if (!challenge.visible && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Challenge not available' });
    }

    res.json({ challenge });
  } catch (error) {
    console.error('Get challenge error:', error);
    res.status(500).json({ error: 'Failed to get challenge' });
  }
});

// Like/Unlike a challenge
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const userId = req.user._id;
    const isLiked = challenge.likedBy?.some(id => id.equals(userId));

    if (isLiked) {
      challenge.likedBy = challenge.likedBy.filter(id => !id.equals(userId));
      challenge.likes = Math.max(0, challenge.likes - 1);
    } else {
      if (!challenge.likedBy) challenge.likedBy = [];
      challenge.likedBy.push(userId);
      challenge.likes += 1;
    }

    await challenge.save();

    res.json({
      liked: !isLiked,
      likes: challenge.likes
    });
  } catch (error) {
    console.error('Like challenge error:', error);
    res.status(500).json({ error: 'Failed to like challenge' });
  }
});

// Get user's solved challenges
router.get('/solved/mine', authMiddleware, async (req, res) => {
  try {
    if (!req.user.teamId) {
      return res.json({ challenges: [] });
    }

    const solvedSubmissions = await Submission.find({
      teamId: req.user.teamId,
      correct: true
    }).select('challengeId');

    const challengeIds = solvedSubmissions.map(s => s.challengeId);
    const challenges = await Challenge.find({
      _id: { $in: challengeIds }
    }).select('-flagHash -flagSalt -flag');

    res.json({ challenges });
  } catch (error) {
    console.error('Get solved challenges error:', error);
    res.status(500).json({ error: 'Failed to get solved challenges' });
  }
});

export default router;

