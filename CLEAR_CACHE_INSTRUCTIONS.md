# How to Completely Clear Cache and Fix Environment Variable Issues

## The Problem
After logging in with Google OAuth, you're getting redirected back to the app, but it's loading cached JavaScript files that don't have the environment variables properly loaded.

## Complete Solution

### Step 1: Stop the Dev Server
Press **Ctrl+C** in the terminal where `npm run dev` is running.

### Step 2: Clear Server Cache
Run in PowerShell:
```powershell
Remove-Item -Recurse -Force .next
```

### Step 3: Clear Browser Cache (IMPORTANT!)

#### Option A: Hard Refresh (Quick)
1. Open your browser to `http://localhost:3000`
2. Press **Ctrl+Shift+Delete**
3. Select "Cached images and files"
4. Select "Last hour" or "All time"
5. Click "Clear data"

#### Option B: Incognito/Private Window (Easier)
1. Open a new **Incognito/Private window** (Ctrl+Shift+N in Chrome)
2. Go to `http://localhost:3000/login`
3. This will load fresh files without any cache

#### Option C: Disable Cache in DevTools (Best for Development)
1. Open DevTools (F12)
2. Go to "Network" tab
3. Check "Disable cache" checkbox
4. Keep DevTools open while developing

### Step 4: Restart Dev Server
```powershell
npm run dev
```

### Step 5: Test Login
1. Go to `http://localhost:3000/login` (in incognito window or after clearing cache)
2. Click "Sign in with Google"
3. Complete OAuth flow
4. You should be redirected to `/dashboard` without errors

---

## Quick Script

Run this to do everything at once:
```powershell
.\clean-start.ps1
```

Then open an **Incognito window** and test.

---

## Verification

After logging in, open the browser console (F12) and you should see:
- ✅ "Authenticated user: [your-id] [your-email]"
- ✅ "Profile loaded: user [your-email]" OR "Creating new user profile for OAuth user"
- ✅ "Redirecting user to: /dashboard"

If you see these messages, everything is working!

---

## Still Having Issues?

If you still see the environment variable error after following all steps:

1. Check that `.env.local` exists and has the correct values
2. Make sure you're using an **Incognito window** or have **completely cleared cache**
3. Check the terminal output for any errors when starting the dev server
4. Try restarting your computer (sometimes environment variables need a full restart)

