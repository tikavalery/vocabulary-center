const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Configure Google OAuth Strategy
// The callback URL must be a full URL (not relative) and match Google Cloud Console
const callbackURL = process.env.GOOGLE_CALLBACK_URL || 
  `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`;

// Validate required environment variables
const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientID || !clientSecret) {
  console.error('❌ ERROR: Google OAuth credentials are missing!');
  console.error('Please set the following in your backend/.env file:');
  console.error('  GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com');
  console.error('  GOOGLE_CLIENT_SECRET=your-client-secret');
  console.error('  GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback (optional)');
  console.error('');
  console.error('Google login will not work until these are configured.');
  console.error('See GOOGLE_OAUTH_SETUP.md for detailed setup instructions.');
} else {
  // Check if credentials look valid
  if (!clientID.includes('.apps.googleusercontent.com')) {
    console.warn('⚠️  Warning: GOOGLE_CLIENT_ID does not look like a valid Google Client ID');
    console.warn('It should end with .apps.googleusercontent.com');
  }
  
  console.log('✅ Google OAuth credentials found');
  console.log('   Client ID:', clientID.substring(0, 20) + '...');
  console.log('   Callback URL:', callbackURL);
  console.log('   Make sure this callback URL matches your Google Cloud Console settings!');
}

// Only set up Google Strategy if credentials are provided
if (clientID && clientSecret) {
  passport.use(new GoogleStrategy({
    clientID: clientID,
    clientSecret: clientSecret,
    callbackURL: callbackURL
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId: profile.id });

    if (user) {
      return done(null, user);
    }

    // Check if user exists with same email
    user = await User.findOne({ email: profile.emails[0].value });

    if (user) {
      // Link Google account to existing user
      user.googleId = profile.id;
      await user.save();
      return done(null, user);
    }

    // Create new user
    user = new User({
      name: profile.displayName,
      email: profile.emails[0].value,
      googleId: profile.id,
      role: 'user'
    });

    await user.save();
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
  }));
} else {
  // Create a dummy strategy that will fail gracefully
  console.warn('⚠️  Google OAuth strategy not initialized due to missing credentials');
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

