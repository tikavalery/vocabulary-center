# Deploy to Heroku via Website (No CLI Required)

This guide shows you how to deploy your Vocabulary Center app to Heroku using only the Heroku website - no command line needed!

## Prerequisites

1. **Heroku Account**: Sign up at [heroku.com](https://www.heroku.com) (free)
2. **GitHub Account**: Your code should be on GitHub
3. **MongoDB Atlas Account**: Free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

---

## Step 1: Push Your Code to GitHub

If your code isn't on GitHub yet:

1. Go to [github.com](https://github.com) and create a new repository
2. Push your code:
   ```bash
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/vocabulary-center.git
   git push -u origin main
   ```

---

## Step 2: Create Heroku App via Website

1. **Go to [dashboard.heroku.com](https://dashboard.heroku.com)**
2. **Click "New"** in the top right
3. **Select "Create new app"**
4. **Enter app name**: `vocabulary-center-api` (or your preferred name)
5. **Choose region**: United States (or closest to you)
6. **Click "Create app"**

---

## Step 3: Connect GitHub Repository

1. **In your app dashboard**, go to the **"Deploy"** tab
2. **Under "Deployment method"**, click **"GitHub"**
3. **Click "Connect to GitHub"** (you may need to authorize Heroku)
4. **Search for your repository**: `vocabulary-center`
5. **Click "Connect"** next to your repository

---

## Step 4: Set Environment Variables (Config Vars)

1. **In your app dashboard**, go to the **"Settings"** tab
2. **Scroll down to "Config Vars"**
3. **Click "Reveal Config Vars"**
4. **Add each environment variable** by clicking "Add" for each:

### Required Environment Variables:

**MongoDB:**
- Key: `MONGODB_URI`
- Value: `mongodb+srv://username:password@cluster.mongodb.net/vocabulary-center`
  - Get this from MongoDB Atlas (see Step 5 below)

**JWT:**
- Key: `JWT_SECRET`
- Value: `your-super-secret-jwt-key-change-this-in-production`
- Key: `JWT_EXPIRES_IN`
- Value: `7d`

**Client URL:**
- Key: `CLIENT_URL`
- Value: `https://your-frontend-app.netlify.app` (update after deploying frontend)
  - For now, you can use: `http://localhost:3000` (will update later)

**Node Environment:**
- Key: `NODE_ENV`
- Value: `production`

**Google OAuth (if using):**
- Key: `GOOGLE_CLIENT_ID`
- Value: `your-google-client-id`
- Key: `GOOGLE_CLIENT_SECRET`
- Value: `your-google-client-secret`
- Key: `GOOGLE_CALLBACK_URL`
- Value: `https://your-app-name.herokuapp.com/api/auth/google/callback`
  - Replace `your-app-name` with your actual Heroku app name

**Stripe:**
- Key: `STRIPE_SECRET_KEY`
- Value: `sk_live_your-stripe-secret-key` (or `sk_test_...` for testing)
- Key: `STRIPE_WEBHOOK_SECRET`
- Value: `whsec_your-webhook-secret`

**Cloudinary:**
- Key: `CLOUDINARY_CLOUD_NAME`
- Value: `your-cloud-name`
- Key: `CLOUDINARY_API_KEY`
- Value: `your-api-key`
- Key: `CLOUDINARY_API_SECRET`
- Value: `your-api-secret`

**Email (for password reset):**
- Key: `SMTP_USER`
- Value: `your-email@gmail.com`
- Key: `SMTP_PASS`
- Value: `your-app-specific-password`

**Backend URL (for OAuth):**
- Key: `BACKEND_URL`
- Value: `https://your-app-name.herokuapp.com`
  - Replace `your-app-name` with your actual Heroku app name

---

## Step 5: Set Up MongoDB Atlas

1. **Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)**
2. **Sign up** (free tier available)
3. **Create a new cluster** (choose free tier)
4. **Create database user**:
   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Create username and password (save these!)
5. **Whitelist IP addresses**:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (adds `0.0.0.0/0`)
6. **Get connection string**:
   - Go to "Clusters" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `vocabulary-center`
   - Example: `mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/vocabulary-center`
7. **Add to Heroku Config Vars**:
   - Go back to Heroku dashboard → Settings → Config Vars
   - Add `MONGODB_URI` with the connection string

---

## Step 6: Configure Build Settings

1. **In Heroku dashboard**, go to **"Settings"** tab
2. **Scroll to "Buildpacks"**
3. **Click "Add buildpack"**
4. **Select "nodejs"** (if not already added)
5. **Click "Save changes"**

---

## Step 7: Deploy from GitHub

1. **Go to "Deploy" tab** in Heroku dashboard
2. **Under "Manual deploy"**, select the branch: `main` (or `master`)
3. **Click "Deploy Branch"**
4. **Wait for deployment** (you'll see build logs)
5. **Once complete**, you'll see "Your app was successfully deployed!"
6. **Click "View"** to open your app

---

## Step 8: Verify Deployment

1. **Click "Open app"** in the top right of Heroku dashboard
2. **Your app should open**: `https://your-app-name.herokuapp.com`
3. **Test the health endpoint**: `https://your-app-name.herokuapp.com/api/health`
   - Should return: `{"status":"OK","message":"Server is running"}`

---

## Step 9: View Logs (if needed)

1. **In Heroku dashboard**, go to **"More"** → **"View logs"**
2. **Or click the "Activity" tab** to see deployment logs
3. **Check for any errors** in the logs

---

## Step 10: Deploy Frontend

### Option A: Deploy to Netlify (Recommended)

1. **Go to [netlify.com](https://www.netlify.com)** and sign up/login
2. **Click "Add new site"** → **"Import an existing project"**
3. **Connect to GitHub** and select your repository
4. **Configure build settings**:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`
5. **Click "Deploy site"**
6. **Set environment variables**:
   - Go to Site settings → Environment variables
   - Add:
     - `REACT_APP_API_URL`: `https://your-app-name.herokuapp.com/api`
     - `REACT_APP_STRIPE_PUBLISHABLE_KEY`: `pk_live_your-stripe-key`
7. **Redeploy** (trigger a new deployment)

### Option B: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign up/login
2. **Click "Add New Project"**
3. **Import your GitHub repository**
4. **Configure**:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Create React App
5. **Add environment variables**:
   - `REACT_APP_API_URL`: `https://your-app-name.herokuapp.com/api`
   - `REACT_APP_STRIPE_PUBLISHABLE_KEY`: `pk_live_your-stripe-key`
6. **Click "Deploy"**

---

## Step 11: Update Backend CLIENT_URL

After deploying your frontend:

1. **Go back to Heroku dashboard** → Your app → **Settings** → **Config Vars**
2. **Find `CLIENT_URL`**
3. **Click the edit icon** (pencil)
4. **Update the value** to your frontend URL:
   - Netlify: `https://your-app-name.netlify.app`
   - Vercel: `https://your-app-name.vercel.app`
5. **Click "Save"**

---

## Step 12: Update Google OAuth (if using)

1. **Go to [Google Cloud Console](https://console.cloud.google.com)**
2. **Navigate to**: APIs & Services → Credentials
3. **Click on your OAuth 2.0 Client ID**
4. **Under "Authorized redirect URIs"**, add:
   - `https://your-app-name.herokuapp.com/api/auth/google/callback`
5. **Click "Save"**

---

## Step 13: Enable Automatic Deploys (Optional)

1. **In Heroku dashboard**, go to **"Deploy"** tab
2. **Under "Automatic deploys"**, select branch: `main`
3. **Click "Enable Automatic Deploys"**
4. **Now**, every time you push to GitHub, Heroku will automatically deploy!

---

## Troubleshooting

### App won't start

1. **Check logs**: Dashboard → More → View logs
2. **Check Config Vars**: Make sure all required variables are set
3. **Check Procfile**: Should be `web: cd backend && node server.js`

### Database connection errors

1. **Check MongoDB Atlas**:
   - IP whitelist includes `0.0.0.0/0`
   - Database user credentials are correct
   - Connection string is correct

### CORS errors

1. **Check `CLIENT_URL`** in Config Vars matches your frontend URL exactly
2. **No trailing slash** in the URL

### Build fails

1. **Check build logs** in the Activity tab
2. **Verify Node.js version** in `backend/package.json`:
   ```json
   "engines": {
     "node": "18.x"
   }
   ```

---

## Useful Heroku Dashboard Features

### View App Metrics
- **Dashboard** → Your app → **Metrics** tab
- See CPU, memory usage, response time

### Restart App
- **Dashboard** → Your app → **More** → **Restart all dynos**

### Run One-Off Commands
- **Dashboard** → Your app → **More** → **Run console**
- Run commands like: `node backend/seed.js`

### View Activity
- **Dashboard** → Your app → **Activity** tab
- See all deployments and events

---

## Cost

- **Heroku Free Tier**: 
  - 550-1000 free dyno hours per month
  - App sleeps after 30 minutes of inactivity
  - Perfect for development/testing
- **Heroku Hobby**: $7/month
  - Always-on dyno
  - Better for production

---

## Next Steps

1. ✅ Test all functionality
2. ✅ Set up custom domain (optional)
3. ✅ Enable monitoring
4. ✅ Set up backups for MongoDB
5. ✅ Configure error tracking (Sentry, etc.)

---

## Quick Reference: All Config Vars Needed

Copy-paste this list and fill in your values:

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-frontend.netlify.app
NODE_ENV=production
BACKEND_URL=https://your-app-name.herokuapp.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://your-app-name.herokuapp.com/api/auth/google/callback
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SMTP_USER=...
SMTP_PASS=...
```

That's it! You've deployed to Heroku using only the website! 🎉

