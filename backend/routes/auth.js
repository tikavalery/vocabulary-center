const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { sendPasswordResetEmail } = require('../utils/email');

const router = express.Router();

// Helper function to get frontend URL
// In production, if CLIENT_URL is not set, use the same origin as the request
const getFrontendUrl = (req) => {
  if (process.env.CLIENT_URL) {
    return process.env.CLIENT_URL;
  }
  
  // In production, construct URL from request (same origin)
  if (process.env.NODE_ENV === 'production') {
    const protocol = req.protocol || 'https';
    const host = req.get('host') || req.hostname;
    return `${protocol}://${host}`;
  }
  
  // Development default
  return 'http://localhost:3000';
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Register new user
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({ name, email, password });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Set token in httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token // Also send token in response for localStorage option
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password (skip if user has no password - Google OAuth user)
    if (!user.password) {
      return res.status(401).json({ message: 'Please sign in with Google' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    // Set token in httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token // Also send token in response for localStorage option
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Google OAuth routes
router.get('/google', (req, res, next) => {
  // Check if Google OAuth is configured
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('Google OAuth request received but credentials are not configured');
    const frontendUrl = getFrontendUrl(req);
    return res.redirect(`${frontendUrl}/login?error=oauth_not_configured`);
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback',
  (req, res, next) => {
    // Check if Google OAuth is configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error('Google OAuth callback received but credentials are not configured');
      const frontendUrl = getFrontendUrl(req);
      return res.redirect(`${frontendUrl}/login?error=oauth_not_configured`);
    }
    passport.authenticate('google', { session: false, failureRedirect: '/api/auth/google/error' })(req, res, next);
  },
  async (req, res) => {
    try {
      if (!req.user) {
        throw new Error('No user returned from Google OAuth');
      }

      const user = req.user;
      
      // Generate token
      const token = generateToken(user._id);

      // Set token in httpOnly cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Redirect to frontend with token
      const frontendUrl = getFrontendUrl(req);
      res.redirect(`${frontendUrl}/auth/google/callback?token=${token}`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      const frontendUrl = getFrontendUrl(req);
      res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
  }
);

// Error route for OAuth failures
router.get('/google/error', (req, res) => {
  const frontendUrl = getFrontendUrl(req);
  res.redirect(`${frontendUrl}/login?error=oauth_failed`);
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Forgot password - Request password reset
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    
    // Always return success message to prevent email enumeration
    // Don't reveal if email exists or not
    if (!user) {
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    // Check if user has a password (not Google OAuth only)
    if (!user.password) {
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Save token and expiration (1 hour)
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Send reset email
    try {
      const emailResult = await sendPasswordResetEmail(user.email, resetToken);
      
      // Check if email was actually sent or just logged (dev mode)
      if (emailResult && emailResult.messageId === 'dev-mode-logged') {
        console.log('✅ Password reset link logged to console (development mode)');
      }
      
      // Always return success message (for security, don't reveal if email exists)
      res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    } catch (emailError) {
      // If email fails in production, clear the token
      if (process.env.NODE_ENV === 'production') {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
      } else {
        // In development, even if email fails, log the token so user can still reset
        const frontendUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
        console.log('\n⚠️  Email sending failed, but here is the reset link:');
        console.log(`Reset URL: ${resetUrl}`);
        console.log(`Token: ${resetToken}\n`);
      }
      
      console.error('Error sending password reset email:', emailError);
      return res.status(500).json({ 
        message: 'Failed to send reset email. Please try again later.' 
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing request', error: error.message });
  }
});

// Reset password - Verify token and update password
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;

    // Hash the token to compare with stored hash
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid token and not expired
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token. Please request a new password reset.' 
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully. You can now login with your new password.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
});

module.exports = router;

