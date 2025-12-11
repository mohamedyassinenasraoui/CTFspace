# Network Access Setup

This guide explains how to make your CTF platform accessible to other devices on your local WiFi network.

## Quick Setup

### 1. Find Your IP Address

**Windows:**
```powershell
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually WiFi or Ethernet).

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```
or
```bash
ip addr show
```

**Or use the helper script:**
```bash
node get-network-ip.js
```

### 2. Start the Servers

The servers are already configured to accept network connections. Just start them normally:

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### 3. Access from Other Devices

Once you have your IP address (e.g., `192.168.1.100`), share these URLs with others on your WiFi:

- **Frontend:** `http://YOUR_IP:5173`
- **Backend:** `http://YOUR_IP:5000`

Example:
- Frontend: `http://192.168.1.100:5173`
- Backend: `http://192.168.1.100:5000`

## Configuration

### Automatic IP Detection

The backend server will automatically display your network IP addresses when it starts. Look for the "📡 Network Access Information" section in the console output.

### Manual Configuration (Optional)

If you want to set a specific IP address, you can use environment variables:

**Backend (.env):**
```env
HOST=0.0.0.0
PORT=5000
FRONTEND_URL=http://YOUR_IP:5173
```

**Frontend (.env):**
```env
VITE_API_URL=http://YOUR_IP:5000
```

## Troubleshooting

### Firewall Issues

**Windows:**
1. Open Windows Defender Firewall
2. Click "Allow an app or feature through Windows Defender Firewall"
3. Add Node.js or allow ports 5000 and 5173

**Mac:**
```bash
# Allow Node.js through firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
```

**Linux:**
```bash
# Ubuntu/Debian
sudo ufw allow 5000/tcp
sudo ufw allow 5173/tcp
```

### CORS Issues

The server is configured to accept requests from:
- localhost
- 192.168.x.x (private network range)
- 10.x.x.x (private network range)
- 172.16-31.x.x (private network range)

If you encounter CORS errors, make sure you're accessing the frontend via the IP address, not localhost.

### Connection Refused

1. Make sure both servers are running
2. Check that your firewall allows connections on ports 5000 and 5173
3. Verify you're on the same WiFi network
4. Try accessing from the same device first to verify it works

## Security Note

⚠️ **Important:** This setup allows access from your local network only. For production deployment, you should:
- Use HTTPS
- Implement proper authentication
- Configure a reverse proxy (nginx, Apache)
- Use environment-specific configurations

