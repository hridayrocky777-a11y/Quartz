# OAuth Configuration for Quartz

## Issue: OAuth Redirect URL Not Working

If users are being redirected to `http://127.0.0.1:5503/html/home.html` after authentication instead of your GitHub Pages URL, it means the OAuth providers (Google + Supabase) have the **local development URL registered** instead of the production URL.

## Fix: Register GitHub Pages URLs

### 1. Supabase Configuration

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your Quartz project
3. Go to **Authentication** → **URL Configuration**
4. Under "Redirect URLs", add:
   ```
   https://hridayrocky777-a11y.github.io/Quartz/html/home.html
   ```
5. (Optional) Keep `http://127.0.0.1:5503/html/home.html` if you need local dev to work
6. Click **Save**

### 2. Google OAuth App Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client (usually named something like "Web client")
5. Under "Authorized redirect URIs", add:
   ```
   https://hridayrocky777-a11y.github.io/Quartz/html/home.html
   ```
6. (Optional) Keep `http://127.0.0.1:5503/html/home.html` if you need local dev to work
7. Click **Save**

## Code Changes

The code in `js/home.js` has been updated to automatically use the correct redirect URL based on the environment:

- **Local Development** (localhost, 127.0.0.1): Uses `http://127.0.0.1:5503/html/home.html`
- **Production** (GitHub Pages): Uses `https://hridayrocky777-a11y.github.io/Quartz/html/home.html`

## After Configuration

1. Make sure you've pushed the latest code to GitHub
2. Wait for GitHub Pages to rebuild (usually 1-2 minutes)
3. Clear your browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
4. Test the sign-in flow again

## Troubleshooting

**Still redirecting to localhost?**
- Clear browser cookies/cache
- Check that both URLs are registered in Supabase AND Google OAuth
- Make sure you saved the changes in both services
- Wait for GitHub Pages to rebuild
- Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
