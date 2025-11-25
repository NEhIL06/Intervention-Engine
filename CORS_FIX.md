# Quick Fix Guide: CORS Error Resolution

## Problem
The frontend at `https://interventionengine.netlify.app` is being blocked by CORS policy because the backend hasn't been configured to allow requests from this origin.

## Error
```
Access to XMLHttpRequest at 'https://intervention-engine.onrender.com/...' 
from origin 'https://interventionengine.netlify.app' has been blocked by CORS policy
```

## Solution: Update Backend on Render

### Option 1: Use Environment Variable (Recommended)

1. **Go to Render Dashboard**
   - Navigate to: https://dashboard.render.com/
   - Select your backend service: `intervention-engine`

2. **Update Environment Variables**
   - Click on **"Environment"** tab in the left sidebar
   - Find or add the `ALLOWED_ORIGINS` variable
   - Set the value to:
     ```
     https://interventionengine.netlify.app,http://localhost:19006
     ```
   - Click **"Save Changes"**

3. **Wait for Redeploy**
   - Render will automatically redeploy your backend
   - Wait 1-2 minutes for the deployment to complete
   - Check the "Events" tab to see deployment status

4. **Verify**
   - Refresh your Netlify app: https://interventionengine.netlify.app
   - CORS error should be gone

---

### Option 2: Deploy Updated Code (If Option 1 Doesn't Work)

If the environment variable approach doesn't work, you need to deploy the updated backend code:

1. **Commit and Push Backend Changes**
   ```bash
   cd backend
   git add .
   git commit -m "Fix CORS configuration for Netlify deployment"
   git push origin main
   ```

2. **Render Auto-Deploy**
   - Render will automatically detect the push and redeploy
   - Monitor the deployment in Render dashboard

3. **Manual Deploy (if auto-deploy is off)**
   - Go to Render dashboard → Your service
   - Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## Quick Commands to Deploy Backend

If you haven't pushed the backend changes yet:

```bash
# Navigate to your project root
cd f:\Intervention_Engine

# Add all changes
git add .

# Commit with descriptive message
git commit -m "Configure CORS for Netlify deployment"

# Push to trigger Render deployment
git push origin main
```

---

## What Was Fixed in the Code

### 1. Frontend WebSocket URL
**Before**: `wss://localhost:3000` ❌  
**After**: `wss://intervention-engine.onrender.com` ✅

### 2. Backend CORS Logic
**Before**: Hardcoded origin that bypassed environment variable  
**After**: Properly uses `ALLOWED_ORIGINS` environment variable

---

## Expected Result After Fix

### Frontend Console (No Errors)
```
Fetching initial student status...
Status loaded: {student_id: "...", status: "ON_TRACK", current_task: null}
Connecting to WebSocket: wss://intervention-engine.onrender.com/ws/...
WebSocket connected successfully
```

### Backend Configuration
- `ALLOWED_ORIGINS=https://interventionengine.netlify.app,http://localhost:19006`
- CORS middleware allows both production and local development

---

## Verification Steps

1. ✅ **Check Backend Health**
   - Visit: https://intervention-engine.onrender.com/health
   - Should return: `{"status": "ok", "database": "connected"}`

2. ✅ **Check CORS in Browser**
   - Open: https://interventionengine.netlify.app
   - Open DevTools (F12) → Console tab
   - Should see NO CORS errors

3. ✅ **Test API Call**
   - Submit a daily check-in
   - Should work without errors

4. ✅ **Test WebSocket**
   - Connection indicator should be green
   - Real-time updates should work

---

## Still Having Issues?

### Issue: "Still getting CORS error after env var update"

**Cause**: Render hasn't redeployed yet or cached the old config

**Fix**:
1. Go to Render dashboard
2. Click **"Manual Deploy"** → **"Clear build cache & deploy"**
3. Wait for deployment to complete
4. Hard refresh your Netlify app (Ctrl+Shift+R)

### Issue: "WebSocket connection failed"

**Cause**: Backend might be sleeping (Render free tier)

**Fix**:
1. Visit the health endpoint first to wake it up: https://intervention-engine.onrender.com/health
2. Wait 30 seconds
3. Refresh your Netlify app

### Issue: "Environment variable not taking effect"

**Fix**:
1. Verify exact spelling: `ALLOWED_ORIGINS` (all caps, no spaces)
2. Verify format: comma-separated, no spaces
3. Example: `https://interventionengine.netlify.app,http://localhost:19006`
4. Don't include trailing slashes in URLs

---

## Current Configuration

**Frontend URL**: https://interventionengine.netlify.app  
**Backend URL**: https://intervention-engine.onrender.com

**Required Backend Environment Variable**:
```bash
ALLOWED_ORIGINS=https://interventionengine.netlify.app,http://localhost:19006
```

---

## Next Steps

1. [ ] Update `ALLOWED_ORIGINS` on Render
2. [ ] Wait for Render to redeploy (1-2 minutes)
3. [ ] Refresh Netlify app
4. [ ] Verify no CORS errors
5. [ ] Test full functionality

**Estimated Time**: 3-5 minutes total
