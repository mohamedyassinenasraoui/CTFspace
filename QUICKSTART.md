# Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB running (local or Atlas)
- npm or yarn

## Setup Steps

### 1. Install Dependencies

```bash
npm run install-all
```

This installs dependencies for root, backend, and frontend.

### 2. Configure Environment Variables

**Backend** - Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ctf
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend** - Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

### 3. Start MongoDB

Make sure MongoDB is running. If using local MongoDB:

```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Linux
sudo systemctl start mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:7
```

### 4. Create Admin User (Optional)

After starting the backend at least once, create an admin user:

```bash
cd backend
npm run create-admin admin@example.com yourpassword
```

Or manually update in MongoDB:

```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### 5. Start the Application

From the root directory:

```bash
npm run dev
```

This starts:
- Backend on http://localhost:5000
- Frontend on http://localhost:5173

### 6. Access the Platform

1. Open http://localhost:5173
2. Register a new account (or login if you created an admin)
3. Create or join a team
4. Start solving challenges!

## Using Docker (Alternative)

If you prefer Docker:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## First Steps After Setup

1. **Register/Login**: Create your account
2. **Create Team**: Go to Dashboard and create a team
3. **Create Challenges** (Admin only):
   - Login as admin
   - Go to Admin Panel
   - Create your first challenge
   - Toggle visibility to make it available
4. **Solve Challenges**: Navigate to Challenges page and start solving!

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `backend/.env`
- For Docker MongoDB: use `mongodb://mongodb:27017/ctf` (in docker-compose)

### Port Already in Use
- Change `PORT` in `backend/.env` or `FRONTEND_URL` port
- Update `vite.config.js` if changing frontend port

### CORS Errors
- Ensure `FRONTEND_URL` in backend matches your frontend URL
- Check that both servers are running

### JWT Errors
- Ensure `JWT_SECRET` and `JWT_REFRESH_SECRET` are set
- Clear browser cookies and login again

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check out the Tutorials section in the app
- Set up production deployment (see README)

