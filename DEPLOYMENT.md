# Deployment Guide

This guide covers deploying the CTF Platform to various hosting services.

## Prerequisites

- GitHub repository with your code (already done ✅)
- MongoDB Atlas account (free tier available) OR use hosted MongoDB from platform
- Account on your chosen hosting platform

## Option 1: Render (Recommended - Free Tier Available)

### Step 1: Set up MongoDB

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account
2. Create a new cluster (free tier M0)
3. Create a database user (remember username/password)
4. Whitelist IP: `0.0.0.0/0` (allow all IPs) or Render's IP ranges
5. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/ctf?retryWrites=true&w=majority`

### Step 2: Deploy Backend

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `ctf-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Root Directory**: Leave empty (or set to `backend` if deploying separately)

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ctf?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
   FRONTEND_URL=https://your-frontend-url.onrender.com
   ```

6. Click "Create Web Service"
7. Wait for deployment and note your backend URL (e.g., `https://ctf-backend.onrender.com`)

### Step 3: Deploy Frontend

1. In Render Dashboard, click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `ctf-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`

4. Add Environment Variable:
   ```
   VITE_API_URL=https://ctf-backend.onrender.com
   ```
   (Replace with your actual backend URL)

5. Click "Create Static Site"
6. Wait for deployment and note your frontend URL

### Step 4: Update Backend CORS

1. Go back to your backend service on Render
2. Update `FRONTEND_URL` environment variable to your frontend URL
3. Redeploy the backend

### Step 5: Test

Visit your frontend URL and test the application!

---

## Option 2: Railway (Easy Docker Deployment)

### Step 1: Set up MongoDB

1. Create a MongoDB service on Railway or use MongoDB Atlas (same as Render)

### Step 2: Deploy Backend

1. Go to [Railway](https://railway.app) and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect it's a Node.js app
5. Add environment variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   FRONTEND_URL=https://your-frontend-url.up.railway.app
   ```

6. Set root directory to `backend` in settings
7. Railway will auto-deploy

### Step 3: Deploy Frontend

1. Add another service to your Railway project
2. Connect the same GitHub repo
3. Set root directory to `frontend`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.up.railway.app
   ```
5. Railway will build and deploy

---

## Option 3: Vercel (Frontend) + Render/Railway (Backend)

### Frontend on Vercel

1. Go to [Vercel](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

6. Deploy

### Backend on Render/Railway

Follow the backend deployment steps from Option 1 or 2 above.

---

## Option 4: Docker Compose on VPS (DigitalOcean, AWS, etc.)

### Step 1: Set up VPS

1. Create a VPS (Ubuntu 22.04 recommended)
2. SSH into your server
3. Install Docker and Docker Compose:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   sudo usermod -aG docker $USER
   sudo apt-get install docker-compose-plugin
   ```

### Step 2: Clone and Deploy

```bash
git clone https://github.com/mohamedyassinenasraoui/CTFspace.git
cd CTFspace

# Create .env file for docker-compose
cat > .env << EOF
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
MONGODB_URI=mongodb://mongodb:27017/ctf
FRONTEND_URL=http://your-domain.com
VITE_API_URL=http://your-domain.com/api
EOF

# Build and start
docker-compose up -d

# View logs
docker-compose logs -f
```

### Step 3: Set up Nginx Reverse Proxy

```bash
sudo apt-get install nginx
```

Create `/etc/nginx/sites-available/ctf`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/ctf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 4: Set up SSL with Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Environment Variables Reference

### Backend (.env)

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ctf
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ctf?retryWrites=true&w=majority
JWT_SECRET=generate-a-random-secret-key-here
JWT_REFRESH_SECRET=generate-another-random-secret-key-here
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend (.env)

```env
VITE_API_URL=https://your-backend-domain.com
```

**Note**: For Vite, environment variables must start with `VITE_` to be exposed to the client.

---

## Post-Deployment Checklist

- [ ] Test user registration and login
- [ ] Test challenge creation (admin)
- [ ] Test flag submission
- [ ] Test team creation and joining
- [ ] Verify leaderboard updates
- [ ] Check WebSocket connections (real-time features)
- [ ] Set up database backups (MongoDB Atlas has automatic backups)
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring (optional)

---

## Troubleshooting

### Backend won't start
- Check MongoDB connection string
- Verify all environment variables are set
- Check logs: `docker-compose logs backend` or platform logs

### Frontend can't connect to backend
- Verify `VITE_API_URL` is set correctly
- Check CORS settings in backend
- Ensure `FRONTEND_URL` in backend matches frontend domain

### Database connection issues
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0` or platform IPs
- Check connection string format
- Verify database user credentials

### Build failures
- Ensure Node.js version is 18+
- Check that all dependencies are in package.json
- Review build logs for specific errors

---

## Security Notes

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use strong JWT secrets** - Generate random strings
3. **Enable HTTPS** - Use Let's Encrypt or platform SSL
4. **Restrict MongoDB access** - Use IP whitelisting when possible
5. **Regular updates** - Keep dependencies updated
6. **Monitor logs** - Watch for suspicious activity

---

## Cost Estimates

- **Render Free Tier**: $0/month (limited hours, spins down after inactivity)
- **Railway Free Tier**: $5 credit/month (usually enough for small apps)
- **Vercel Free Tier**: $0/month (generous limits)
- **MongoDB Atlas Free Tier**: $0/month (512MB storage)
- **VPS (DigitalOcean)**: $6-12/month (basic droplet)

---

## Need Help?

- Check platform-specific documentation
- Review application logs
- Open an issue on GitHub
- Check the main README.md for local setup help

