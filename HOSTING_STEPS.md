# How to Host Your CTF Platform - Complete Step-by-Step Guide

Follow these steps to get your platform live in 10 minutes!

---

## 🚀 Method 1: Render (Easiest - Recommended)

### Part A: Set Up MongoDB Database (3 minutes)

1. **Create MongoDB Atlas Account**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Click "Try Free" → Sign up with email or Google
   - Verify your email

2. **Create Free Cluster**
   - Click "Build a Database"
   - Choose "FREE" (M0) tier
   - Select a cloud provider (AWS recommended)
   - Choose a region close to you
   - Click "Create"

3. **Create Database User**
   - Username: `ctfadmin` (or any username)
   - Password: Click "Autogenerate Secure Password" → **COPY THE PASSWORD** (you'll need it!)
   - Click "Create Database User"

4. **Set Network Access**
   - Click "Network Access" in left menu
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**
   - Click "Database" in left menu
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
   - Replace `<username>` with your database username
   - Replace `<password>` with your database password
   - Add `/ctf` before the `?` to specify database name
   - **Final string should look like**: `mongodb+srv://ctfadmin:YourPassword123@cluster0.xxxxx.mongodb.net/ctf?retryWrites=true&w=majority`
   - **SAVE THIS STRING** - you'll need it in the next step!

---

### Part B: Deploy Backend (3 minutes)

1. **Sign Up for Render**
   - Go to: https://dashboard.render.com
   - Click "Get Started for Free"
   - Sign up with your **GitHub account** (recommended)

2. **Create Backend Service**
   - Click "New +" button (top right)
   - Select "Web Service"
   - Click "Connect account" if prompted to connect GitHub
   - Find and select your repository: `mohamedyassinenasraoui/CTFspace`
   - Click "Connect"

3. **Configure Backend**
   - **Name**: `ctf-backend` (or any name you like)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend` ⚠️ **IMPORTANT!**
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable" for each:
   
   ```
   NODE_ENV = production
   ```
   
   ```
   PORT = 5000
   ```
   
   ```
   MONGODB_URI = [Paste your MongoDB connection string from Part A]
   ```
   
   ```
   JWT_SECRET = [Generate a random string - see below]
   ```
   
   ```
   JWT_REFRESH_SECRET = [Generate another random string]
   ```
   
   ```
   FRONTEND_URL = https://ctf-frontend.onrender.com
   ```
   (We'll update this after frontend deploys)

5. **Deploy**
   - Click "Create Web Service"
   - Wait 3-5 minutes for deployment
   - **Copy your backend URL** (e.g., `https://ctf-backend.onrender.com`)
   - Save this URL!

---

### Part C: Deploy Frontend (2 minutes)

1. **Create Frontend Service**
   - In Render dashboard, click "New +"
   - Select "Static Site"
   - Connect the same repository: `mohamedyassinenasraoui/CTFspace`

2. **Configure Frontend**
   - **Name**: `ctf-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend` ⚠️ **IMPORTANT!**
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist` ⚠️ **IMPORTANT!**

3. **Add Environment Variable**
   - Click "Advanced" → "Add Environment Variable"
   - Key: `VITE_API_URL`
   - Value: `[Your backend URL from Part B]` (e.g., `https://ctf-backend.onrender.com`)

4. **Deploy**
   - Click "Create Static Site"
   - Wait 2-3 minutes for deployment
   - **Copy your frontend URL** (e.g., `https://ctf-frontend.onrender.com`)
   - Save this URL!

---

### Part D: Connect Frontend and Backend (1 minute)

1. **Update Backend CORS**
   - Go back to your backend service in Render
   - Click "Environment" tab
   - Find `FRONTEND_URL` variable
   - Click the edit icon (pencil)
   - Update value to your frontend URL (e.g., `https://ctf-frontend.onrender.com`)
   - Click "Save Changes"
   - Render will automatically redeploy

2. **Wait for Redeploy**
   - Check the "Events" tab to see deployment progress
   - Wait until it says "Live"

---

### Part E: Create Admin User (1 minute)

1. **Register a User**
   - Visit your frontend URL
   - Click "Register"
   - Create an account (remember your email/password!)

2. **Make User Admin**
   - Go back to MongoDB Atlas
   - Click "Browse Collections"
   - Click on `ctf` database (if not visible, click "Load Sample Data" first, then refresh)
   - Click on `users` collection
   - Find your registered user (by email)
   - Click on the document
   - Click "Edit Document"
   - Find the `role` field
   - Change value from `"user"` to `"admin"` (with quotes)
   - Click "Update"
   - Click "Confirm"

3. **Test Admin Access**
   - Go back to your frontend
   - Log out and log back in
   - You should see "Admin" link in the navbar!

---

## ✅ You're Done!

Visit your frontend URL and your CTF Platform is live! 🎉

**Your URLs:**
- Frontend: `https://ctf-frontend.onrender.com`
- Backend API: `https://ctf-backend.onrender.com`

---

## 🔐 Generate Secure Secrets

You need to generate random strings for `JWT_SECRET` and `JWT_REFRESH_SECRET`.

### Option 1: Online Generator
- Go to: https://www.random.org/strings/
- Generate 2 strings:
  - Length: 32
  - Characters: All
  - Click "Get Strings"
  - Use one for `JWT_SECRET`, one for `JWT_REFRESH_SECRET`

### Option 2: PowerShell (Windows)
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```
Run this twice to get two different secrets.

### Option 3: Command Line (Mac/Linux)
```bash
openssl rand -hex 32
```
Run this twice to get two different secrets.

---

## 🐛 Troubleshooting

### Backend won't start
- ✅ Check all environment variables are set correctly
- ✅ Verify MongoDB connection string format
- ✅ Check Render logs: Click service → "Logs" tab
- ✅ Make sure Root Directory is `backend`

### Frontend can't connect to backend
- ✅ Verify `VITE_API_URL` matches backend URL exactly
- ✅ Check `FRONTEND_URL` in backend matches frontend URL
- ✅ Wait a few minutes for services to fully start
- ✅ Check browser console for errors (F12)

### Database connection errors
- ✅ Verify MongoDB connection string includes `/ctf` database name
- ✅ Check username and password are correct (no `<` or `>` brackets)
- ✅ Verify Network Access allows 0.0.0.0/0 in MongoDB Atlas
- ✅ Make sure MongoDB cluster is running (not paused)

### Build fails
- ✅ Check Root Directory is correct (`backend` or `frontend`)
- ✅ Verify Build Command is correct
- ✅ Check Render logs for specific error messages
- ✅ Make sure all code is pushed to GitHub

---

## 📋 Quick Checklist

Before you start:
- [ ] GitHub repository is public (or Render has access)
- [ ] You have a GitHub account
- [ ] You have an email address

During setup:
- [ ] MongoDB Atlas account created
- [ ] MongoDB cluster created and running
- [ ] Database user created (username + password saved)
- [ ] Network access set to 0.0.0.0/0
- [ ] Connection string copied and formatted correctly
- [ ] Render account created
- [ ] Backend service created with correct settings
- [ ] All backend environment variables added
- [ ] Frontend service created with correct settings
- [ ] Frontend environment variable added
- [ ] Backend CORS updated with frontend URL
- [ ] User registered on frontend
- [ ] User role set to admin in MongoDB

After deployment:
- [ ] Frontend loads correctly
- [ ] Can register new users
- [ ] Can login
- [ ] Admin panel accessible (if admin user)
- [ ] Can create challenges (if admin)

---

## 🎯 Next Steps

1. **Test everything**: Register, login, create challenges
2. **Customize**: Add your own challenges via Admin Panel
3. **Custom Domain** (optional): Add your own domain in Render settings
4. **Invite Users**: Share your frontend URL with others!

---

## 📚 Alternative Methods

If Render doesn't work for you, check:
- **Railway**: See `RAILWAY_DEPLOY.md` for detailed Railway guide
- **VPS**: See `DEPLOYMENT.md` for VPS deployment options
- **Other platforms**: See `DEPLOYMENT.md` for Vercel, etc.

---

## 💡 Pro Tips

1. **Keep secrets safe**: Never share your JWT secrets or MongoDB password
2. **Monitor usage**: Check Render dashboard for service status
3. **Free tier limits**: Render free tier spins down after 15 min inactivity (first request may be slow)
4. **Backups**: MongoDB Atlas free tier has automatic backups
5. **Updates**: Push to GitHub to trigger automatic redeploy on Render

---

**Need help?** Check the logs in Render dashboard or MongoDB Atlas for error messages!

