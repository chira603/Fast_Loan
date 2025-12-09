# OTP Verification Setup Guide

## Overview
The Fast Loan application now includes OTP (One-Time Password) verification for email and phone number during registration. This ensures that users verify their contact information before completing registration.

## Features
- ✅ Email OTP verification (Required)
- ✅ SMS OTP verification (Optional, if phone provided)
- ✅ 6-digit OTP codes
- ✅ 5-minute expiration time
- ✅ Resend OTP functionality with 60-second cooldown
- ✅ Console logging for development (when email/SMS not configured)

## Environment Configuration

### Email OTP Setup

To enable email OTP sending, add these variables to `backend/.env`:

```env
# Email Configuration (for OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

#### Gmail Setup:
1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Generate an **App Password**:
   - Go to Security → 2-Step Verification → App passwords
   - Select "Mail" and your device
   - Copy the generated 16-character password
4. Use this app password as `EMAIL_PASSWORD` in `.env`

#### Other Email Providers:
- **SendGrid**: Use SendGrid SMTP (smtp.sendgrid.net, port 587)
- **Mailgun**: Use Mailgun SMTP (smtp.mailgun.org, port 587)
- **AWS SES**: Use SES SMTP endpoint

### SMS OTP Setup

The application supports two SMS providers:

#### Option 1: Twilio (International)

```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

Setup:
1. Sign up at [twilio.com](https://www.twilio.com)
2. Get your Account SID and Auth Token from the dashboard
3. Buy a phone number or use trial number
4. Install Twilio package: `cd backend && npm install twilio`

#### Option 2: MSG91 (India)

```env
SMS_PROVIDER=msg91
MSG91_AUTH_KEY=your_auth_key
MSG91_SENDER_ID=your_sender_id
MSG91_TEMPLATE_ID=your_template_id
```

Setup:
1. Sign up at [msg91.com](https://msg91.com)
2. Get your Auth Key from the dashboard
3. Create a sender ID
4. Create an OTP template
5. Install axios (already included)

#### Option 3: Console Mode (Development)

If no SMS provider is configured, OTPs will be logged to the console:

```env
SMS_PROVIDER=console
```

## Database Setup

Run the migration to create the OTPs table:

```bash
cd backend
npm run migrate
```

Or manually run the SQL from `database/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS otps (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100),
    phone VARCHAR(20),
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT email_or_phone_required CHECK (email IS NOT NULL OR phone IS NOT NULL)
);
```

## Testing the Flow

### Development Testing (Console Mode)

1. Start the backend: `cd backend && npm run dev`
2. Start the frontend: `npm run dev`
3. Go to registration page: `http://localhost:3000/register`
4. Fill in the form and submit
5. Check the backend console for OTP codes:
   ```
   ========================================
   📧 EMAIL OTP (Console Mode)
   ========================================
   To: user@example.com
   OTP Code: 123456
   ========================================

   ========================================
   📱 SMS OTP (Console Mode)
   ========================================
   To: +91 98765 43210
   OTP Code: 654321
   ========================================
   ```
6. Enter the OTP codes shown in the console
7. Complete registration

### Production Testing (With Email/SMS)

1. Configure EMAIL_USER and EMAIL_PASSWORD in backend/.env
2. (Optional) Configure SMS provider credentials
3. Restart the backend server
4. Register with a real email address
5. Check your email for the OTP
6. If phone provided, check your SMS for the OTP
7. Enter OTP codes and complete registration

## API Endpoints

### Send Email OTP
```http
POST /api/v1/otp/send-email
Content-Type: application/json

{
  "email": "user@example.com",
  "userName": "John Doe"
}
```

### Send SMS OTP
```http
POST /api/v1/otp/send-sms
Content-Type: application/json

{
  "phone": "+919876543210"
}
```

### Verify Email OTP
```http
POST /api/v1/otp/verify-email
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Verify SMS OTP
```http
POST /api/v1/otp/verify-sms
Content-Type: application/json

{
  "phone": "+919876543210",
  "otp": "654321"
}
```

### Resend Email OTP
```http
POST /api/v1/otp/resend-email
Content-Type: application/json

{
  "email": "user@example.com",
  "userName": "John Doe"
}
```

### Resend SMS OTP
```http
POST /api/v1/otp/resend-sms
Content-Type: application/json

{
  "phone": "+919876543210"
}
```

## Security Features

1. **Expiration**: OTPs expire after 5 minutes
2. **One-time use**: OTPs are marked as verified after successful use
3. **Rate limiting**: 60-second cooldown between resend requests
4. **Verification required**: Registration requires verified email/phone
5. **Database validation**: Checks OTP records before allowing registration

## Troubleshooting

### Email OTP not received
- Check spam/junk folder
- Verify EMAIL_USER and EMAIL_PASSWORD are correct
- For Gmail, ensure App Password is used (not regular password)
- Check backend console for email sending errors

### SMS OTP not received
- Verify phone number format includes country code (+91 for India)
- Check SMS provider credits/balance
- Verify SMS provider credentials
- Check backend console for SMS sending errors

### OTP Verification fails
- OTP expires after 5 minutes - request a new one
- Ensure OTP is exactly 6 digits
- Check that email/phone matches what was used to request OTP
- OTPs are case-sensitive

### Console Mode
- If no email/SMS configuration found, app falls back to console mode
- OTPs will be printed in the backend terminal
- This is perfect for development and testing

## Production Recommendations

1. **Use a transactional email service** (SendGrid, Mailgun, AWS SES)
2. **Use a reliable SMS provider** (Twilio for international, MSG91 for India)
3. **Set up email templates** with your branding
4. **Monitor OTP delivery rates**
5. **Set up alerts for failed deliveries**
6. **Consider implementing rate limiting** on OTP requests per IP
7. **Add CAPTCHA** to prevent automated OTP requests

## Cost Considerations

### Email
- Gmail: Free (with app password)
- SendGrid: Free tier (100 emails/day)
- Mailgun: Free tier (5000 emails/month for 3 months)
- AWS SES: $0.10 per 1000 emails

### SMS
- Twilio: Pay as you go (~$0.0075 per SMS in India)
- MSG91: Starts at ₹0.15 per SMS
- Consider SMS only for critical verifications

## Future Enhancements

- [ ] Add biometric authentication option
- [ ] Implement WhatsApp OTP (via Twilio/MSG91)
- [ ] Add backup codes for account recovery
- [ ] Implement 2FA for login
- [ ] Add OTP attempt limiting (max 3-5 attempts)
- [ ] Store OTP delivery status and metrics
