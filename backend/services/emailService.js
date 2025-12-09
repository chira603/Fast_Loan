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
      // Console mode with beautiful formatting
      console.log('\n' + '='.repeat(60));
      console.log('📧 EMAIL OTP - FAST LOAN VERIFICATION');
      console.log('='.repeat(60));
      console.log(`👤 Recipient: ${userName}`);
      console.log(`📧 Email: ${email}`);
      console.log(`🔐 OTP Code: ${otpCode}`);
      console.log(`⏰ Valid for: 1 minute`);
      console.log(`📝 Message: Use this OTP to verify your email for Fast Loan registration`);
      console.log('='.repeat(60) + '\n');
      return { success: true, message: 'OTP logged to console (email service not configured)' };
    }

    const mailOptions = {
      from: `"Fast Loan" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Your Fast Loan Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #333;
              background-color: #f5f5f5;
              margin: 0;
              padding: 0;
            }
            .container { 
              max-width: 600px; 
              margin: 20px auto; 
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 40px 30px; 
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .header p {
              margin: 10px 0 0 0;
              font-size: 16px;
              opacity: 0.95;
            }
            .content { 
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              color: #333;
              margin-bottom: 20px;
            }
            .otp-container {
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
              border-radius: 12px;
              padding: 30px;
              text-align: center;
              margin: 30px 0;
              border: 3px dashed #667eea;
            }
            .otp-label {
              font-size: 14px;
              color: #666;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 10px;
            }
            .otp-code { 
              font-size: 42px; 
              font-weight: bold; 
              color: #667eea; 
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            }
            .timer {
              margin-top: 15px;
              font-size: 14px;
              color: #e74c3c;
              font-weight: 600;
            }
            .instructions {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px 20px;
              margin: 25px 0;
              border-radius: 4px;
            }
            .instructions strong {
              color: #856404;
            }
            .info-box {
              background: #e7f3ff;
              border-left: 4px solid #2196F3;
              padding: 15px 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer { 
              text-align: center; 
              padding: 30px;
              background: #f8f9fa;
              color: #666;
              font-size: 13px;
              border-top: 1px solid #e0e0e0;
            }
            .footer p {
              margin: 5px 0;
            }
            .security-note {
              background: #fff;
              border: 2px solid #667eea;
              border-radius: 8px;
              padding: 20px;
              margin: 25px 0;
            }
            .security-note h3 {
              color: #667eea;
              margin-top: 0;
              font-size: 16px;
            }
            .security-note ul {
              margin: 10px 0;
              padding-left: 20px;
            }
            .security-note li {
              margin: 8px 0;
              color: #555;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏦 Fast Loan</h1>
              <p>Verify Your Email Address</p>
            </div>
            
            <div class="content">
              <div class="greeting">
                <strong>Hello ${userName},</strong>
              </div>
              
              <p>Thank you for registering with <strong>Fast Loan</strong>! We're excited to have you onboard.</p>
              
              <p>To complete your registration and verify your email address, please use the One-Time Password (OTP) below:</p>
              
              <div class="otp-container">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">${otpCode}</div>
                <div class="timer">⏰ Expires in 1 minute</div>
              </div>
              
              <div class="instructions">
                <strong>⚡ Quick Steps:</strong><br>
                1. Return to the registration page<br>
                2. Enter this OTP code in the verification field<br>
                3. Click "Verify Email OTP" to continue
              </div>
              
              <div class="info-box">
                <strong>ℹ️ Important:</strong> This OTP is valid for only <strong>1 minute</strong>. If it expires, you can request a new one by clicking the "Resend OTP" button.
              </div>
              
              <div class="security-note">
                <h3>🔒 Security Tips</h3>
                <ul>
                  <li>Never share this OTP with anyone</li>
                  <li>Fast Loan staff will never ask for your OTP</li>
                  <li>Only enter this code on the official Fast Loan website</li>
                  <li>If you didn't request this OTP, please ignore this email</li>
                </ul>
              </div>
              
              <p style="margin-top: 30px;">If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
              
              <p style="margin-top: 20px;">Best regards,<br><strong>The Fast Loan Team</strong></p>
            </div>
            
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Fast Loan. All rights reserved.</p>
              <p>This is an automated email. Please do not reply to this message.</p>
              <p style="margin-top: 10px; color: #999; font-size: 11px;">
                Received this email by mistake? Please ignore it.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Fast Loan - Email Verification

Hello ${userName},

Your OTP for registration is: ${otpCode}

This OTP will expire in 1 minute.

Please enter this code on the registration page to verify your email address.

Security Tips:
- Never share this OTP with anyone
- Fast Loan staff will never ask for your OTP
- If you didn't request this, please ignore this email

Best regards,
Fast Loan Team

© ${new Date().getFullYear()} Fast Loan. All rights reserved.
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ OTP email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending OTP email:', error);
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
