# Quick Deploy Guide - Render (5 Minutes)

The fastest way to get your CTF Platform live!

## Step 1: MongoDB Atlas (2 minutes)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free account → Create free cluster (M0)
3. Click "Connect" → "Connect your application"
4. Copy the connection string (looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
5. Replace `<username>` and `<password>` with your database user credentials
6. Add database name: `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/ctf?retryWrites=true&w=majority`
7. Click "Network Access" → "Add IP Address" → "Allow Access from Anywhere" (0.0.0.0/0)

## Step 2: Deploy Backend (2 minutes)

1. Go to https://dashboard.render.com → Sign up with GitHub
2. Click "New +" → "Web Service"
3. Connect your repository: `mohamedyassinenasraoui/CTFspace`
4. Settings:
   - **Name**: `ctf-backend`
   - **Root Directory**: `backend` (important!)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Environment Variables (click "Add Environment Variable"):
   ```
   NODE_ENV = production
   PORT = 5000
   MONGODB_URI = mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/ctf?retryWrites=true&w=majority
   JWT_SECRET = [Generate random string - use: openssl rand -hex 32]
   JWT_REFRESH_SECRET = [Generate another random string]
   FRONTEND_URL = https://ctf-frontend.onrender.com
   ```
6. Click "Create Web Service"
7. **Copy your backend URL** (e.g., `https://ctf-backend.onrender.com`)

## Step 3: Deploy Frontend (1 minute)

1. In Render, click "New +" → "Static Site"
2. Connect same repository: `mohamedyassinenasraoui/CTFspace`
3. Settings:
   - **Name**: `ctf-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Environment Variable:
   ```
   VITE_API_URL = https://ctf-backend.onrender.com
   ```
   (Use the backend URL from Step 2)
5. Click "Create Static Site"
6. **Copy your frontend URL** (e.g., `https://ctf-frontend.onrender.com`)

## Step 4: Update Backend CORS

1. Go back to your backend service
2. Edit `FRONTEND_URL` environment variable
3. Set it to your frontend URL from Step 3
4. Save changes (auto-redeploys)

## Step 5: Create Admin User

1. Go to your backend URL: `https://ctf-backend.onrender.com/api/auth/register`
2. Register a new user (or use the frontend)
3. Update the user role in MongoDB Atlas:
   - Go to MongoDB Atlas → Browse Collections
   - Find your user in the `users` collection
   - Edit document → Set `role: "admin"` → Save

## Done! 🎉

Visit your frontend URL and start using your CTF Platform!

### Your URLs:
- **Frontend**: `https://ctf-frontend.onrender.com`
- **Backend API**: `https://ctf-backend.onrender.com`

---

## Generate Secure Secrets (Optional)

On Windows PowerShell:
```powershell
# Generate JWT_SECRET
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Generate JWT_REFRESH_SECRET (run again)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

On Mac/Linux:
```bash
openssl rand -hex 32
```

---

## Troubleshooting

**Backend won't start?**
- Check MongoDB connection string format
- Verify all environment variables are set
- Check Render logs for errors

**Frontend shows connection errors?**
- Verify `VITE_API_URL` matches your backend URL
- Check that backend `FRONTEND_URL` matches frontend URL
- Wait a few minutes for services to fully start

**Can't register/login?**
- Check MongoDB connection
- Verify JWT secrets are set
- Check backend logs

---

## Next Steps

- Set up custom domain (optional)
- Configure Google OAuth (see OAUTH_SETUP.md)
- Add more challenges via Admin Panel
- Invite users to your platform!

