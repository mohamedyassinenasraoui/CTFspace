import express from 'express';
import Challenge from '../models/Challenge.js';
import Submission from '../models/Submission.js';
import Team from '../models/Team.js';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';
import { submissionRateLimit } from '../middleware/rateLimit.js';
import { verifyFlag } from '../utils/flagVerification.js';

const router = express.Router();

// Submit flag
router.post('/:id/submit', authMiddleware, submissionRateLimit, async (req, res) => {
  try {
    const { flag } = req.body;
    const challengeId = req.params.id;
    const userId = req.user._id;

    if (!flag || typeof flag !== 'string') {
      return res.status(400).json({ error: 'Flag is required' });
    }

    // Check if user is in a team
    if (!req.user.teamId) {
      return res.status(400).json({ error: 'You must be in a team to submit flags' });
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge || !challenge.visible) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    const team = await Team.findById(req.user.teamId);
    if (!team) {
      return res.status(400).json({ error: 'Team not found' });
    }

    // Check if team already solved this challenge
    const alreadySolved = await Submission.findOne({
      teamId: team._id,
      challengeId: challenge._id,
      correct: true
    });

    if (alreadySolved) {
      return res.json({ 
        correct: true, 
        message: 'Challenge already solved by your team',
        pointsAwarded: 0
      });
    }

    // Verify flag - handle both regular (hashed) and hidden (plain) challenges
    let isCorrect = false;
    if (challenge.challengeType === 'hidden' && challenge.flag) {
      // For hidden flags, compare plain text
      isCorrect = flag.trim() === challenge.flag.trim();
    } else if (challenge.flagHash && challenge.flagSalt) {
      // For regular challenges, verify hash
      isCorrect = verifyFlag(flag.trim(), challenge.flagHash, challenge.flagSalt);
    } else {
      return res.status(400).json({ error: 'Challenge configuration error' });
    }

    // Create submission record (redact flag in stored version)
    const submission = await Submission.create({
      userId,
      teamId: team._id,
      challengeId: challenge._id,
      flagProvided: 'REDACTED', // Never store raw flags
      correct: isCorrect,
      pointsAwarded: 0
    });

    if (isCorrect) {
      // Award points
      const points = challenge.points;
      
      // Use atomic update to prevent race conditions
      await Team.findByIdAndUpdate(team._id, { 
        $inc: { score: points } 
      });

      // Update submission with points
      submission.pointsAwarded = points;
      await submission.save();

      // Increment solved count
      await Challenge.findByIdAndUpdate(challengeId, {
        $inc: { solvedCount: 1 }
      });

      // Emit leaderboard update via Socket.IO
      if (global.io) {
        const topTeams = await Team.find()
          .select('name score')
          .sort({ score: -1 })
          .limit(20);
        
        global.io.to('leaderboard').emit('leaderboard:update', { teams: topTeams });
      }

      return res.json({ 
        correct: true, 
        message: 'Correct flag!',
        pointsAwarded: points
      });
    } else {
      return res.json({ 
        correct: false, 
        message: 'Incorrect flag'
      });
    }
  } catch (error) {
    console.error('Submit flag error:', error);
    res.status(500).json({ error: 'Failed to submit flag' });
  }
});

// Get user's submissions for a challenge
router.get('/:id/submissions', authMiddleware, async (req, res) => {
  try {
    const challengeId = req.params.id;
    const userId = req.user._id;

    if (!req.user.teamId) {
      return res.json({ submissions: [] });
    }

    const submissions = await Submission.find({
      teamId: req.user.teamId,
      challengeId
    })
      .select('correct pointsAwarded createdAt')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ submissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Failed to get submissions' });
  }
});

export default router;

