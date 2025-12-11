import express from 'express';
import Challenge from '../models/Challenge.js';
import Submission from '../models/Submission.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import Blog from '../models/Blog.js';
import NewsArticle from '../models/NewsArticle.js';
// Hidden flags are now part of Challenge model
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { apiRateLimit } from '../middleware/rateLimit.js';
import { hashFlag, generateSalt } from '../utils/flagVerification.js';
import { fetchAndStoreNews } from '../services/newsFeedService.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);
router.use(apiRateLimit);

// Create challenge
router.post('/challenges', async (req, res) => {
  try {
    const { title, description, category, points, difficulty, flag, visible, files, hints } = req.body;

    if (!title || !description || !category || !points || !difficulty || !flag) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty level' });
    }

    // Hash the flag
    const salt = generateSalt();
    const flagHash = hashFlag(flag, salt);

    const challenge = await Challenge.create({
      title,
      description,
      category,
      points: parseInt(points),
      difficulty,
      flagHash,
      flagSalt: salt,
      visible: visible || false,
      files: files || [],
      hints: hints || []
    });

    res.status(201).json({ 
      challenge: {
        id: challenge._id,
        title: challenge.title,
        description: challenge.description,
        category: challenge.category,
        points: challenge.points,
        difficulty: challenge.difficulty,
        visible: challenge.visible,
        files: challenge.files,
        hints: challenge.hints
      }
    });
  } catch (error) {
    console.error('Create challenge error:', error);
    res.status(500).json({ error: 'Failed to create challenge' });
  }
});

// Update challenge
router.patch('/challenges/:id', async (req, res) => {
  try {
    const { title, description, category, points, difficulty, visible, files, hints } = req.body;
    const challengeId = req.params.id;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (points !== undefined) updateData.points = parseInt(points);
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (visible !== undefined) updateData.visible = visible;
    if (files !== undefined) updateData.files = files;
    if (hints !== undefined) updateData.hints = hints;

    // If flag is being updated, re-hash it
    if (req.body.flag) {
      const salt = generateSalt();
      updateData.flagHash = hashFlag(req.body.flag, salt);
      updateData.flagSalt = salt;
    }

    const challenge = await Challenge.findByIdAndUpdate(
      challengeId,
      { $set: updateData },
      { new: true }
    ).select('-flagHash -flagSalt');

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    res.json({ challenge });
  } catch (error) {
    console.error('Update challenge error:', error);
    res.status(500).json({ error: 'Failed to update challenge' });
  }
});

// Get all challenges (including hidden ones)
router.get('/challenges', async (req, res) => {
  try {
    const challenges = await Challenge.find()
      .select('-flagHash -flagSalt')
      .sort({ createdAt: -1 });

    res.json({ challenges });
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({ error: 'Failed to get challenges' });
  }
});

// Get challenge with flag hash (admin only)
router.get('/challenges/:id', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Return challenge but still don't expose the actual flag
    res.json({ 
      challenge: {
        ...challenge.toObject(),
        flagHash: challenge.flagHash.substring(0, 10) + '...' // Partial hash for verification
      }
    });
  } catch (error) {
    console.error('Get challenge error:', error);
    res.status(500).json({ error: 'Failed to get challenge' });
  }
});

// Delete challenge
router.delete('/challenges/:id', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // Delete related submissions
    await Submission.deleteMany({ challengeId: challenge._id });

    await Challenge.findByIdAndDelete(req.params.id);
    res.json({ message: 'Challenge deleted successfully' });
  } catch (error) {
    console.error('Delete challenge error:', error);
    res.status(500).json({ error: 'Failed to delete challenge' });
  }
});

// Get all submissions
router.get('/submissions', async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate('userId', 'username email')
      .populate('teamId', 'name')
      .populate('challengeId', 'title')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ submissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Failed to get submissions' });
  }
});

// Get all teams
router.get('/teams', async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('members', 'username email avatar')
      .sort({ score: -1 });

    res.json({ teams });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ error: 'Failed to get teams' });
  }
});

