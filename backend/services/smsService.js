// SMS Service for sending OTP via SMS
// You can integrate with Twilio, MSG91, or other SMS providers

class SmsService {
  constructor() {
    this.provider = process.env.SMS_PROVIDER || 'console'; // 'twilio', 'msg91', or 'console'
    this.initializeProvider();
  }

  initializeProvider() {
    if (this.provider === 'twilio') {
      // Twilio configuration
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      
      if (accountSid && authToken) {
        try {
          const twilio = require('twilio');
          this.client = twilio(accountSid, authToken);
          this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
          console.log('Twilio SMS service initialized');
        } catch (error) {
          console.warn('Twilio package not installed. Run: npm install twilio');
          this.provider = 'console';
        }
      } else {
        console.warn('Twilio credentials not configured. SMS will be logged to console.');
        this.provider = 'console';
      }
    } else if (this.provider === 'msg91') {
      // MSG91 configuration (popular in India)
      const authKey = process.env.MSG91_AUTH_KEY;
      const senderId = process.env.MSG91_SENDER_ID;
      
      if (authKey && senderId) {
        this.msg91AuthKey = authKey;
        this.msg91SenderId = senderId;
        console.log('MSG91 SMS service initialized');
      } else {
        console.warn('MSG91 credentials not configured. SMS will be logged to console.');
        this.provider = 'console';
      }
    } else {
      console.warn('SMS service not configured. SMS will be logged to console.');
      console.log('To enable SMS, set SMS_PROVIDER=twilio or SMS_PROVIDER=msg91 in .env');
    }
  }

  // Send OTP via SMS
  async sendOTP(phone, otpCode) {
    const message = `Fast Loan Verification\n\nYour OTP: ${otpCode}\n\nValid for 1 minute only.\n\nDo not share this code with anyone.\n\n- Fast Loan Team`;

    if (this.provider === 'twilio') {
      return await this.sendViaTwilio(phone, message);
    } else if (this.provider === 'msg91') {
      return await this.sendViaMSG91(phone, otpCode);
    } else {
      return this.logToConsole(phone, otpCode);
    }
  }

  // Send via Twilio
  async sendViaTwilio(phone, message) {
    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phone,
      });
      console.log('SMS sent via Twilio:', result.sid);
      return { success: true, messageId: result.sid, provider: 'twilio' };
    } catch (error) {
      console.error('Error sending SMS via Twilio:', error);
      throw new Error('Failed to send OTP via SMS');
    }
  }

  // Send via MSG91
  async sendViaMSG91(phone, otpCode) {
    try {
      const axios = require('axios');
      
      const url = 'https://api.msg91.com/api/v5/otp';
      const payload = {
        template_id: process.env.MSG91_TEMPLATE_ID,
        mobile: phone,
        authkey: this.msg91AuthKey,
        otp: otpCode,
      };

      const response = await axios.post(url, payload, {
        params: {
          authkey: this.msg91AuthKey,
          mobile: phone,
          otp: otpCode,
        },
      });

      console.log('SMS sent via MSG91:', response.data);
      return { success: true, response: response.data, provider: 'msg91' };
    } catch (error) {
      console.error('Error sending SMS via MSG91:', error.response?.data || error.message);
      throw new Error('Failed to send OTP via SMS');
    }
  }

  // Log to console (for development/testing)
  logToConsole(phone, otpCode) {
    console.log('\n========================================');
    console.log('📱 SMS OTP (Console Mode)');
    console.log('========================================');
    console.log(`To: ${phone}`);
    console.log(`OTP Code: ${otpCode}`);
    console.log(`Message: Your Fast Loan verification code is: ${otpCode}`);
    console.log('Valid for: 5 minutes');
    console.log('========================================\n');
    
    return { 
      success: true, 
      provider: 'console',
      message: 'SMS logged to console (configure SMS provider for actual sending)'
    };
  }

  // Verify SMS provider is configured
  isConfigured() {
    return this.provider !== 'console';
  }
}

module.exports = new SmsService();
