# MSG91 SMS OTP Troubleshooting Guide

## Current Status
✅ **API Integration**: Working correctly
✅ **Authentication**: Credentials validated
✅ **Request Success**: MSG91 API returning success response
❌ **SMS Delivery**: Not reaching phone

## Why You're Not Receiving SMS

### 1. **MSG91 Account Status** (Most Likely Issue)
Your MSG91 account might be in TEST/DEMO mode or needs recharging.

**Solution:**
1. Login to MSG91 dashboard: https://control.msg91.com/
2. Check "Credits" - You need credits to send actual SMS
3. Add credits by recharging your account
4. Verify account is in LIVE mode (not TEST mode)

### 2. **DND (Do Not Disturb) Protection**
If your number (9313692958) is registered under DND, promotional SMS won't be delivered.

**Solution:**
- Check DND status: Send SMS "STATUS" to 1909
- Disable DND: Send "START 0" to 1909
- Wait 7 days for DND removal to complete
- OR: Use Transactional route (requires template approval)

### 3. **Sender ID Not Approved**
Your Sender ID `1F8218980B5B4050BD1B19824C9CE38C` needs TRAI approval.

**Solution:**
1. Go to MSG91 Dashboard → Sender IDs
2. Submit sender ID for approval (takes 2-7 days)
3. Use pre-approved sender ID like "MSGIND" for testing
4. Update `.env`: `MSG91_SENDER_ID=MSGIND`

### 4. **Template Not Configured**
MSG91 OTP API might require template configuration.

**Solution:**
1. Go to MSG91 Dashboard → OTP
2. Create OTP template
3. Get template ID and update `.env`

## Current Configuration

```env
SMS_PROVIDER=msg91
MSG91_AUTH_KEY=80DFCBE50DEF4FAFA80F47953B01AC5E
MSG91_SENDER_ID=1F8218980B5B4050BD1B19824C9CE38C
MSG91_TEMPLATE_ID=1F8218980B5B4050BD1B19824C9CE38C
MSG91_USER_ID=4645576E2619
```

## Testing Steps

### 1. Check MSG91 Dashboard
```
URL: https://control.msg91.com/
- Check Credits Balance
- Check Account Status (Active/Suspended)
- Check Recent SMS Log
- Verify Sender ID Status
```

### 2. Test with MSG91's Test Number
MSG91 provides test numbers for development:
- Try sending OTP to MSG91's test number first
- Check if it appears in MSG91 logs

### 3. Check Backend Logs
The backend logs the OTP code to console:
```bash
📱 OTP Code: 614516
```
You can use this code to verify even if SMS doesn't arrive.

### 4. Alternative Testing Methods

#### Option A: Use Different Phone Number
Try a different number not on DND:
```bash
curl -X POST http://localhost:5000/api/v1/otp/send-sms \
  -H "Content-Type: application/json" \
  -d '{"phone": "DIFFERENT_NUMBER"}'
```

#### Option B: Bypass OTP (Development Only)
For testing, you can temporarily bypass OTP verification:
1. Check console logs for OTP code
2. Use that code directly in verification
3. Don't deploy this to production!

## Recommended Immediate Actions

### 1. **Check MSG91 Credits** (5 minutes)
```
1. Visit: https://control.msg91.com/
2. Login with your credentials
3. Click "Credits" or "Wallet"
4. If balance is 0, add ₹100 for testing
```

### 2. **Enable SMS Logging** (Already Done ✅)
Your backend logs OTP to console for testing.

### 3. **Test Email OTP Instead**
For email, you need Gmail App Password:
```
1. Visit: https://myaccount.google.com/apppasswords
2. Login: chiragkumar.patel@iitgn.ac.in
3. Create App Password for "Mail"
4. Update .env: EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
5. Restart backend
```

## Current Workaround

**Use Console OTP for Testing:**
1. Send OTP request (email or SMS)
2. Check backend terminal logs
3. Copy the 6-digit OTP code from logs
4. Use it to verify in frontend

Example from logs:
```
📧 EMAIL OTP - FAST LOAN VERIFICATION
============================================================
🔐 OTP Code: 115101  ← Use this to verify
⏰ Valid for: 1 minute
============================================================
```

## Quick Fix Options

### Option 1: Add MSG91 Credits (Recommended)
- Ensures real SMS delivery
- Professional solution
- Cost: ~₹0.10 per SMS

### Option 2: Use Gmail for OTP
- Setup App Password
- Reliable email delivery
- Free

### Option 3: Development Mode
- Use console-logged OTP
- For testing only
- Already working!

## Need Help?

**MSG91 Support:**
- Email: support@msg91.com
- Phone: +91-9650802090
- Dashboard: https://control.msg91.com/

**Our Backend Logs:**
Check `/home/chirag/Fast_Loan/backend` terminal for:
- OTP codes
- API responses
- Error messages

---

**Status Update:** Your integration is **technically correct**. The issue is with MSG91 account configuration, not your code. Check credits and account status first!