// Update team
router.patch('/teams/:id', async (req, res) => {
  try {
    const { name, score } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (score !== undefined) updateData.score = parseInt(score);

    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).populate('members', 'username email avatar');

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({ team });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// Delete team
router.delete('/teams/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Remove team from all members
    await User.updateMany(
      { teamId: team._id },
      { $unset: { teamId: '' } }
    );

    await Team.findByIdAndDelete(req.params.id);
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

// ========== USER MANAGEMENT ==========

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-passwordHash')
      .populate('teamId', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Update user
router.patch('/users/:id', async (req, res) => {
  try {
    const { username, email, role, teamId } = req.body;
    const updateData = {};
    
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) {
      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      updateData.role = role;
    }
    if (teamId !== undefined) {
      if (teamId === null || teamId === '') {
        updateData.teamId = null;
      } else {
        const team = await Team.findById(teamId);
        if (!team) {
          return res.status(404).json({ error: 'Team not found' });
        }
        updateData.teamId = teamId;
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    )
      .select('-passwordHash')
      .populate('teamId', 'name');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't allow deleting yourself
    if (user._id.equals(req.user._id)) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Remove user from team if in one
    if (user.teamId) {
      await Team.findByIdAndUpdate(user.teamId, {
        $pull: { members: user._id }
      });
    }

    // Delete user's submissions and discoveries
    await Submission.deleteMany({ userId: user._id });
    await FlagDiscovery.deleteMany({ userId: user._id });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ========== BLOG MANAGEMENT ==========

// Get all blogs (including unpublished)
router.get('/blogs', async (req, res) => {
  try {
    const { page = 1, limit = 20, published } = req.query;
    const query = {};

    if (published !== undefined) {
      query.published = published === 'true';
    }

    const blogs = await Blog.find(query)
      .populate('author', 'username email avatar')
      .sort({ createdAt: -1 })
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
    res.status(500).json({ error: 'Failed to get blogs' });
  }
});

// Delete blog
router.delete('/blogs/:id', async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ error: 'Failed to delete blog' });
  }
});

// ========== NEWS MANAGEMENT ==========

// Get all news articles
router.get('/news', async (req, res) => {
  try {
    const { page = 1, limit = 50, source, category } = req.query;
    const query = {};

    if (source) query.source = source;
    if (category) query.category = category;

    const articles = await NewsArticle.find(query)
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await NewsArticle.countDocuments(query);

    res.json({
      articles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get news error:', error);
    res.status(500).json({ error: 'Failed to get news' });
  }
});

// Delete news article
router.delete('/news/:id', async (req, res) => {
  try {
    await NewsArticle.findByIdAndDelete(req.params.id);
    res.json({ message: 'News article deleted successfully' });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ error: 'Failed to delete news article' });
  }
});

// Manually trigger news fetch
router.post('/news/fetch', async (req, res) => {
  try {
    res.json({ message: 'News fetch started in background' });
    // Run in background
    fetchAndStoreNews().catch(err => {
      console.error('Background news fetch error:', err);
    });
  } catch (error) {
    console.error('Trigger news fetch error:', error);
    res.status(500).json({ error: 'Failed to trigger news fetch' });
  }
});

// ========== STATISTICS ==========

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalTeams,
      totalChallenges,
      totalSubmissions,
      totalBlogs,
      totalNews,
      adminUsers
    ] = await Promise.all([
      User.countDocuments(),
      Team.countDocuments(),
      Challenge.countDocuments(),
      Submission.countDocuments(),
      Blog.countDocuments(),
      NewsArticle.countDocuments(),
      User.countDocuments({ role: 'admin' })
    ]);

    const correctSubmissions = await Submission.countDocuments({ correct: true });
    const publishedBlogs = await Blog.countDocuments({ published: true });
    const visibleChallenges = await Challenge.countDocuments({ visible: true });

    // Top teams
    const topTeams = await Team.find()
      .select('name score members')
      .populate('members', 'username')
      .sort({ score: -1 })
      .limit(10);

    // Recent activity
    const recentSubmissions = await Submission.find()
      .populate('userId', 'username')
      .populate('challengeId', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      overview: {
        totalUsers,
        adminUsers,
        totalTeams,
        totalChallenges,
        visibleChallenges,
        totalSubmissions,
        correctSubmissions,
        totalBlogs,
        publishedBlogs,
        totalNews,
        totalDiscoveries: correctSubmissions
      },
      topTeams,
      recentSubmissions
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

export default router;

