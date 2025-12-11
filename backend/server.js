import express from 'express';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import os from 'os';
import authRoutes from './routes/auth.js';
import oauthRoutes from './routes/oauth.js';
import teamRoutes from './routes/teams.js';
import challengeRoutes from './routes/challenges.js';
import submissionRoutes from './routes/submissions.js';
import adminRoutes from './routes/admin.js';
import blogRoutes from './routes/blogs.js';
import commentRoutes from './routes/comments.js';
import reviewRoutes from './routes/reviews.js';
import newsRoutes from './routes/news.js';
import hiddenFlagsRoutes from './routes/hiddenFlags.js';
import { initializeSocketIO } from './socket/socket.js';
import { setupNewsScheduler } from './services/newsScheduler.js';
import { initializeHiddenFlags } from './scripts/initializeHiddenFlags.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
// Allow CORS from configured frontend URL only (production)
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : [];

// Support multiple frontend URLs (comma-separated)
// Only allow production URLs, no localhost or local network IPs

// CORS configuration for production
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // Normalize origin (remove trailing slash)
    const normalizedOrigin = origin.replace(/\/$/, '');
    const normalizedAllowed = allowedOrigins.map(url => url.replace(/\/$/, ''));

    // Only allow exact match from FRONTEND_URL environment variable
    if (normalizedAllowed.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}. Allowed: ${allowedOrigins.join(', ') || 'None configured'}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

const io = new Server(httpServer, {
  cors: corsOptions
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Database connection with improved options
const connectDB = async () => {
  // In production, MONGODB_URI must be set
  let MONGODB_URI = process.env.MONGODB_URI;
  
  // Development fallback only
  if (!MONGODB_URI && process.env.NODE_ENV !== 'production') {
    MONGODB_URI = 'mongodb://localhost:27017/ctf';
  }
  
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is required in production!');
    process.exit(1);
  }

  try {
    // Try connecting to the provided URI first
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      w: 'majority'
    });
    console.log('✅ Connected to MongoDB');
    console.log(`   Database: ${mongoose.connection.name}`);
  } catch (err) {
    console.warn('⚠️  Could not connect to primary MongoDB:', err.message);
    console.log('🔄 Attempting to start in-memory database...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();

      await mongoose.connect(uri, {
        dbName: 'ctf'
      });

      console.log('✅ Connected to In-Memory MongoDB');
      console.log(`   URI: ${uri}`);
      console.log('   ⚠️  NOTE: Data will be lost when server stops');
    } catch (memoryErr) {
      console.error('❌ Failed to start in-memory database:', memoryErr.message);
      process.exit(1);
    }
  }
};

connectDB();

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/challenges', submissionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/hidden-flags', hiddenFlagsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'CTF Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      challenges: '/api/challenges',
      teams: '/api/teams'
    }
  });
});

// Initialize Socket.IO
initializeSocketIO(io);

// Make io available globally for routes
global.io = io;

// Wait for MongoDB connection before initializing services
mongoose.connection.once('open', async () => {
  try {
    // Setup news feed scheduler
    setupNewsScheduler();
    console.log('✅ News feed scheduler initialized');

    // Initialize hidden flags in database
    await initializeHiddenFlags();
    console.log('✅ Hidden flags system initialized');
  } catch (error) {
    console.error('Error initializing services:', error);
  }
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all network interfaces

// Log environment info for debugging
if (process.env.NODE_ENV === 'production') {
  console.log('\n📋 Environment Configuration:');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   PORT: ${PORT}`);
  console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? 'Set' : 'NOT SET ⚠️'}`);
  console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'NOT SET ⚠️'}`);
  console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? 'Set' : 'NOT SET ⚠️'}`);
  console.log(`   JWT_REFRESH_SECRET: ${process.env.JWT_REFRESH_SECRET ? 'Set' : 'NOT SET ⚠️'}`);
}

httpServer.listen(PORT, HOST, () => {
  if (process.env.NODE_ENV === 'production') {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV}`);
    console.log(`   Frontend URL: ${process.env.FRONTEND_URL || 'NOT CONFIGURED ⚠️'}`);
  } else {
    const serverUrl = HOST === '0.0.0.0' ? 'localhost' : HOST;
    console.log(`\n🚀 Server running on http://${serverUrl}:${PORT}`);
    console.log('Server is accessible on your local network!');

    // Display network IP addresses (development only)
    if (HOST === '0.0.0.0') {
      const networkInterfaces = os.networkInterfaces();
      console.log('\n📡 Network Access Information:');
      let found = false;
      Object.keys(networkInterfaces).forEach((interfaceName) => {
        networkInterfaces[interfaceName].forEach((iface) => {
          if (iface.family === 'IPv4' && !iface.internal) {
            found = true;
            console.log(`   Interface: ${interfaceName}`);
            console.log(`   Backend:  http://${iface.address}:${PORT}`);
            console.log(`   Frontend: http://${iface.address}:5173`);
            console.log('');
          }
        });
      });
      if (found) {
        console.log('💡 Share these URLs with others on your WiFi network!\n');
      }
    }
  }
});

export { io };

