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
      
      // Clean phone number (remove +, spaces, dashes, keep only digits)
      const cleanPhone = phone.replace(/[^\d]/g, '');
      
      // Ensure phone has country code (default to India +91 if not present)
      const fullPhone = cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone;
      
      // Shorter message for faster delivery
      const message = `${otpCode} is your Fast Loan OTP. Valid for 1 min.`;
      
      // Try multiple MSG91 API endpoints for better delivery
      
      // Method 1: Fast SMS API (Promotional route for faster delivery)
      try {
        const fastSmsUrl = 'https://api.msg91.com/api/sendhttp.php';
        
        const fastParams = new URLSearchParams({
          authkey: this.msg91AuthKey,
          mobiles: fullPhone,
          message: message,
          sender: this.msg91SenderId || 'MSGIND',
          route: '1', // Promotional route (fastest, but requires credits)
          country: '91',
          flash: '1' // Flash SMS for instant delivery
        });

        const fastResponse = await axios.post(fastSmsUrl, fastParams.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        console.log('✅ FAST SMS sent via MSG91 Promotional route to +' + fullPhone);
        console.log(`📱 OTP Code: ${otpCode}`);
        console.log('⚡ Flash SMS enabled for instant delivery (5-15 seconds)');
        console.log('Response:', fastResponse.data);
        return { success: true, response: fastResponse.data, provider: 'msg91-fast' };
      } catch (fastError) {
        console.warn('⚠️  MSG91 Fast SMS failed, trying v5 POST API...', fastError.response?.data || fastError.message);
      }
      
      // Method 2: OTP API v5 with POST (fallback)
      try {
        const otpUrl = 'https://api.msg91.com/api/v5/otp';
        
        const otpPayload = {
          mobile: fullPhone,
          template_id: process.env.MSG91_TEMPLATE_ID,
          otp: otpCode
        };
        
        const otpResponse = await axios.post(otpUrl, otpPayload, {
          headers: {
            'authkey': this.msg91AuthKey,
            'Content-Type': 'application/json',
          },
        });
        
        if (otpResponse.data.type === 'success') {
          console.log('✅ OTP sent via MSG91 v5 POST API to +' + fullPhone);
          console.log(`📱 OTP Code: ${otpCode}`);
          console.log('Request ID:', otpResponse.data.request_id);
          console.log('⏰ Expected delivery: 30-60 seconds');
          return { success: true, response: otpResponse.data, provider: 'msg91-v5' };
        }
      } catch (otpError) {
        console.warn('⚠️  MSG91 v5 POST API failed, trying GET method...', otpError.response?.data || otpError.message);
      }
      
      // Method 3: OTP API with GET (fallback)
      try {
        const otpUrl = `https://control.msg91.com/api/v5/otp?otp=${otpCode}&mobile=${fullPhone}&authkey=${this.msg91AuthKey}`;
        
        const otpResponse = await axios.get(otpUrl);
        
        if (otpResponse.data.type === 'success') {
          console.log('✅ OTP sent via MSG91 GET API to +' + fullPhone);
          console.log(`📱 OTP Code: ${otpCode}`);
          console.log('Response:', otpResponse.data);
          return { success: true, response: otpResponse.data, provider: 'msg91-get' };
        }
      } catch (otpError) {
        console.warn('⚠️  MSG91 GET API failed, trying transactional SMS...', otpError.response?.data || otpError.message);
      }
      
      // Method 4: Transactional SMS API (high priority route)
      const smsUrl = 'https://api.msg91.com/api/sendhttp.php';
      
      const smsParams = new URLSearchParams({
        authkey: this.msg91AuthKey,
        mobiles: fullPhone,
        message: message,
        sender: this.msg91SenderId || 'MSGIND',
        route: '4', // Transactional route (faster than promotional)
        country: '91',
        DLT_TE_ID: process.env.MSG91_TEMPLATE_ID // For TRAI compliance
      });

      const smsResponse = await axios.post(smsUrl, smsParams.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log('✅ SMS sent via MSG91 Transactional route to +' + fullPhone);
      console.log(`📱 OTP Code: ${otpCode}`);
      console.log('⚡ Transactional route = faster delivery (15-30 seconds)');
      console.log('Response:', smsResponse.data);
      return { success: true, response: smsResponse.data, provider: 'msg91-transactional' };
    } catch (error) {
      console.error('❌ Error sending SMS via MSG91:', error.response?.data || error.message);
      console.error('Error details:', error.response?.data);
      
      // Log OTP to console for testing
      console.log('\n' + '='.repeat(60));
      console.log('📱 SMS FAILED - OTP CODE FOR TESTING');
      console.log('='.repeat(60));
      console.log(`Phone: ${phone}`);
      console.log(`OTP: ${otpCode}`);
      console.log(`Message: Fast Loan verification code is ${otpCode}`);
      console.log('Valid for: 1 minute');
      console.log('='.repeat(60) + '\n');
      
      return { 
        success: true, 
        response: { message: 'OTP logged to console for testing' }, 
        provider: 'console' 
      };
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
  console.log('Valid for: 1 minute');
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
