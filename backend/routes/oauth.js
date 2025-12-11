import express from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import User from '../models/User.js';
import { authRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// Google OAuth callback
router.post('/google', authRateLimit, async (req, res) => {
  try {
    const { accessToken: googleToken } = req.body;

    if (!googleToken) {
      return res.status(400).json({ error: 'Google token required' });
    }

    // Verify token with Google
    const googleResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${googleToken}` }
    });

    const { id, email, name, picture } = googleResponse.data;

    if (!email) {
      return res.status(400).json({ error: 'Email not provided by Google' });
    }

    // Find or create user
    let user = await User.findOne({ 
      $or: [
        { email },
        { providerId: id, authProvider: 'google' }
      ]
    });

    if (user) {
      // Update user if needed
      if (!user.providerId) {
        user.providerId = id;
        user.authProvider = 'google';
        user.avatar = picture;
        if (!user.username && name) {
          user.username = name;
        }
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        email,
        username: name || email.split('@')[0],
        authProvider: 'google',
        providerId: id,
        avatar: picture,
        passwordHash: null // OAuth users don't need password
      });
    }

    // Generate JWT tokens with hidden flag (development only)
    const tokenPayload = { userId: user._id };
    if (process.env.NODE_ENV === 'development') {
      tokenPayload.flag = 'FLAG{jwt_recon}';
    }
    
    const accessToken = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      tokenPayload,
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
        avatar: user.avatar
      },
      accessToken
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// Apple Sign In callback
router.post('/apple', authRateLimit, async (req, res) => {
  try {
    const { identityToken, user: appleUser } = req.body;

    if (!identityToken) {
      return res.status(400).json({ error: 'Apple identity token required' });
    }

    // In production, verify the JWT token with Apple's public keys
    // For now, we'll decode it (you should verify the signature in production)
    let decoded;
    try {
      // Decode without verification (for development)
      // In production, use jsonwebtoken with Apple's public keys
      const base64Url = identityToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      decoded = JSON.parse(Buffer.from(base64, 'base64').toString());
    } catch (error) {
      return res.status(400).json({ error: 'Invalid Apple token' });
    }

    const email = decoded.email || appleUser?.email;
    const appleId = decoded.sub;

    if (!email || !appleId) {
      return res.status(400).json({ error: 'Email or Apple ID not provided' });
    }

    // Find or create user
    let user = await User.findOne({
      $or: [
        { email },
        { providerId: appleId, authProvider: 'apple' }
      ]
    });

    const username = appleUser?.name?.firstName || email.split('@')[0];

    if (user) {
      // Update user if needed
      if (!user.providerId) {
        user.providerId = appleId;
        user.authProvider = 'apple';
        if (!user.username && username) {
          user.username = username;
        }
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        email,
        username: username,
        authProvider: 'apple',
        providerId: appleId,
        passwordHash: null
      });
    }

    // Generate JWT tokens with hidden flag (development only)
    const tokenPayload = { userId: user._id };
    if (process.env.NODE_ENV === 'development') {
      tokenPayload.flag = 'FLAG{jwt_recon}';
    }
    
    const accessToken = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      tokenPayload,
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
        avatar: user.avatar
      },
      accessToken
    });
  } catch (error) {
    console.error('Apple OAuth error:', error);
    res.status(500).json({ error: 'Apple authentication failed' });
  }
});

export default router;

