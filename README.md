# Vocabulary Center - MERN Stack Ecommerce Application

A complete MERN stack ecommerce web application for selling downloadable language vocabulary PDFs. Built with React, Node.js, Express, MongoDB, JWT authentication, Google OAuth, Stripe payments, and Cloudinary file storage.

## Features

### Public Features
- Browse all PDFs without login
- Search PDFs by title
- Filter by language
- Sort by price (low to high, high to low) or newest
- View PDF details with preview
- Responsive design with Tailwind CSS

### Authentication
- Email/password registration and login
- Google OAuth integration
- JWT-based authentication
- Protected routes
- Role-based access control (user/admin)

### Customer Features
- User dashboard showing purchased PDFs
- Secure PDF download (only after purchase)
- Order history
- Purchase date tracking

### Admin Features
- Admin dashboard
- Create, edit, and delete PDF products
- Upload cover images and PDF files to Cloudinary
- Protected admin routes

### Payment Integration
- Stripe Checkout integration
- Secure payment processing
- Order verification
- Prevent duplicate purchases

## Tech Stack

### Frontend
- React 18
- React Router 6
- Tailwind CSS
- Stripe.js
- Axios

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Passport.js (Google OAuth)
- Stripe API
- Cloudinary (file storage)
- Bcrypt (password hashing)

## Project Structure

```
vocabulary-center/
├── backend/
│   ├── config/
│   │   └── passport.js          # Google OAuth configuration
│   ├── middleware/
│   │   └── auth.js               # JWT authentication & admin middleware
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── PDF.js               # PDF product model
│   │   └── Order.js             # Order model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── pdfs.js              # PDF CRUD routes
│   │   ├── orders.js            # Order & Stripe routes
│   │   └── download.js          # Secure download route
│   ├── utils/
│   │   └── cloudinary.js        # Cloudinary configuration
│   ├── seed.js                  # Database seed script
│   ├── server.js                # Express server
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── PrivateRoute.js
│   │   │   └── AdminRoute.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── PDFDetails.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── AdminCreatePDF.js
│   │   │   ├── AdminEditPDF.js
│   │   │   ├── CheckoutSuccess.js
│   │   │   └── CheckoutCancel.js
│   │   ├── utils/
│   │   │   └── api.js           # API utility functions
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── .gitignore
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Cloudinary account
- Stripe account
- Google OAuth credentials (for Google login)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in backend directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/vocabulary-center

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Client URL
CLIENT_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=/api/auth/google/callback

# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (for password reset)
# Option 1: Gmail (requires app-specific password)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password

# Option 2: Custom SMTP
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your-email@example.com
# SMTP_PASS=your-password
# SMTP_FROM=noreply@vocabulary-center.com
```

4. Start MongoDB (if running locally):
```bash
mongod
```

5. Seed the database (optional):
```bash
node seed.js
```

6. Start the backend server:
```bash
npm run dev
# or
npm start
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
```

4. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

### Running Both Servers

From the root directory:
```bash
npm run dev
```

This will start both backend and frontend concurrently.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### PDFs
- `GET /api/pdfs` - Get all PDFs (with search, filter, sort, pagination)
- `GET /api/pdfs/:id` - Get single PDF
- `GET /api/pdfs/languages/list` - Get all languages
- `POST /api/pdfs` - Create PDF (Admin only)
- `PUT /api/pdfs/:id` - Update PDF (Admin only)
- `DELETE /api/pdfs/:id` - Delete PDF (Admin only)

### Orders
- `POST /api/orders/create-checkout-session` - Create Stripe checkout session
- `POST /api/orders/verify-payment` - Verify payment and create order
- `GET /api/orders/my-orders` - Get user's orders

### Download
- `GET /api/download/:pdfId` - Get secure download URL (requires purchase)

## Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  googleId: String (optional),
  role: String ('user' | 'admin'),
  purchasedPdfs: [ObjectId]
}
```

### PDF
```javascript
{
  title: String,
  language: String,
  price: Number,
  description: String,
  coverImageUrl: String,
  pdfFileUrl: String,
  createdAt: Date
}
```

### Order
```javascript
{
  userId: ObjectId,
  pdfId: ObjectId,
  paymentIntentId: String,
  amount: Number,
  status: String ('pending' | 'completed' | 'failed'),
  createdAt: Date
}
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected routes (client and server-side)
- Secure PDF download (server-side authorization)
- Admin-only routes with middleware
- Environment variables for sensitive data
- httpOnly cookies for token storage (optional)

## State Management

This application uses **local component state only** (useState, useEffect). No global state management libraries (Redux, Context API) are used. All state is managed at the component level.

## Payment Flow

1. User clicks "Buy Now" on PDF details page
2. Frontend creates Stripe checkout session via backend
3. User is redirected to Stripe Checkout
4. After payment, user is redirected to success page
5. Backend verifies payment and creates order
6. PDF is added to user's purchased list
7. User can download PDF from dashboard

## Deployment

### Heroku Deployment

**Two deployment methods available:**

1. **Web-based (No CLI required)**: See [HEROKU_WEB_DEPLOYMENT.md](./HEROKU_WEB_DEPLOYMENT.md) - Recommended for beginners!
2. **Command Line**: See [HEROKU_DEPLOYMENT.md](./HEROKU_DEPLOYMENT.md)

**Quick Steps:**
1. Install Heroku CLI and login
2. Create Heroku app: `heroku create your-app-name`
3. Set environment variables: `heroku config:set KEY=value`
4. Deploy: `git push heroku main`
5. Deploy frontend to Netlify/Vercel (recommended) or Heroku

### Other Platforms

**Backend**: Deploy to Railway, Render, or Heroku
**Frontend**: Deploy to Vercel, Netlify, or Heroku

See [HEROKU_DEPLOYMENT.md](./HEROKU_DEPLOYMENT.md) for complete deployment guide.

## Sample Admin Credentials

After running `seed.js`:
- Email: `admin@vocabulary.com`
- Password: `admin123`

## Notes

- Replace all placeholder API keys and secrets with your actual credentials
- Use Stripe test keys for development
- Configure Google OAuth redirect URIs in Google Cloud Console
- Set up Cloudinary account for file storage
- MongoDB can be local or MongoDB Atlas

## License

ISC

