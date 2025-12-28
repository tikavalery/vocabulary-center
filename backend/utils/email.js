const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  // For development, use Gmail or another SMTP service
  // For production, use a service like SendGrid, Mailgun, or AWS SES
  
  // If SMTP credentials are provided, use them
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const isProduction = process.env.NODE_ENV === 'production';
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // In development, ignore self-signed certificates
      tls: {
        rejectUnauthorized: isProduction
      }
    });
  }
  
  // Default: Use Gmail (requires app-specific password)
  // For Gmail, you need to:
  // 1. Enable 2-factor authentication
  // 2. Generate an app-specific password
  // 3. Use that password in SMTP_PASS
  // Note: If you don't want to configure Gmail, just remove SMTP_USER and SMTP_PASS
  // and the reset link will be logged to console in development mode
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const isProduction = process.env.NODE_ENV === 'production';
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // In development, ignore self-signed certificates
      tls: {
        rejectUnauthorized: isProduction
      }
    });
  }
  
  // If no email config, return null
  // The calling function will handle logging in development mode
  return null;
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  const transporter = createTransporter();
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;

  // If email is not configured, log the reset link for development
  if (!transporter) {
    // Check if we're in production mode (explicitly check for 'production')
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      // In production, email MUST be configured
      const errorMsg = 'Email service not configured. Please configure SMTP settings in your .env file.';
      console.error('❌ ' + errorMsg);
      throw new Error(errorMsg);
    } else {
      // Development mode: log the reset link to console instead of sending email
      console.log('\n' + '='.repeat(50));
      console.log('📧 PASSWORD RESET LINK (Development Mode - Email not configured)');
      console.log('='.repeat(50));
      console.log(`Email: ${email}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log(`Token: ${resetToken}`);
      console.log('='.repeat(50));
      console.log('\n⚠️  To enable actual email sending, configure SMTP settings in your .env file:');
      console.log('   For Gmail: SMTP_USER=your-email@gmail.com and SMTP_PASS=your-app-password');
      console.log('   For custom SMTP: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS\n');
      // Return successfully - don't throw error in development
      return { messageId: 'dev-mode-logged', success: true };
    }
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@vocabulary-center.com',
    to: email,
    subject: 'Password Reset Request - Vocabulary Center',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Password Reset Request</h2>
        <p>You requested to reset your password for your Vocabulary Center account.</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #6b7280; word-break: break-all;">${resetUrl}</p>
        <p style="color: #6b7280; font-size: 12px;">
          This link will expire in 1 hour. If you didn't request this, please ignore this email.
        </p>
      </div>
    `,
    text: `
      Password Reset Request
      
      You requested to reset your password for your Vocabulary Center account.
      
      Click this link to reset your password:
      ${resetUrl}
      
      This link will expire in 1 hour. If you didn't request this, please ignore this email.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    return info;
  } catch (error) {
    // If email fails, log the error but also log the reset link for development
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (!isProduction) {
      // In development, log the reset link even if email fails
      console.log('\n' + '='.repeat(50));
      console.log('⚠️  Email sending failed, but here is the reset link:');
      console.log('='.repeat(50));
      console.log(`Email: ${email}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log(`Token: ${resetToken}`);
      console.log('='.repeat(50));
      console.log(`\nError details: ${error.message}`);
      
      // Provide specific guidance based on error type
      if (error.message.includes('BadCredentials') || error.message.includes('Invalid login') || error.message.includes('Username and Password not accepted')) {
        console.log('\n💡 Gmail Authentication Error (Feature still works!):');
        console.log('   The password reset feature is working - you can use the link above.');
        console.log('   To enable email sending, fix your Gmail credentials:');
        console.log('   1. Go to https://myaccount.google.com/apppasswords');
        console.log('   2. Enable 2-factor authentication if not already enabled');
        console.log('   3. Generate an app-specific password (not your regular password!)');
        console.log('   4. Update backend/.env: SMTP_PASS=your-app-specific-password');
        console.log('   5. Or remove SMTP_USER and SMTP_PASS to just use console logging\n');
      } else if (error.message.includes('certificate') || error.message.includes('SSL') || error.message.includes('TLS')) {
        console.log('Note: SSL certificate issue detected. This should be handled automatically in development mode.\n');
      } else {
        console.log('Note: Check your SMTP settings in your .env file.\n');
      }
      
      console.log('✅ Password reset is working! Copy the Reset URL above to test it.\n');
      
      // Return success in development mode even if email fails
      return { messageId: 'dev-mode-logged-after-error', success: true, error: error.message };
    } else {
      // In production, throw the error
      console.error('❌ Error sending password reset email:', error);
      throw error;
    }
  }
};

module.exports = {
  sendPasswordResetEmail,
};

