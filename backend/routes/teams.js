import express from 'express';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';
import { apiRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);
router.use(apiRateLimit);

// Create team
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user._id;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    // Check if user is already in a team
    if (req.user.teamId) {
      return res.status(400).json({ error: 'You are already in a team' });
    }

    // Check if team name exists
    const existingTeam = await Team.findOne({ name: name.trim() });
    if (existingTeam) {
      return res.status(400).json({ error: 'Team name already exists' });
    }

    // Create team with creator as first member
    const team = await Team.create({
      name: name.trim(),
      members: [userId],
      score: 0
    });

    // Update user's teamId
    await User.findByIdAndUpdate(userId, { teamId: team._id });

    const populatedTeam = await Team.findById(team._id).populate('members', 'username email');

    res.status(201).json({ team: populatedTeam });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// Join team
router.post('/:id/join', async (req, res) => {
  try {
    const teamId = req.params.id;
    const userId = req.user._id;

    // Check if user is already in a team
    if (req.user.teamId) {
      return res.status(400).json({ error: 'You are already in a team' });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if team is full
    if (team.members.length >= 5) {
      return res.status(400).json({ error: 'Team is full (max 5 members)' });
    }

    // Check if user is already a member
    if (team.members.includes(userId)) {
      return res.status(400).json({ error: 'You are already a member of this team' });
    }

    // Add user to team
    team.members.push(userId);
    await team.save();

    // Update user's teamId
    await User.findByIdAndUpdate(userId, { teamId: team._id });

    const populatedTeam = await Team.findById(team._id).populate('members', 'username email');

    res.json({ team: populatedTeam });
  } catch (error) {
    console.error('Join team error:', error);
    res.status(500).json({ error: 'Failed to join team' });
  }
});

// Leave team
router.post('/:id/leave', async (req, res) => {
  try {
    const teamId = req.params.id;
    const userId = req.user._id;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user is a member
    if (!team.members.includes(userId)) {
      return res.status(400).json({ error: 'You are not a member of this team' });
    }

    // Remove user from team
    team.members = team.members.filter(memberId => !memberId.equals(userId));
    await team.save();

    // Update user's teamId
    await User.findByIdAndUpdate(userId, { teamId: null });

    // If team has no members, we could archive it (optional)
    if (team.members.length === 0) {
      // Optionally delete or archive the team
      // await Team.findByIdAndDelete(teamId);
    }

    res.json({ message: 'Left team successfully' });
  } catch (error) {
    console.error('Leave team error:', error);
    res.status(500).json({ error: 'Failed to leave team' });
  }
});

// Get team details
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members', 'username email')
      .select('-__v');

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({ team });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ error: 'Failed to get team' });
  }
});

// Get all teams (for leaderboard)
router.get('/', async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('members', 'username')
      .select('name score members createdAt')
      .sort({ score: -1, createdAt: 1 })
      .limit(100);

    res.json({ teams });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ error: 'Failed to get teams' });
  }
});

export default router;

