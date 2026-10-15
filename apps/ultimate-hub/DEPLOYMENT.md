# WISE² Ultimate Hub - Deployment Guide

## Quick Start

The Ultimate Hub is built and tested by GitHub Actions. To deploy it to `wise2.net`:

### Option 1: Manual Deployment via Tailscale SSH (Recommended)

Run the deployment script from your local machine (requires Tailscale access):

```bash
./deploy.sh
```

This will:
1. Clone/pull the latest code on gpu-nmls-1
2. Install dependencies
3. Start the Ultimate Hub service
4. Configure Nginx routing to https://wise2.net/hive
5. Verify the deployment

### Option 2: Manual Steps

1. **SSH to the server** (requires Tailscale):
   ```bash
   tailscale ssh wise2ops@gpu-nmls-1
   ```

2. **Deploy the application**:
   ```bash
   cd /opt/wise2-ultimate-hub
   git pull origin main
   npm install
   npm start
   ```

3. **Configure Nginx** (if not already done):
   - Add the following location blocks to `/etc/nginx/sites-enabled/wise2.net.conf`:
   ```nginx
   location = /hive {
       return 301 /hive/;
   }
   
   location ^~ /hive/ {
       proxy_pass http://localhost:8765/;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
   }
   ```

4. **Test Nginx and reload**:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## Verification

Once deployed, verify at:
- `https://wise2.net/hive/api/health` - Health endpoint
- `https://wise2.net/hive` - Dashboard

## Local Testing

To test locally before deployment:

```bash
cd apps/ultimate-hub
npm install
npm start
```

Then visit: `http://localhost:8765`

## Troubleshooting

**Can't connect via Tailscale SSH:**
- Run `tailscale status` to check your Tailscale connection
- Visit the auth link if a browser authentication is needed
- Ensure gpu-nmls-1 is online: `tailscale ping gpu-nmls-1`

**Application not responding:**
- Check if npm process is running: `ps aux | grep node`
- Check logs: Look at console output from the running process
- Verify Nginx is configured: `sudo nginx -t`
- Check Nginx is running: `sudo systemctl status nginx`

**Port conflicts:**
- The app runs on port 8765
- Ensure nothing else is using that port: `netstat -tlnp | grep 8765`
