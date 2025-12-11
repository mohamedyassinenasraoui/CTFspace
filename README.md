# CTF Platform

A full-stack Capture The Flag (CTF) platform built with React, Express, MongoDB, and Socket.IO.

## Features

- **User Authentication**: JWT-based authentication with refresh tokens
- **Team Management**: Create and join teams (max 5 members)
- **Challenge System**: Create, manage, and solve CTF challenges
- **Real-time Leaderboard**: Live updates using Socket.IO
- **Secure Flag Verification**: HMAC-SHA256 hashing with constant-time comparison
- **Rate Limiting**: Protection against brute-force attacks
- **Admin Panel**: Full challenge and submission management
- **Tutorials Section**: Educational content about cybersecurity
- **Responsive UI**: Modern, dark-themed interface

## Tech Stack

### Frontend
- React 18
- Vite
- React Router
- Socket.IO Client
- Axios

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- JWT Authentication
- bcryptjs for password hashing
- express-rate-limit

## Project Structure

```
ctf/
├── backend/
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Auth, rate limiting
│   ├── utils/           # Flag verification, etc.
│   ├── socket/          # Socket.IO handlers
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # Auth context
│   │   ├── pages/       # Page components
│   │   └── App.jsx
│   └── vite.config.js
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Docker (optional, for containerized deployment)

### Local Development

1. **Clone and install dependencies:**

```bash
npm run install-all
```

2. **Set up environment variables:**

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ctf
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

3. **Start MongoDB:**

Make sure MongoDB is running on `localhost:27017` or update `MONGODB_URI`.

4. **Run the application:**

```bash
npm run dev
```

This will start both backend (port 5000) and frontend (port 5173).

### Docker Deployment

1. **Build and start all services:**

```bash
docker-compose up -d
```

2. **View logs:**

```bash
docker-compose logs -f
```

3. **Stop services:**

```bash
docker-compose down
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Teams
- `POST /api/teams` - Create team
- `POST /api/teams/:id/join` - Join team
- `POST /api/teams/:id/leave` - Leave team
- `GET /api/teams/:id` - Get team details
- `GET /api/teams` - Get all teams (leaderboard)

### Challenges
- `GET /api/challenges` - List visible challenges
- `GET /api/challenges/:id` - Get challenge details
- `POST /api/challenges/:id/submit` - Submit flag
- `GET /api/challenges/:id/submissions` - Get user's submissions

### Admin
- `POST /api/admin/challenges` - Create challenge
- `PATCH /api/admin/challenges/:id` - Update challenge
- `GET /api/admin/challenges` - Get all challenges
- `GET /api/admin/submissions` - Get all submissions
- `GET /api/admin/teams` - Get all teams

## Security Features

1. **Flag Hashing**: Flags are hashed using HMAC-SHA256 with unique salts
2. **Constant-Time Comparison**: Prevents timing attacks
3. **Rate Limiting**: 
   - 10 submissions per minute per IP
   - 5 auth attempts per 15 minutes
4. **JWT Tokens**: Access tokens (15min) + refresh tokens (7 days, httpOnly cookies)
5. **Input Validation**: Server-side validation on all endpoints
6. **No Raw Flag Storage**: Flags are never stored in plaintext

## Creating Your First Admin User

To create an admin user, you can use MongoDB shell or a script:

```javascript
// In MongoDB shell or Node script
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Or register a user normally, then update their role in the database.

## Creating Challenges

1. Log in as an admin user
2. Navigate to the Admin Panel
3. Click "Create New Challenge"
4. Fill in the challenge details:
   - Title, description, category
   - Points and difficulty
   - Flag (will be hashed automatically)
   - Toggle visibility when ready

## Team Rules

- Maximum 5 members per team
- Users can only be in one team at a time
- Team score is the sum of all solved challenges
- Only first correct submission per team counts

## Scoring System

Default point values:
- Easy: 100 points
- Medium: 300 points
- Hard: 700 points

Points are configurable per challenge in the admin panel.

## Real-time Features

- **Leaderboard Updates**: Automatically updates when teams solve challenges
- **Team Chat**: Socket.IO rooms for team communication (can be extended)

## Tutorials & Learning

The platform includes a tutorials section with:
- Networking basics
- Web application security concepts
- Secure coding practices
- Links to legal practice platforms (TryHackMe, HackTheBox)
- Guidelines for setting up local practice labs

## Production Deployment

### Environment Variables

Set secure values for:
- `JWT_SECRET` and `JWT_REFRESH_SECRET` (use strong random strings)
- `MONGODB_URI` (use MongoDB Atlas or secure connection string)
- `NODE_ENV=production`
- `FRONTEND_URL` (your production frontend URL)

### Security Checklist

- [ ] Change all default secrets
- [ ] Use HTTPS (reverse proxy like Nginx or Traefik)
- [ ] Enable MongoDB authentication
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting appropriately
- [ ] Set up monitoring and logging
- [ ] Regular security updates
- [ ] Backup database regularly

### Reverse Proxy Example (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## License

This project is provided as-is for educational purposes.

## Contributing

Feel free to submit issues and enhancement requests!

## Support

For issues or questions, please open an issue on the repository.

