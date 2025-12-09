# Razorpay Integration Setup Guide

## ✅ What's Been Done

### 1. Backend Integration
- ✅ Installed `razorpay` SDK in backend
- ✅ Created `/backend/services/razorpayService.js` with order creation and verification
- ✅ Added Razorpay routes to `/backend/routes/payments.js`:
  - `POST /api/v1/payments/razorpay/order` - Creates Razorpay order
  - `POST /api/v1/payments/razorpay/verify` - Verifies payment signature
- ✅ Mounted payment routes in `/backend/server.js`

### 2. Frontend Integration
- ✅ Created `/src/services/razorpay.js` with helper functions
- ✅ Added Razorpay Checkout script to `/index.html`
- ✅ Integrated "Pay with Razorpay" buttons in:
  - **Recharge.jsx** - Mobile and DTH recharge
  - **BillPayment.jsx** - Utility bill payments
  - **LoanDetails.jsx** - EMI/loan repayments

### 3. UI Features
Each payment page now has TWO payment options:
1. **Pay via Balance/Wallet** - Existing functionality (uses app balance)
2. **Pay with Razorpay** - New payment gateway integration

---

## 🚀 Setup Steps

### Step 1: Get Razorpay Test Credentials

1. **Create Razorpay Account** (if you don't have one):
   - Go to https://dashboard.razorpay.com/signup
   - Sign up with your email/phone

2. **Get Test API Keys**:
   - Login to https://dashboard.razorpay.com
   - Go to **Settings** → **API Keys**
   - Switch to **Test Mode** (toggle at top)
   - Click **Generate Test Key**
   - You'll get:
     - `Key ID` (starts with `rzp_test_...`)
     - `Key Secret` (click "Show" to reveal)

### Step 2: Configure Backend Environment

Add these keys to `/backend/.env`:

```env
# Razorpay Test Credentials
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXX
```

**⚠️ IMPORTANT**: 
- Use **TEST MODE** keys (starting with `rzp_test_`)
- Never commit these keys to version control
- `.env` should already be in `.gitignore`

### Step 3: Restart Backend Server

```bash
cd backend
npm start
```

The server will load the Razorpay credentials and you should see no warnings.

---

## 🧪 Testing the Integration

### Test Mobile Recharge

1. Navigate to **Recharge** page
2. Enter a 10-digit mobile number (e.g., `9876543210`)
3. Select operator (Airtel/Jio/Vi/BSNL)
4. Choose a recharge plan
5. Click **"Pay with Razorpay"**
6. Razorpay Checkout modal will open
7. Use test card details:

```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: Any future date (e.g., 12/25)
Name: Test User
```

8. Payment should succeed
9. Recharge will be processed

### Test DTH Recharge

Same flow as above but:
1. Select **DTH Recharge** tab
2. Choose DTH operator (Tata Sky, Airtel Digital, etc.)
3. Enter customer ID
4. Select plan
5. Click **"Pay with Razorpay"**

### Test Bill Payment

1. Go to **Bill Payment** page
2. Select category (Electricity/Water/Gas)
3. Choose provider
4. Enter account number
5. Click **"Fetch Bill"**
6. Once bill details appear, click **"Pay with Razorpay"**
7. Use test card details above
8. Payment should complete

### Test Loan EMI Payment

1. Go to **Loans** page
2. Apply for a loan (if needed) and get it approved
3. Click on the loan to view details
4. Scroll to **"Make EMI Payment"** section
5. Enter payment amount (defaults to EMI amount)
6. Click **"Pay with Razorpay"**
7. Complete test payment
8. Check payment history updates

---

## 🧾 Razorpay Test Cards

### Success Cards

```
Card: 4111 1111 1111 1111 (Visa)
Card: 5555 5555 5555 4444 (Mastercard)
Card: 3566 0020 2036 0505 (JCB)
CVV: Any 3 digits
Expiry: Any future date
```

### Failure Cards (to test error handling)

```
Card: 4000 0000 0000 0002 (Declined)
Card: 4000 0000 0000 9995 (Insufficient Funds)
```

### Test UPI

```
UPI ID: success@razorpay
```

### Test Netbanking

- Select any bank
- Use credentials: `test` / `test`

---

## 📊 Verify Payments

### In Razorpay Dashboard

1. Go to https://dashboard.razorpay.com
2. Ensure you're in **Test Mode**
3. Navigate to **Transactions** → **Payments**
4. You should see all test payments with:
   - Order ID
   - Payment ID
   - Amount
   - Status
   - Notes (containing context like loan_id, mobile number, etc.)

### In Your Application

1. Check **Recharge History** button on Recharge page
2. Check **Payments** section on Loan Details page
3. Database tables should have records:
   - `payments` table
   - `recharges` table (for mobile/DTH)
   - `bill_payments` table (for utilities)

---

## 🔒 Payment Flow (Technical)

### For Each Payment Type:

1. **User initiates payment** → Clicks "Pay with Razorpay"
2. **Frontend calls backend** → `POST /api/v1/payments/razorpay/order`
3. **Backend creates order** → Calls Razorpay API, returns order_id
4. **Frontend opens checkout** → Razorpay modal with payment options
5. **User completes payment** → Enters card/UPI/netbanking details
6. **Razorpay processes** → Returns payment_id and signature
7. **Frontend verifies** → `POST /api/v1/payments/razorpay/verify`
8. **Backend validates** → Checks signature with crypto.createHmac
9. **Payment recorded** → Saved to database
10. **Success callback** → Original action completes (recharge/bill/EMI)

---

## 🐛 Troubleshooting

### "Razorpay is not defined" Error

- **Cause**: Checkout script not loaded
- **Fix**: Ensure `<script src="https://checkout.razorpay.com/v1/checkout.js">` is in `/index.html` before `</body>`
- **Verify**: Open browser console and type `window.Razorpay` - should not be undefined

### "Invalid signature" Error

- **Cause**: Mismatched keys or wrong secret
- **Fix**: 
  1. Verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in backend/.env
  2. Ensure they're from the same key pair
  3. Restart backend server

### "Order creation failed" Error

- **Cause**: Backend can't reach Razorpay API or invalid credentials
- **Fix**:
  1. Check internet connection
  2. Verify API keys are correct
  3. Check backend logs for detailed error

### Payment Succeeds but Transaction Not Recorded

- **Cause**: Verification step failed or database error
- **Fix**:
  1. Check backend logs
  2. Verify database tables exist
  3. Check payment verification endpoint response

### Amount Mismatch Errors

- **Cause**: Razorpay expects amount in **paise** (100 paise = 1 rupee)
- **Fix**: Already handled in code - verify `amount * 100` is being sent to Razorpay

---

## 📝 Important Notes

### Test Mode vs Live Mode

- **Test Mode**: Use for development/testing
  - Test keys start with `rzp_test_`
  - No real money transferred
  - Test cards work
  
- **Live Mode**: Use for production
  - Live keys start with `rzp_live_`
  - Real money transferred
  - Requires KYC verification
  - **DO NOT use test cards**

### Going Live

When ready for production:

1. Complete KYC in Razorpay dashboard
2. Get **Live API Keys**
3. Update backend/.env with live keys:
   ```env
   RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXX
   RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXX
   ```
4. Test thoroughly with small amounts
5. Monitor first few transactions closely

### Security Best Practices

✅ **Always verify payment signature on backend** (already implemented)  
✅ **Never expose Key Secret to frontend** (already handled)  
✅ **Use HTTPS in production**  
✅ **Validate amount on backend before creating order**  
✅ **Log all transactions for audit trail**  
❌ **Don't trust client-side payment confirmations alone**

---

## 📚 Additional Resources

- **Razorpay Documentation**: https://razorpay.com/docs/
- **Test Cards**: https://razorpay.com/docs/payments/payments/test-card-details/
- **Payment Gateway Guide**: https://razorpay.com/docs/payments/payment-gateway/
- **Webhooks** (for production): https://razorpay.com/docs/webhooks/

---

## 🎯 Quick Test Checklist

- [ ] Added `RAZORPAY_KEY_ID` to backend/.env
- [ ] Added `RAZORPAY_KEY_SECRET` to backend/.env
- [ ] Restarted backend server
- [ ] Tested mobile recharge with test card
- [ ] Tested DTH recharge with test card
- [ ] Tested bill payment with test card
- [ ] Tested loan EMI payment with test card
- [ ] Verified payment appears in Razorpay dashboard
- [ ] Checked payment recorded in database
- [ ] Tested payment failure scenario

---

**Status**: ✅ Integration Complete - Ready for Testing!

Once you add the API keys and test, you're all set! 🚀
