import Team from '../models/Team.js';

export function initializeSocketIO(io) {
  io.on('connection', async (socket) => {
    console.log('Client connected:', socket.id);

    // Join leaderboard room
    socket.on('join:leaderboard', async () => {
      socket.join('leaderboard');
      
      // Send current leaderboard
      const topTeams = await Team.find()
        .select('name score members')
        .populate('members', 'username')
        .sort({ score: -1 })
        .limit(20);
      
      socket.emit('leaderboard:init', { teams: topTeams });
    });

    // Leave leaderboard room
    socket.on('leave:leaderboard', () => {
      socket.leave('leaderboard');
    });

    // Join team room for team chat
    socket.on('join:team', async (teamId) => {
      socket.join(`team-${teamId}`);
      socket.emit('team:joined', { teamId });
    });

    // Leave team room
    socket.on('leave:team', (teamId) => {
      socket.leave(`team-${teamId}`);
    });

    // Team chat message
    socket.on('team:message', async (data) => {
      const { teamId, message, username } = data;
      
      // Broadcast to all members of the team
      io.to(`team-${teamId}`).emit('team:message', {
        username,
        message,
        timestamp: new Date()
      });
    });

    // Hidden flag in WebSocket message (development only)
    if (process.env.NODE_ENV === 'development') {
      socket.on('get:secret', () => {
        socket.emit('secret:message', {
          opcode: 'FLAG{realtime_recon}',
          message: 'Check WebSocket messages in Network tab'
        });
      });
    }

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Function to broadcast leaderboard updates (called from submission route)
  io.broadcastLeaderboardUpdate = async () => {
    const topTeams = await Team.find()
      .select('name score')
      .sort({ score: -1 })
      .limit(20);
    
    io.to('leaderboard').emit('leaderboard:update', { teams: topTeams });
  };
}

