import express from 'express';
import HiddenFlag from '../models/HiddenFlag.js';
import FlagDiscovery from '../models/FlagDiscovery.js';
import Team from '../models/Team.js';
import { authMiddleware } from '../middleware/auth.js';
import { apiRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// Submit a hidden flag
router.post('/submit', authMiddleware, apiRateLimit, async (req, res) => {
  try {
    const { flag } = req.body;

    if (!flag || typeof flag !== 'string') {
      return res.status(400).json({ error: 'Flag is required' });
    }

    // Find the flag
    const hiddenFlag = await HiddenFlag.findOne({ flag });
    
    if (!hiddenFlag) {
      return res.json({ 
        correct: false, 
        message: 'Flag not found. Keep searching!'
      });
    }

    // Check if already discovered
    const existing = await FlagDiscovery.findOne({
      userId: req.user._id,
      flagId: hiddenFlag.flagId
    });

    if (existing) {
      return res.json({
        correct: true,
        message: 'You already found this flag!',
        pointsAwarded: 0
      });
    }

    // Award points
    let pointsAwarded = 0;
    if (req.user.teamId) {
      const team = await Team.findById(req.user.teamId);
      if (team) {
        pointsAwarded = hiddenFlag.points;
        await Team.findByIdAndUpdate(team._id, {
          $inc: { score: pointsAwarded }
        });
      }
    }

    // Record discovery
    await FlagDiscovery.create({
      userId: req.user._id,
      teamId: req.user.teamId,
      flagId: hiddenFlag.flagId,
      pointsAwarded
    });

    // Increment solved count
    await HiddenFlag.findByIdAndUpdate(hiddenFlag._id, {
      $inc: { solvedCount: 1 }
    });

    // Emit leaderboard update
    if (global.io && req.user.teamId) {
      const topTeams = await Team.find()
        .select('name score')
        .sort({ score: -1 })
        .limit(20);
      
      global.io.to('leaderboard').emit('leaderboard:update', { teams: topTeams });
    }

    res.json({
      correct: true,
      message: `🎉 Flag found! +${pointsAwarded} points`,
      pointsAwarded,
      category: hiddenFlag.category,
      location: hiddenFlag.location
    });
  } catch (error) {
    console.error('Submit hidden flag error:', error);
    res.status(500).json({ error: 'Failed to submit flag' });
  }
});

// Get user's discovered flags
router.get('/discovered', authMiddleware, async (req, res) => {
  try {
    const discoveries = await FlagDiscovery.find({ userId: req.user._id })
      .sort({ discoveredAt: -1 });

    const flagIds = discoveries.map(d => d.flagId);
    const flags = await HiddenFlag.find({ flagId: { $in: flagIds } })
      .select('flagId title category difficulty tags points');

    res.json({ discoveredFlags: flags });
  } catch (error) {
    console.error('Get discovered flags error:', error);
    res.status(500).json({ error: 'Failed to get discovered flags' });
  }
});

// Get all hidden flags (for admin or hints)
router.get('/list', apiRateLimit, async (req, res) => {
  try {
    const flags = await HiddenFlag.find()
      .select('flagId title category difficulty tags location description hints author solvedCount likes points createdAt')
      .sort({ category: 1, points: 1 });

    res.json({ flags });
  } catch (error) {
    console.error('Get flags list error:', error);
    res.status(500).json({ error: 'Failed to get flags list' });
  }
});

// Get single flag details
router.get('/:flagId', apiRateLimit, async (req, res) => {
  try {
    const flag = await HiddenFlag.findOne({ flagId: req.params.flagId })
      .select('-flag'); // Don't send the actual flag

    if (!flag) {
      return res.status(404).json({ error: 'Flag not found' });
    }

    res.json({ flag });
  } catch (error) {
    console.error('Get flag error:', error);
    res.status(500).json({ error: 'Failed to get flag' });
  }
});

// Like/Unlike a flag
router.post('/:flagId/like', authMiddleware, async (req, res) => {
  try {
    const flag = await HiddenFlag.findOne({ flagId: req.params.flagId });

    if (!flag) {
      return res.status(404).json({ error: 'Flag not found' });
    }

    const userId = req.user._id;
    const isLiked = flag.likedBy?.some(id => id.equals(userId));

    if (isLiked) {
      flag.likedBy = flag.likedBy.filter(id => !id.equals(userId));
      flag.likes = Math.max(0, flag.likes - 1);
    } else {
      if (!flag.likedBy) flag.likedBy = [];
      flag.likedBy.push(userId);
      flag.likes += 1;
    }

    await flag.save();

    res.json({
      liked: !isLiked,
      likes: flag.likes
    });
  } catch (error) {
    console.error('Like flag error:', error);
    res.status(500).json({ error: 'Failed to like flag' });
  }
});

// Get statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const totalFlags = await HiddenFlag.countDocuments();
    const discovered = await FlagDiscovery.countDocuments({ userId: req.user._id });
    const totalPoints = await FlagDiscovery.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: null, total: { $sum: '$pointsAwarded' } } }
    ]);

    res.json({
      totalFlags,
      discovered,
      remaining: totalFlags - discovered,
      totalPoints: totalPoints[0]?.total || 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

export default router;

