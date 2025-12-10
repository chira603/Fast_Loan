# MSG91 OTP Integration - Setup Complete ✅

## Your MSG91 Credentials (Configured)
- **User ID**: 4645576E2619
- **Auth Key**: 80DFCBE50DEF4FAFA80F47953B01AC5E
- **Sender ID / Template ID**: 1F8218980B5B4050BD1B19824C9CE38C
- **Provider**: MSG91

## What's Integrated

### Backend (`backend/services/smsService.js`)
- ✅ SMS_PROVIDER set to `msg91`
- ✅ Sends OTP via MSG91 API v5 (`https://control.msg91.com/api/v5/otp`)
- ✅ OTP expiry set to 1 minute
- ✅ Clean phone number handling (removes spaces/dashes)
- ✅ Beautiful message template with Fast Loan branding
- ✅ Fallback to console mode if MSG91 API fails
- ✅ Detailed logging for debugging

### Frontend (`src/pages/Register.jsx`)
- ✅ Individual "Send OTP" button next to Phone Number field
- ✅ OTP input appears below phone field after sending
- ✅ "Verify" and "Resend" buttons with 60s countdown
- ✅ Visual "Verified ✓" badge when successful
- ✅ Registration disabled until phone verified (if phone provided)

### API Endpoints
- POST `/api/v1/otp/send-sms` - Send OTP to phone
- POST `/api/v1/otp/verify-sms` - Verify phone OTP
- POST `/api/v1/otp/resend-sms` - Resend phone OTP

## OTP Message Format
When users receive the SMS, they'll see:
```
Fast Loan Verification

Your OTP: 123456

Valid for 1 minute only.

Do not share this code with anyone.

- Fast Loan Team
```

## How to Test

### 1. Start Backend
```bash
cd backend
npm install
npm start
```

You should see in console:
```
MSG91 SMS service initialized
🚀 Server running on port 5000
```

### 2. Start Frontend
```bash
cd /home/chirag/Fast_Loan
npm run dev
```

Frontend runs at: http://localhost:5173

### 3. Test Registration Flow
1. Go to http://localhost:5173/register
2. Fill in:
   - Username: test123
   - Full Name: Test User
   - Email: test@example.com (configure EMAIL_* for real email)
   - Phone: 9313692958 (or your test number)
   - Password: test123
3. Click "Send OTP" next to Phone Number
4. Check your phone for SMS from MSG91
5. Enter the 6-digit OTP in the field below phone
6. Click "Verify"
7. You should see "Verified ✓" badge
8. Complete registration

## Important Notes

### Phone Number Format
- Accepts: `9313692958`, `+919313692958`, `+91 9313 692958`
- Backend cleans and formats automatically

### OTP Expiry
- Valid for exactly **1 minute** from send time
- After expiry, user must click "Resend"
- Resend locked by 60s countdown to prevent spam

### MSG91 Template Setup
If MSG91 requires a specific template:
1. Login to MSG91 dashboard
2. Go to Templates → Create OTP Template
3. Use template ID in `MSG91_TEMPLATE_ID`
4. Template variables supported: `VAR1` (OTP), `VAR2` (App Name)

### Email OTP (Still needs setup)
To enable email OTP verification:
1. Update `backend/.env`:
   ```
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   ```
2. For Gmail: Enable 2FA and create App Password
3. Restart backend

## Troubleshooting

### SMS Not Sending
- Check backend console for MSG91 errors
- Verify MSG91 account has credits
- Ensure sender ID is approved
- Check phone number format

### OTP Expired
- Wait 60 seconds and click "Resend"
- Check system time is correct

### Verification Failing
- Ensure OTP entered within 1 minute
- Check for typos in 6-digit code
- Try resending OTP

## API Response Examples

### Success
```json
{
  "success": true,
  "message": "OTP sent to your phone number",
  "expiresIn": "1 minute"
}
```

### Verification Success
```json
{
  "success": true,
  "message": "Phone number verified successfully"
}
```

## Next Steps

1. ✅ MSG91 SMS OTP - **Configured and Ready**
2. ⏳ Configure Gmail SMTP for Email OTP (optional but recommended)
3. ⏳ Test with real phone number
4. ⏳ Customize MSG91 template in dashboard (optional)

---

**Status**: Ready for testing! 🚀

Both email and phone verification are available inline on the registration form with individual Send/Verify buttons as requested.
