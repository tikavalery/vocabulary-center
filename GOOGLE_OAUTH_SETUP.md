# Google OAuth Setup Guide

## Error: "The OAuth client was not found" (Error 401: invalid_client)

This error means your Google OAuth credentials are not configured correctly. Follow these steps to fix it:

## Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Create or Select a Project:**
   - Click the project dropdown at the top
   - Click "New Project" or select an existing project
   - Give it a name (e.g., "Vocabulary Center")

3. **Enable Google+ API:**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" or "Google Identity"
   - Click on it and click "Enable"

4. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - If prompted, configure the OAuth consent screen first:
     - User Type: External (unless you have Google Workspace)
     - App name: "Vocabulary Center" (or your app name)
     - User support email: Your email
     - Developer contact: Your email
     - Click "Save and Continue" through the steps
   
5. **Configure OAuth Client:**
   - Application type: **Web application**
   - Name: "Vocabulary Center Web Client" (or any name)
   - **Authorized JavaScript origins:**
     - `http://localhost:3000` (for development)
     - Your production frontend URL (e.g., `https://yourdomain.com`)
   - **Authorized redirect URIs:**
     - `http://localhost:5000/api/auth/google/callback` (for development)
     - `https://your-backend-url.com/api/auth/google/callback` (for production)
   - Click "Create"

6. **Copy Your Credentials:**
   - You'll see a popup with your Client ID and Client Secret
   - **Copy both values** (you won't be able to see the secret again)

## Step 2: Update Your .env File

Edit your `backend/.env` file and add/update these variables:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
BACKEND_URL=http://localhost:5000
```

**Important Notes:**
- Replace `your-client-id-here` with your actual Client ID from Google Cloud Console
- Replace `your-client-secret-here` with your actual Client Secret
- The `GOOGLE_CALLBACK_URL` must match **exactly** what you set in Google Cloud Console
- For production, change `localhost:5000` to your actual backend URL

## Step 3: Restart Your Backend Server

After updating the `.env` file:

```bash
# Stop your server (Ctrl+C)
# Then restart it
cd backend
npm run dev
```

## Step 4: Test Google Login

1. Go to your login page
2. Click "Sign in with Google"
3. You should be redirected to Google's login page
4. After logging in, you'll be redirected back to your app

## Common Issues

### Issue 1: "The OAuth client was not found"
**Solution:**
- Check that `GOOGLE_CLIENT_ID` in `.env` matches your Google Cloud Console Client ID exactly
- Make sure there are no extra spaces or quotes in the `.env` file
- Restart your backend server after changing `.env`

### Issue 2: "Redirect URI mismatch"
**Solution:**
- The callback URL in `.env` must match exactly what's in Google Cloud Console
- Check for trailing slashes or missing protocols (http:// or https://)
- Make sure both the backend URL and the callback URL are correct

### Issue 3: "Access blocked"
**Solution:**
- If your OAuth consent screen is in "Testing" mode, add your email to the test users list
- Go to "APIs & Services" > "OAuth consent screen"
- Scroll down to "Test users" and add your email

## For Production

When deploying to production:

1. **Update Google Cloud Console:**
   - Add your production URLs to "Authorized JavaScript origins"
   - Add your production callback URL to "Authorized redirect URIs"

2. **Update .env (or production environment variables):**
   ```env
   GOOGLE_CLIENT_ID=your-production-client-id
   GOOGLE_CLIENT_SECRET=your-production-client-secret
   GOOGLE_CALLBACK_URL=https://your-backend-domain.com/api/auth/google/callback
   BACKEND_URL=https://your-backend-domain.com
   CLIENT_URL=https://your-frontend-domain.com
   ```

3. **Consider creating separate OAuth clients:**
   - One for development (localhost)
   - One for production (your domain)

## Verification Checklist

- [ ] Created project in Google Cloud Console
- [ ] Enabled Google+ API or Google Identity
- [ ] Configured OAuth consent screen
- [ ] Created OAuth 2.0 Client ID (Web application)
- [ ] Added correct Authorized JavaScript origins
- [ ] Added correct Authorized redirect URIs
- [ ] Copied Client ID and Client Secret to `.env` file
- [ ] Updated `GOOGLE_CALLBACK_URL` in `.env`
- [ ] Restarted backend server
- [ ] Tested Google login

## Still Having Issues?

1. Check your backend server console for error messages
2. Verify your `.env` file has no syntax errors
3. Make sure your backend server is running on the port specified in `GOOGLE_CALLBACK_URL`
4. Check Google Cloud Console to ensure credentials are enabled and not deleted

