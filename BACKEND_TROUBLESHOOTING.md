# Backend Not Working When Hosted - Troubleshooting Guide

Common issues and solutions for backend deployment problems.

## 🔍 Step 1: Check Your Deployment Logs

**On Render:**
1. Go to your backend service
2. Click "Logs" tab
3. Look for error messages (red text)

**On Railway:**
1. Click on your backend service
2. Click "Deployments" tab
3. Click on the latest deployment
4. View logs

**Common errors you might see:**
- `MongoServerError: Authentication failed`
- `Error: Not allowed by CORS`
- `EADDRINUSE: address already in use`
- `Cannot find module`
- `MongooseError: Operation timed out`

---

## 🐛 Common Issues & Solutions

### Issue 1: MongoDB Connection Failed

**Symptoms:**
- Logs show: `Could not connect to primary MongoDB`
- Server falls back to in-memory database
- Data doesn't persist

**Solution:**

1. **Check MongoDB URI format:**
   ```
   ✅ Correct: mongodb+srv://username:password@cluster.mongodb.net/ctf?retryWrites=true&w=majority
   ❌ Wrong: mongodb+srv://<username>:<password>@cluster.mongodb.net/ctf
   ```
   - Remove `<` and `>` brackets
   - Replace with actual username and password

2. **Verify MongoDB Atlas settings:**
   - Go to MongoDB Atlas → Network Access
   - Make sure `0.0.0.0/0` is whitelisted (or your hosting platform's IP)
   - Go to Database Access → Verify username/password are correct

3. **Check environment variable:**
   - In Render/Railway, go to Environment Variables
   - Verify `MONGODB_URI` is set correctly
   - Make sure there are no extra spaces or quotes

4. **Test connection string:**
   - Copy your `MONGODB_URI` from environment variables
   - Try connecting with MongoDB Compass or online tool
   - If it fails, the connection string is wrong

---

### Issue 2: CORS Errors

**Symptoms:**
- Frontend shows: `CORS policy: No 'Access-Control-Allow-Origin' header`
- Browser console shows CORS errors
- API requests fail

**Solution:**

1. **Check FRONTEND_URL environment variable:**
   - In backend service, go to Environment Variables
   - Verify `FRONTEND_URL` matches your frontend URL **exactly**
   - Must include `https://` (not `http://`)
   - No trailing slash: `https://ctf-frontend.onrender.com` ✅
   - Not: `https://ctf-frontend.onrender.com/` ❌

2. **Update CORS configuration:**
   The backend only allows requests from:
   - The URL in `FRONTEND_URL` environment variable
   - Local network IPs (192.168.x.x, 10.x.x.x, etc.)

3. **For production, update server.js:**
   If you need to allow multiple origins, you can modify the CORS config.

---

### Issue 3: Port Configuration

**Symptoms:**
- Server won't start
- `EADDRINUSE` error
- Connection refused errors

**Solution:**

1. **Use PORT environment variable:**
   - Render/Railway automatically sets `PORT` environment variable
   - Don't hardcode port numbers
   - The server already uses `process.env.PORT || 5000` ✅

2. **Check environment variables:**
   - Make sure `PORT` is not manually set to a fixed value
   - Let the platform assign it automatically
   - Or set `PORT=5000` if your platform requires it

---

### Issue 4: Missing Environment Variables

**Symptoms:**
- Server starts but authentication fails
- JWT errors
- Database connection issues

**Solution:**

**Required environment variables for backend:**

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ctf?retryWrites=true&w=majority
JWT_SECRET=[random 32+ character string]
JWT_REFRESH_SECRET=[different random 32+ character string]
FRONTEND_URL=https://your-frontend-url.onrender.com
```

**Checklist:**
- [ ] All variables are set (no missing ones)
- [ ] No typos in variable names (case-sensitive!)
- [ ] Values don't have extra quotes or spaces
- [ ] `MONGODB_URI` includes `/ctf` database name
- [ ] `FRONTEND_URL` uses `https://` (not `http://`)

---

### Issue 5: Build/Start Command Issues

**Symptoms:**
- Build fails
- "Command not found" errors
- Module not found errors

**Solution:**

**For Render:**
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**For Railway:**
- **Root Directory**: `backend`
- **Start Command**: `npm start` (build is automatic)

**Verify package.json:**
- Make sure `"start": "node server.js"` exists in `backend/package.json`
- All dependencies are listed in `package.json`

---

### Issue 6: Server Crashes on Startup

**Symptoms:**
- Server starts then immediately stops
- Deployment shows "Failed" status
- Logs show error then exit

**Solution:**

1. **Check for missing dependencies:**
   - Look at logs for "Cannot find module" errors
   - Make sure all imports in `server.js` have corresponding packages in `package.json`

2. **Check for syntax errors:**
   - Test locally: `cd backend && npm start`
   - Fix any errors before deploying

3. **Check MongoDB connection:**
   - If MongoDB connection fails and in-memory DB also fails, server will exit
   - Fix MongoDB connection (see Issue 1)

4. **Check for async/await errors:**
   - Look for unhandled promise rejections in logs
   - Make sure all async operations have error handling

---

## 🔧 Quick Fixes

### Fix 1: Update CORS for Production

If CORS is blocking requests, you can temporarily allow all origins (for testing):

**In `backend/server.js`, find line 29-31:**
```javascript
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173'];
```

**Change to (temporary, for testing only):**
```javascript
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173', 'https://your-frontend-url.onrender.com'];
```

Or allow all origins (NOT recommended for production):
```javascript
const corsOptions = {
  origin: true, // Allow all origins (for testing only!)
  credentials: true
};
```

**Remember to revert this after testing!**

---

### Fix 2: Add Better Error Logging

Add this to see what's happening:

**In `backend/server.js`, after line 24:**
```javascript
console.log('Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set (hidden)' : 'NOT SET');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'NOT SET');
```

This will help you see what environment variables are actually set.

---

### Fix 3: Test MongoDB Connection

Create a test script to verify MongoDB connection:

**Create `backend/test-mongo.js`:**
```javascript
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ctf';

console.log('Testing MongoDB connection...');
console.log('URI:', MONGODB_URI.replace(/:[^:@]+@/, ':****@')); // Hide password

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
```

Run it locally:
```bash
cd backend
node test-mongo.js
```

---

## 📋 Diagnostic Checklist

Run through this checklist:

- [ ] **MongoDB Atlas:**
  - [ ] Cluster is running (not paused)
  - [ ] Network Access allows `0.0.0.0/0`
  - [ ] Database user exists and password is correct
  - [ ] Connection string is correct format

- [ ] **Environment Variables:**
  - [ ] `NODE_ENV=production`
  - [ ] `PORT` is set (or platform auto-assigns)
  - [ ] `MONGODB_URI` is correct and includes `/ctf`
  - [ ] `JWT_SECRET` is set (random string)
  - [ ] `JWT_REFRESH_SECRET` is set (different random string)
  - [ ] `FRONTEND_URL` matches frontend URL exactly (with `https://`)

- [ ] **Deployment Settings:**
  - [ ] Root Directory is `backend`
  - [ ] Build Command is `npm install`
  - [ ] Start Command is `npm start`
  - [ ] All code is pushed to GitHub

- [ ] **Code:**
  - [ ] `backend/package.json` has all dependencies
  - [ ] `backend/server.js` has no syntax errors
  - [ ] Server starts locally: `cd backend && npm start`

---

## 🆘 Still Not Working?

1. **Share your logs:**
   - Copy the error messages from deployment logs
   - Look for the first error (usually the root cause)

2. **Test locally:**
   - Create `.env` file in `backend/` with same variables
   - Run `npm start` locally
   - See if same error occurs

3. **Check platform status:**
   - Render: https://status.render.com
   - Railway: https://status.railway.app
   - MongoDB Atlas: https://status.mongodb.com

4. **Common mistakes:**
   - Forgot to add `/ctf` to MongoDB URI
   - Used `http://` instead of `https://` in FRONTEND_URL
   - Extra spaces in environment variable values
   - Wrong root directory (should be `backend`, not root)

---

## ✅ Success Indicators

Your backend is working if:
- ✅ Deployment shows "Live" status
- ✅ Logs show: `✅ Connected to MongoDB`
- ✅ Logs show: `🚀 Server running on...`
- ✅ You can access: `https://your-backend-url.onrender.com/api/auth/register` (should return JSON, not error)
- ✅ Frontend can make API calls without CORS errors

---

## 🔄 After Fixing

1. **Redeploy:**
   - Render: Changes auto-deploy, or click "Manual Deploy"
   - Railway: Push to GitHub or click "Redeploy"

2. **Test:**
   - Visit backend URL in browser
   - Try API endpoint: `https://your-backend-url/api/challenges`
   - Should return JSON (even if empty array)

3. **Update frontend:**
   - Make sure `VITE_API_URL` in frontend matches backend URL

---

**Need more help?** Share your deployment logs and I can help diagnose the specific issue!

