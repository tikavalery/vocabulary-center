# Heroku Deployment Guide (CLI Method)

This guide covers deploying via Heroku CLI. **For web-based deployment (no CLI required)**, see [HEROKU_WEB_DEPLOYMENT.md](./HEROKU_WEB_DEPLOYMENT.md).

This guide will help you deploy your Vocabulary Center application to Heroku using the command line.

## Prerequisites

1. **Heroku Account**: Sign up at [heroku.com](https://www.heroku.com)
2. **Heroku CLI**: Install from [devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)
3. **Git**: Make sure your project is a Git repository
4. **MongoDB Atlas**: Set up a free MongoDB Atlas account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

## Deployment Strategy

For a MERN stack app, you have two options:

### Option 1: Deploy Backend to Heroku, Frontend to Netlify/Vercel (Recommended)
- **Backend**: Deploy to Heroku
- **Frontend**: Deploy to Netlify or Vercel (better for React apps)

### Option 2: Deploy Both to Heroku
- **Backend**: Deploy to Heroku
- **Frontend**: Build and serve from Heroku (requires additional configuration)

This guide covers **Option 1** (recommended) and **Option 2**.

---

## Part 1: Deploy Backend to Heroku

### Step 1: Prepare Your Backend

1. **Ensure your backend has a `Procfile`** (already created):
   ```
   web: cd backend && node server.js
   ```

2. **Update `backend/package.json`** to include a start script:
   ```json
   "scripts": {
     "start": "node server.js",
     "dev": "nodemon server.js"
   }
   ```

### Step 2: Create Heroku App

1. **Login to Heroku**:
   ```bash
   heroku login
   ```

2. **Create a new Heroku app**:
   ```bash
   heroku create vocabulary-center-api
   ```
   (Replace `vocabulary-center-api` with your preferred app name)

### Step 3: Set Environment Variables

Set all your environment variables on Heroku:

```bash
# MongoDB (use MongoDB Atlas connection string)
heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/vocabulary-center"

# JWT
heroku config:set JWT_SECRET="your-super-secret-jwt-key-change-this"
heroku config:set JWT_EXPIRES_IN="7d"

# Client URL (your frontend URL - update after deploying frontend)
heroku config:set CLIENT_URL="https://your-frontend-app.netlify.app"

# Google OAuth (if using)
heroku config:set GOOGLE_CLIENT_ID="your-google-client-id"
heroku config:set GOOGLE_CLIENT_SECRET="your-google-client-secret"
heroku config:set GOOGLE_CALLBACK_URL="https://your-backend-app.herokuapp.com/api/auth/google/callback"

# Stripe
heroku config:set STRIPE_SECRET_KEY="sk_live_your-stripe-secret-key"
heroku config:set STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"

# Cloudinary
heroku config:set CLOUDINARY_CLOUD_NAME="your-cloud-name"
heroku config:set CLOUDINARY_API_KEY="your-api-key"
heroku config:set CLOUDINARY_API_SECRET="your-api-secret"

# Email (for password reset)
heroku config:set SMTP_USER="your-email@gmail.com"
heroku config:set SMTP_PASS="your-app-specific-password"
# OR for custom SMTP:
# heroku config:set SMTP_HOST="smtp.example.com"
# heroku config:set SMTP_PORT="587"
# heroku config:set SMTP_SECURE="false"

# Node Environment
heroku config:set NODE_ENV="production"
```

**View all config vars**:
```bash
heroku config
```

### Step 4: Deploy Backend

1. **Make sure you're in the root directory**:
   ```bash
   cd /path/to/vocabulary-center
   ```

2. **Add Heroku remote** (if not already added):
   ```bash
   heroku git:remote -a vocabulary-center-api
   ```

3. **Deploy to Heroku**:
   ```bash
   git add .
   git commit -m "Prepare for Heroku deployment"
   git push heroku main
   ```
   (Use `master` instead of `main` if your default branch is `master`)

4. **Check deployment logs**:
   ```bash
   heroku logs --tail
   ```

5. **Open your app**:
   ```bash
   heroku open
   ```

Your backend should now be running at: `https://vocabulary-center-api.herokuapp.com`

### Step 5: Update Google OAuth Callback URL

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to APIs & Services > Credentials
3. Edit your OAuth 2.0 Client ID
4. Add authorized redirect URI: `https://your-backend-app.herokuapp.com/api/auth/google/callback`

---

## Part 2: Deploy Frontend

### Option A: Deploy to Netlify (Recommended)

1. **Build your React app locally**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Go to [netlify.com](https://www.netlify.com)** and sign up/login

3. **Drag and drop** the `frontend/build` folder to Netlify, OR

4. **Connect your GitHub repository**:
   - Click "New site from Git"
   - Connect your repository
   - Build settings:
     - **Base directory**: `frontend`
     - **Build command**: `npm run build`
     - **Publish directory**: `frontend/build`

5. **Set Environment Variables** in Netlify:
   - Go to Site settings > Environment variables
   - Add:
     ```
     REACT_APP_API_URL=https://your-backend-app.herokuapp.com/api
     REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
     ```

6. **Deploy**

### Option B: Deploy to Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   cd frontend
   vercel
   ```

3. **Set Environment Variables** in Vercel dashboard:
   - `REACT_APP_API_URL`: `https://your-backend-app.herokuapp.com/api`
   - `REACT_APP_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key

### Option C: Deploy Frontend to Heroku (Alternative)

1. **Create a new Heroku app for frontend**:
   ```bash
   heroku create vocabulary-center-frontend
   ```

2. **Add buildpack**:
   ```bash
   heroku buildpacks:add heroku/nodejs -a vocabulary-center-frontend
   heroku buildpacks:add https://github.com/heroku/heroku-buildpack-static -a vocabulary-center-frontend
   ```

3. **Create `static.json` in root**:
   ```json
   {
     "root": "frontend/build",
     "clean_urls": false,
     "routes": {
       "/**": "index.html"
     }
   }
   ```

4. **Update `package.json` in root**:
   ```json
   {
     "scripts": {
       "heroku-postbuild": "cd frontend && npm install && npm run build"
     }
   }
   ```

5. **Set environment variables**:
   ```bash
   heroku config:set REACT_APP_API_URL="https://your-backend-app.herokuapp.com/api" -a vocabulary-center-frontend
   heroku config:set REACT_APP_STRIPE_PUBLISHABLE_KEY="pk_live_your-key" -a vocabulary-center-frontend
   ```

6. **Deploy**:
   ```bash
   git subtree push --prefix frontend heroku-frontend main
   ```

---

## Part 3: Update Configuration

### Update Backend CLIENT_URL

After deploying your frontend, update the backend's `CLIENT_URL`:

```bash
heroku config:set CLIENT_URL="https://your-frontend-app.netlify.app" -a vocabulary-center-api
```

### Update Frontend API URL

Make sure your frontend's `.env` or environment variables point to your Heroku backend:
```
REACT_APP_API_URL=https://vocabulary-center-api.herokuapp.com/api
```

---

## Part 4: Database Setup

### MongoDB Atlas Setup

1. **Create a MongoDB Atlas account** at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

2. **Create a new cluster** (free tier is fine)

3. **Create a database user**:
   - Database Access > Add New Database User
   - Username and password

4. **Whitelist IP addresses**:
   - Network Access > Add IP Address
   - Add `0.0.0.0/0` to allow all IPs (or specific Heroku IPs)

5. **Get connection string**:
   - Clusters > Connect > Connect your application
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `vocabulary-center`

6. **Set on Heroku**:
   ```bash
   heroku config:set MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/vocabulary-center"
   ```

---

## Part 5: Post-Deployment Checklist

- [ ] Backend is running on Heroku
- [ ] Frontend is deployed (Netlify/Vercel/Heroku)
- [ ] Environment variables are set correctly
- [ ] MongoDB Atlas is connected
- [ ] Google OAuth callback URL is updated
- [ ] Stripe keys are set (use live keys for production)
- [ ] Cloudinary is configured
- [ ] Email SMTP is configured (for password reset)
- [ ] Test user registration
- [ ] Test user login
- [ ] Test Google OAuth (if enabled)
- [ ] Test password reset
- [ ] Test PDF purchase flow
- [ ] Test PDF download

---

## Troubleshooting

### Backend won't start

1. **Check logs**:
   ```bash
   heroku logs --tail -a vocabulary-center-api
   ```

2. **Check Procfile** is correct

3. **Check environment variables**:
   ```bash
   heroku config -a vocabulary-center-api
   ```

### CORS errors

Make sure `CLIENT_URL` in backend matches your frontend URL exactly.

### Database connection errors

1. Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`
2. Verify connection string is correct
3. Check database user credentials

### Build fails

1. Check Node.js version in `package.json`:
   ```json
   "engines": {
     "node": "18.x"
   }
   ```

2. Check build logs:
   ```bash
   heroku logs --tail -a vocabulary-center-api
   ```

---

## Useful Heroku Commands

```bash
# View logs
heroku logs --tail -a vocabulary-center-api

# Open app
heroku open -a vocabulary-center-api

# Run commands
heroku run node backend/seed.js -a vocabulary-center-api

# Restart app
heroku restart -a vocabulary-center-api

# View config vars
heroku config -a vocabulary-center-api

# Set config var
heroku config:set KEY=value -a vocabulary-center-api

# Remove config var
heroku config:unset KEY -a vocabulary-center-api
```

---

## Cost

- **Heroku**: Free tier available (with limitations), then $7/month for Hobby dyno
- **MongoDB Atlas**: Free tier available (512MB storage)
- **Netlify**: Free tier available
- **Vercel**: Free tier available
- **Cloudinary**: Free tier available (25GB storage)

---

## Next Steps

After deployment:
1. Test all functionality
2. Set up custom domains (optional)
3. Enable HTTPS (automatic on Heroku/Netlify/Vercel)
4. Set up monitoring and error tracking
5. Configure backups for MongoDB

Good luck with your deployment! 🚀

