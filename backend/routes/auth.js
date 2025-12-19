import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authRateLimit } from '../middleware/rateLimit.js';

const router = express.Router();

// Register
router.post('/register', authRateLimit, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Use JWT secrets from env or defaults for development
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-in-production';
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production';

    // Normalize email to lowercase (matching schema)
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email exists (username can be duplicate)
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with normalized email
    const user = await User.create({
      username: username.trim(),
      email: normalizedEmail,
      passwordHash
    });

    // Generate tokens with hidden flag in JWT (development only)
    const tokenPayload = { userId: user._id };
    if (process.env.NODE_ENV === 'development') {
      tokenPayload.flag = 'FLAG{jwt_recon}';
    }
    
    const accessToken = jwt.sign(
      tokenPayload,
      jwtSecret,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      tokenPayload,
      jwtRefreshSecret,
      { expiresIn: '7d' }
    );

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        teamId: user.teamId
      },
      accessToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    if (error.code === 11000) {
      // Duplicate key error (email already exists)
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return res.status(500).json({ error: 'Database error. Please try again later.' });
    }
    
    // Generic error with more details in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `Registration failed: ${error.message}` 
      : 'Registration failed. Please try again.';
    
    res.status(500).json({ error: errorMessage });
  }
});

// Login
router.post('/login', authRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Use JWT secrets from env or defaults for development
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-in-production';
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production';

    // Normalize email to lowercase (matching schema)
    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email (case-insensitive)
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log(`Login attempt failed: User not found for email ${normalizedEmail}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user has a password (OAuth users don't have passwordHash)
    if (!user.passwordHash) {
      console.log(`Login attempt failed: User ${normalizedEmail} has no password (OAuth account)`);
      return res.status(401).json({ 
        error: 'This account was created with social login. Please use Google or Apple sign in.' 
      });
    }

    // Verify password
    let isValid = false;
    try {
      isValid = await bcrypt.compare(password, user.passwordHash);
    } catch (bcryptError) {
      console.error('Bcrypt comparison error:', bcryptError);
      return res.status(500).json({ error: 'Login failed. Please try again.' });
    }

    if (!isValid) {
      console.log(`Login attempt failed: Invalid password for email ${normalizedEmail}`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log(`Login successful for user: ${user.username} (${user.email})`);

    // Generate tokens with hidden flag in JWT (development only)
    const tokenPayload = { userId: user._id };
    if (process.env.NODE_ENV === 'development') {
      tokenPayload.flag = 'FLAG{jwt_recon}';
    }
    
    const accessToken = jwt.sign(
      tokenPayload,
      jwtSecret,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      tokenPayload,
      jwtRefreshSecret,
      { expiresIn: '7d' }
    );

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Hidden flag in API response (harmless, only visible in dev tools)
    const response = {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        teamId: user.teamId
      },
      accessToken
    };

    // Add hidden flag hint (only visible in network tab)
    if (process.env.NODE_ENV === 'development') {
      response.flag_hint = "FLAG{inspect_network_requests}";
    }

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    // Provide more specific error messages
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return res.status(500).json({ error: 'Database error. Please try again later.' });
    }
    if (error.message && error.message.includes('JWT')) {
      return res.status(500).json({ error: 'Server configuration error' });
    }
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    // Use JWT secrets from env or defaults for development
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-in-production';
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production';

    const decoded = jwt.verify(refreshToken, jwtRefreshSecret);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const accessToken = jwt.sign(
      { userId: user._id },
      jwtSecret,
      { expiresIn: '15m' }
    );

    res.json({ accessToken });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.accessToken;
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Use JWT secret from env or default for development
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-in-production';
    
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findById(decoded.userId)
      .select('-passwordHash')
      .populate('teamId', 'name score members');

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;

