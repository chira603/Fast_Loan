const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // Create transporter using environment variables
    // For development, you can use services like Gmail, SendGrid, or Ethereal
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    const emailConfig = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    };

    // Only create transporter if credentials are provided
    if (emailConfig.auth.user && emailConfig.auth.pass) {
      this.transporter = nodemailer.createTransport(emailConfig);
    } else {
      console.warn('Email service not configured. Please add EMAIL_USER and EMAIL_PASSWORD to .env');
    }
  }

  // Send OTP email
  async sendOTP(email, otpCode, userName = 'User') {
    if (!this.transporter) {
      console.log(`[EMAIL SERVICE] Would send OTP ${otpCode} to ${email}`);
      console.log('Email service not configured. Configure EMAIL_USER and EMAIL_PASSWORD in .env to send actual emails.');
      return { success: false, message: 'Email service not configured' };
    }

    const mailOptions = {
      from: `"Fast Loan" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP for Fast Loan Registration',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Fast Loan</h1>
              <p>Verify Your Registration</p>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>
              <p>Thank you for registering with Fast Loan! To complete your registration, please use the following One-Time Password (OTP):</p>
              
              <div class="otp-box">
                <p style="margin: 0; color: #666;">Your OTP Code</p>
                <div class="otp-code">${otpCode}</div>
              </div>
              
              <div class="warning">
                <strong>⏰ This OTP will expire in 5 minutes.</strong><br>
                Please enter it on the registration page to verify your email address.
              </div>
              
              <p>If you didn't request this OTP, please ignore this email or contact our support team if you have concerns.</p>
              
              <p>Best regards,<br>The Fast Loan Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Fast Loan. All rights reserved.</p>
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Fast Loan - Email Verification
        
        Hello ${userName},
        
        Your OTP for registration is: ${otpCode}
        
        This OTP will expire in 5 minutes.
        
        If you didn't request this OTP, please ignore this email.
        
        Best regards,
        Fast Loan Team
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('OTP email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending OTP email:', error);
      throw new Error('Failed to send OTP email');
    }
  }

  // Send welcome email after successful registration
  async sendWelcomeEmail(email, userName) {
    if (!this.transporter) {
      console.log(`[EMAIL SERVICE] Would send welcome email to ${email}`);
      return { success: false, message: 'Email service not configured' };
    }

    const mailOptions = {
      from: `"Fast Loan" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Fast Loan!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #667eea; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Fast Loan!</h1>
            </div>
            <div class="content">
              <h2>Hello ${userName},</h2>
              <p>Congratulations! Your account has been successfully created.</p>
              
              <h3>What you can do now:</h3>
              <div class="feature">✓ Apply for loans up to ₹5,00,000</div>
              <div class="feature">✓ Track your loan applications</div>
              <div class="feature">✓ Make EMI payments easily</div>
              <div class="feature">✓ Manage your profile and documents</div>
              
              <p>Get started by logging in to your account and exploring our services!</p>
              
              <p>Best regards,<br>The Fast Loan Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw error for welcome email, as it's not critical
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
