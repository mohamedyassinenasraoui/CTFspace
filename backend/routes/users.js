import express from 'express';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get user profile by ID
router.get('/:userId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId)
            .select('-passwordHash -__v')
            .populate('teamId', 'name score');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

export default router;
