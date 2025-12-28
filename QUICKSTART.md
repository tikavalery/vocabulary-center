# Quick Start Guide

## Prerequisites Setup

### 1. MongoDB
- Install MongoDB locally or use MongoDB Atlas (free tier)
- If local: `mongod` to start MongoDB

### 2. Cloudinary Account
1. Sign up at https://cloudinary.com
2. Get your Cloud Name, API Key, and API Secret from dashboard

### 3. Stripe Account
1. Sign up at https://stripe.com
2. Get your test API keys from dashboard
   - Secret Key: `sk_test_...`
   - Publishable Key: `pk_test_...`

### 4. Google OAuth (Optional but Recommended)
1. Go to Google Cloud Console
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`

## Installation Steps

### Step 1: Install Dependencies

From root directory:
```bash
npm run install-all
```

Or manually:
```bash
# Root
npm install

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2: Configure Backend

1. Copy `.env.example` to `.env` in `backend/` directory:
```bash
cd backend
cp .env.example .env
```

2. Edit `backend/.env` with your credentials:
```env
MONGODB_URI=mongodb://localhost:27017/vocabulary-center
JWT_SECRET=your-super-secret-key-here
CLIENT_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
STRIPE_SECRET_KEY=sk_test_your-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Step 3: Configure Frontend

1. Create `.env` file in `frontend/` directory:
```bash
cd frontend
```

2. Create `.env` with:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your-key
```

### Step 4: Seed Database (Optional)

```bash
cd backend
node seed.js
```

This creates:
- Admin user: `admin@vocabulary.com` / `admin123`
- 6 sample PDF products

### Step 5: Start Development Servers

From root directory:
```bash
npm run dev
```

Or separately:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### Step 6: Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Testing the Application

1. **Browse PDFs**: Visit http://localhost:3000
2. **Register**: Create a new account
3. **Login as Admin**: 
   - Email: `admin@vocabulary.com`
   - Password: `admin123`
4. **Create PDF**: Go to Admin Dashboard → Create New PDF
5. **Purchase PDF**: Browse → Click PDF → Buy Now → Use Stripe test card: `4242 4242 4242 4242`
6. **Download**: Go to Dashboard → Download purchased PDFs

## Stripe Test Cards

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Use any future expiry date and any CVC

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env`

### Cloudinary Upload Error
- Verify Cloudinary credentials in `.env`
- Check file size limits (Cloudinary free tier: 10MB)

### Stripe Payment Error
- Use test keys, not live keys
- Verify `REACT_APP_STRIPE_PUBLISHABLE_KEY` in frontend `.env`

### Google OAuth Error
- Check redirect URI matches exactly
- Verify OAuth credentials in backend `.env`

## Production Deployment

1. Update all environment variables with production values
2. Change `NODE_ENV=production`
3. Update `CLIENT_URL` to production frontend URL
4. Use production Stripe keys
5. Build frontend: `cd frontend && npm run build`
6. Deploy backend and frontend separately

