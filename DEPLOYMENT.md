# Intervention Engine - Deployment Guide

This guide provides step-by-step instructions for deploying the Intervention Engine application to production.

## Architecture Overview

- **Frontend**: React Native Expo app exported as static web application
- **Backend**: FastAPI server with WebSocket support (deployed on Render)
- **Database**: PostgreSQL (managed by Render)
- **Workflow**: n8n for intervention processing

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Frontend Deployment (Netlify)](#frontend-deployment-netlify)
3. [Backend Configuration](#backend-configuration)
4. [Environment Variables](#environment-variables)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- [x] Node.js 18+ installed
- [x] Git repository with your code
- [x] Netlify account (free tier works)
- [x] Backend already deployed on Render (current: `intervention-engine.onrender.com`)
- [x] Database credentials from Render
- [x] n8n webhook URL configured

---

## Frontend Deployment (Netlify)

### Option 1: Deploy via Netlify UI (Recommended)

#### Step 1: Build the Frontend Locally (Optional - Test First)

```bash
cd frontend
npm install
npm run build:web
```

This creates a `dist` folder with your static files. Verify `dist/index.html` exists.

#### Step 2: Push Code to Git Repository

Ensure your code is pushed to GitHub, GitLab, or Bitbucket:

```bash
git add .
git commit -m "Add deployment configuration"
git push origin main
```

#### Step 3: Create New Site on Netlify

1. Go to [Netlify](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your Git provider (GitHub/GitLab/Bitbucket)
4. Select your `Intervention_Engine` repository
5. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build:web`
   - **Publish directory**: `frontend/dist`
   - **Node version**: `18`

6. Click **"Deploy site"**

#### Step 4: Configure Environment Variables on Netlify

1. In your Netlify site dashboard, go to **Site settings** → **Environment variables**
2. Add the following variables:

   | Key | Value |
   |-----|-------|
   | `EXPO_PUBLIC_BACKEND_HTTP_URL` | `https://intervention-engine.onrender.com` |
   | `EXPO_PUBLIC_BACKEND_WS_URL` | `wss://intervention-engine.onrender.com` |

3. Click **"Save"**

#### Step 5: Trigger Redeploy

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Clear cache and deploy site"**
3. Wait for deployment to complete (usually 1-3 minutes)

#### Step 6: Note Your Netlify URL

Your app will be deployed at: `https://[your-site-name].netlify.app`

For example: `https://intervention-engine.netlify.app`

**📝 Copy this URL** - you'll need it for backend configuration!

---

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Navigate to frontend directory
cd frontend

# Build the app
npm run build:web

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

When prompted:
- Choose "Create & configure a new site"
- Select your team
- Enter site name (or leave blank for random name)

Set environment variables via CLI:

```bash
netlify env:set EXPO_PUBLIC_BACKEND_HTTP_URL "https://intervention-engine.onrender.com"
netlify env:set EXPO_PUBLIC_BACKEND_WS_URL "wss://intervention-engine.onrender.com"
```

---

## Backend Configuration

### Update CORS Allowed Origins

After deploying the frontend, you need to update the backend to accept requests from your Netlify URL.

#### On Render Dashboard:

1. Go to your Render dashboard
2. Select your backend service (`intervention-engine`)
3. Go to **Environment** tab
4. Add or update the `ALLOWED_ORIGINS` variable:

   ```
   ALLOWED_ORIGINS=https://[your-site-name].netlify.app,http://localhost:19006
   ```

   Replace `[your-site-name]` with your actual Netlify site name.

   > **Example**: `ALLOWED_ORIGINS=https://intervention-engine.netlify.app,http://localhost:19006`

5. Click **"Save Changes"**
6. Render will automatically redeploy your backend

#### Format Details:

- **Multiple origins**: Separate with commas (no spaces)
- **Include protocol**: Always use `https://` for production
- **Keep localhost**: Include `http://localhost:19006` for local development
- **Use `*` for testing** (NOT recommended for production):
  ```
  ALLOWED_ORIGINS=*
  ```

---

## Environment Variables

### Frontend Environment Variables

Location: Netlify site settings → Environment variables

| Variable | Description | Example |
|----------|-------------|---------|
| `EXPO_PUBLIC_BACKEND_HTTP_URL` | Backend API URL (HTTPS) | `https://intervention-engine.onrender.com` |
| `EXPO_PUBLIC_BACKEND_WS_URL` | Backend WebSocket URL (WSS) | `wss://intervention-engine.onrender.com` |

### Backend Environment Variables

Location: Render dashboard → Your service → Environment

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+asyncpg://user:pass@host/db` |
| `N8N_WEBHOOK_URL` | n8n webhook endpoint | `https://your-n8n.app/webhook/...` |
| `ALLOWED_ORIGINS` | Comma-separated allowed origins | `https://your-app.netlify.app` |

> **💡 Tip**: See `.env.example` files in both `frontend/` and `backend/` directories for reference.

---

## Post-Deployment Verification

### 1. Frontend Health Check

Visit your Netlify URL: `https://[your-site-name].netlify.app`

**Expected**: App loads with "Focus Mode" title and "Intervention Engine Demo" subtitle

### 2. Backend API Check

Open browser DevTools (F12) → Console tab

**Expected**: No CORS errors

### 3. WebSocket Connection Check

In the app, the connection status should show:
- ✅ Green indicator = Connected
- ❌ Red indicator = Connection failed

### 4. Full Flow Test

1. **Submit Check-in**:
   - Enter Quiz Score: `5`
   - Enter Focus Minutes: `30`
   - Click "Submit Check-in"

2. **Expected Result**:
   - Status changes to "Needs Intervention"
   - Message: "Analysis in progress. Waiting for Mentor..."
   - WebSocket receives real-time update

3. **Test Task Assignment** (requires n8n webhook):
   - Wait for mentor approval (or trigger manually via n8n)
   - App should show assigned task

4. **Test Task Completion**:
   - Click "Mark Complete"
   - Status returns to "On Track"

---

## Troubleshooting

### Issue: "CORS Error" in Browser Console

**Symptom**: Console shows:
```
Access to XMLHttpRequest at 'https://intervention-engine.onrender.com/...' 
from origin 'https://your-app.netlify.app' has been blocked by CORS policy
```

**Solution**:
1. Verify `ALLOWED_ORIGINS` on Render includes your exact Netlify URL
2. Ensure protocol is `https://` (not `http://`)
3. Check for trailing slashes (don't include them)
4. Redeploy backend after changing environment variables

---

### Issue: "WebSocket Connection Failed"

**Symptom**: Red connection indicator, console shows WebSocket errors

**Solutions**:

1. **Check WebSocket URL**: Ensure it uses `wss://` (not `ws://`) for HTTPS sites
2. **Verify Backend Health**: Visit `https://intervention-engine.onrender.com/health`
   - Should return: `{"status": "ok", "database": "connected"}`
3. **CORS Issue**: WebSocket connections also require CORS configuration
4. **Render Free Tier**: Service may be sleeping - first request wakes it up (30s delay)

---

### Issue: "Build Failed" on Netlify

**Common Causes**:

1. **Missing Dependencies**:
   ```bash
   cd frontend
   npm install
   git add package-lock.json
   git commit -m "Add package-lock.json"
   git push
   ```

2. **Wrong Node Version**:
   - Ensure build settings use Node 18+
   - Add `.nvmrc` file in frontend directory:
     ```
     18
     ```

3. **Build Command Error**:
   - Verify `package.json` has `"build:web": "expo export -p web"`
   - Test locally: `npm run build:web`

---

### Issue: "Page Not Found" on Refresh

**Symptom**: App works on homepage but shows 404 when refreshing on routes

**Solution**: This should be handled by `netlify.toml` redirect rules. Verify:

1. `netlify.toml` exists in `frontend/` directory
2. Contains redirect rule:
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```
3. Redeploy if needed

---

### Issue: "Environment Variables Not Working"

**Symptoms**:
- App connects to wrong backend
- `process.env.EXPO_PUBLIC_BACKEND_HTTP_URL` is `undefined`

**Solutions**:

1. **Use Correct Prefix**: Expo requires `EXPO_PUBLIC_` prefix for web builds
2. **Check Netlify Settings**: Environment variables → Verify exact spelling
3. **Redeploy**: Environment variables require full redeploy (not just publish)
4. **Clear Cache**: Netlify → Deploys → "Clear cache and deploy site"

---

### Issue: Backend "Database Connection Error"

**Symptom**: `/health` endpoint returns `"database": "initializing"`

**Solutions**:

1. **Check DATABASE_URL**: Verify on Render environment settings
2. **IPv6 Issue**: Ensure `asyncpg` driver is used (not `psycopg2`)
3. **Wait**: First connection after sleep may take 30-60 seconds
4. **Check Render Logs**: Render dashboard → Logs tab for details

---

### Issue: n8n Webhook Not Triggering

**Symptom**: Student stays in "Needs Intervention" status forever

**Solutions**:

1. **Verify Webhook URL**: Check `N8N_WEBHOOK_URL` on Render
2. **Test Manually**: Send POST request to webhook:
   ```bash
   curl -X POST https://your-n8n.app/webhook/... \
     -H "Content-Type: application/json" \
     -d '{
       "student_id": "11111111-1111-1111-1111-111111111111",
       "student_name": "Test Student",
       "quiz_score": 5,
       "focus_minutes": 30
     }'
   ```
3. **Check n8n Workflow**: Ensure workflow is active and properly configured
4. **Timeout Fallback**: In production, consider auto-unlock after timeout

---

## Updating Deployment

### Update Frontend

```bash
# Make your changes
cd frontend
git add .
git commit -m "Update frontend"
git push origin main
```

Netlify automatically rebuilds on push to main branch.

### Update Backend

```bash
# Make your changes
cd backend
git add .
git commit -m "Update backend"
git push origin main
```

Render automatically rebuilds on push to main branch.

---

## Custom Domain Setup (Optional)

### Netlify Custom Domain

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `intervention-engine.example.com`)
4. Follow DNS configuration instructions
5. Netlify automatically provisions SSL certificate

### Update Backend CORS

After adding custom domain, update `ALLOWED_ORIGINS`:

```
ALLOWED_ORIGINS=https://intervention-engine.example.com,https://intervention-engine.netlify.app,http://localhost:19006
```

---

## Performance Optimization

### Enable Netlify CDN

Netlify automatically serves your site via global CDN. No configuration needed!

### Enable Gzip/Brotli Compression

Netlify automatically compresses assets. Verify in browser DevTools:
- Network tab → Select file → Headers → `content-encoding: br` or `gzip`

### Monitor Build Times

- Typical build time: 1-2 minutes
- If builds are slow, check for large dependencies
- Consider `package-lock.json` for faster installs

---

## Security Best Practices

1. **Never commit `.env` files** - use `.env.example` templates
2. **Use HTTPS everywhere** - enforced by Netlify and Render
3. **Restrict CORS origins** - don't use `*` in production
4. **Enable Netlify security headers** - already configured in `netlify.toml`
5. **Regular dependency updates**: `npm audit fix`

---

## Support

### Useful Links

- **Netlify Documentation**: https://docs.netlify.com/
- **Render Documentation**: https://render.com/docs
- **Expo Documentation**: https://docs.expo.dev/
- **FastAPI Documentation**: https://fastapi.tiangolo.com/

### Check Service Status

- Backend health: `https://intervention-engine.onrender.com/health`
- Netlify status: `https://www.netlifystatus.com/`
- Render status: `https://status.render.com/`

---

## Quick Reference Commands

```bash
# Frontend local build
cd frontend
npm install
npm run build:web

# Frontend local dev
npm start

# Backend local run
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Deploy frontend (Netlify CLI)
cd frontend
netlify deploy --prod --dir=dist

# Check Netlify environment variables
netlify env:list
```

---

## Summary Checklist

- [ ] Frontend deployed to Netlify
- [ ] Frontend environment variables configured
- [ ] Netlify URL noted (e.g., `your-app.netlify.app`)
- [ ] Backend `ALLOWED_ORIGINS` updated with Netlify URL
- [ ] Backend redeployed on Render
- [ ] Frontend health check passed
- [ ] Backend health check passed (`/health`)
- [ ] WebSocket connection working
- [ ] Full user flow tested (check-in → intervention → completion)
- [ ] No CORS errors in browser console
- [ ] SSL certificate active (HTTPS)

---

**🎉 Congratulations!** Your Intervention Engine is now deployed and ready for production use!
