const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const passport = require('passport');
const path = require('path');



// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ ERROR: Missing required environment variables:');
  missingEnvVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease set these in your Heroku Config Vars or .env file.');
  if (process.env.NODE_ENV === 'production') {
    console.error('The application will not start without these variables.');
    process.exit(1);
  } else {
    console.error('⚠️  Warning: Application may not work correctly without these variables.');
  }
}

// Import routes
const authRoutes = require('./routes/auth');
const pdfRoutes = require('./routes/pdfs');
const orderRoutes = require('./routes/orders');
const downloadRoutes = require('./routes/download');

// Import passport configuration
require('./config/passport');

const app = express();

// Middleware
// CORS configuration - allow requests from CLIENT_URL or same origin
// When frontend is served from same app (production), allow same-origin requests
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (same-origin requests, mobile apps, Postman)
    // This is important when frontend and backend are on the same domain
    if (!origin) {
      return callback(null, true);
    }
    
    // Get allowed origins
    const allowedOrigins = [
      process.env.CLIENT_URL,
      'http://localhost:3000',
      'http://localhost:5000'
    ].filter(Boolean); // Remove undefined values
    
    // If CLIENT_URL is not set (same-origin deployment), allow all origins
    // Otherwise, check if origin is in allowed list
    if (!process.env.CLIENT_URL || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());


// Logging middleware for API routes (development/debugging)
if (process.env.NODE_ENV === 'production') {
  app.use('/api', (req, res, next) => {
    console.log(`[API] ${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pdfs', pdfRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/download', downloadRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    // Don't serve React app for API routes
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ message: 'API route not found' });
    }
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vocabulary-center';

if (!process.env.MONGODB_URI) {
  console.error('⚠️  WARNING: MONGODB_URI not set. Using default local MongoDB.');
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ ERROR: MONGODB_URI must be set in production!');
    console.error('Please set MONGODB_URI in your Heroku Config Vars.');
    process.exit(1);
  }
}

console.log('Attempting to connect to MongoDB...');
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
  });
})
.catch((error) => {
  console.error('❌ MongoDB connection error:');
  console.error('   Error:', error.message);
  if (!process.env.MONGODB_URI) {
    console.error('   MONGODB_URI is not set. Please set it in Heroku Config Vars.');
  } else {
    console.error('   Please check your MONGODB_URI connection string.');
    console.error('   Make sure your MongoDB Atlas IP whitelist includes 0.0.0.0/0');
  }
  console.error('\nThe application cannot start without a database connection.');
  process.exit(1);
});


module.exports = app;

