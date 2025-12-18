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
import { initializeSocketIO } from './socket/socket.js';
import { setupNewsScheduler } from './services/newsScheduler.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
// Allow CORS from localhost and local network IPs
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173'];

// Add dynamic origin checking for local network
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // Allow localhost and local network IPs
    if (allowedOrigins.includes(origin) ||
      origin.startsWith('http://192.168.') ||
      origin.startsWith('http://10.') ||
      origin.startsWith('http://172.16.') ||
      origin.startsWith('http://172.17.') ||
      origin.startsWith('http://172.18.') ||
      origin.startsWith('http://172.19.') ||
      origin.startsWith('http://172.20.') ||
      origin.startsWith('http://172.21.') ||
      origin.startsWith('http://172.22.') ||
      origin.startsWith('http://172.23.') ||
      origin.startsWith('http://172.24.') ||
      origin.startsWith('http://172.25.') ||
      origin.startsWith('http://172.26.') ||
      origin.startsWith('http://172.27.') ||
      origin.startsWith('http://172.28.') ||
      origin.startsWith('http://172.29.') ||
      origin.startsWith('http://172.30.') ||
      origin.startsWith('http://172.31.')) {
      callback(null, true);
    } else {
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

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ctf')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Initialize Socket.IO
initializeSocketIO(io);

// Make io available globally for routes
global.io = io;

// Setup news feed scheduler
setupNewsScheduler();

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all network interfaces

httpServer.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log('Server is accessible on your local network!');
  console.log('News feed scheduler initialized');

  // Display network IP addresses
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
});

export { io };

