# Environment Setup Guide

## Backend .env File

Create a file named `.env` in the `backend/` directory with the following content:

```env
# MongoDB Connection
# Use mongodb://localhost:27017/ctf for local MongoDB
# Or use MongoDB Atlas connection string: mongodb+srv://username:password@cluster.mongodb.net/ctf
MONGODB_URI=mongodb://localhost:27017/ctf

# Server Configuration
PORT=5000
HOST=0.0.0.0
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# JWT Secrets (change these in production!)
JWT_SECRET=change-this-secret-in-production-use-a-random-string
JWT_REFRESH_SECRET=change-this-refresh-secret-in-production-use-a-random-string

# Google OAuth (optional)
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret

# Apple OAuth (optional)
# APPLE_CLIENT_ID=your-apple-client-id
# APPLE_TEAM_ID=your-apple-team-id
# APPLE_KEY_ID=your-apple-key-id
# APPLE_PRIVATE_KEY=your-apple-private-key
```

## Frontend .env File (Optional)

If you want to customize the API URL, create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000
```

## Quick Setup

1. **Create backend/.env file:**
   - Copy the content above
   - Save it as `backend/.env`

2. **Make sure MongoDB is running:**
   - Local MongoDB: `mongodb://localhost:27017/ctf`
   - Or use MongoDB Atlas and update `MONGODB_URI` in `.env`

3. **Start the servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

4. **Open your browser:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api/health

## Notes

- The backend will use `mongodb://localhost:27017/ctf` by default if no `.env` file exists
- Make sure MongoDB is installed and running on your system
- For production, change the JWT secrets to strong random strings

