# Quick Test Guide - Razorpay Integration

## ✅ Razorpay Test Credentials Active

Your application is now configured with Razorpay test credentials and ready for testing!

## Quick Start Testing

### 1. Start the Application

```bash
# Terminal 1: Backend
cd /home/chirag/Test/Fast_Loan/backend
npm run dev

# Terminal 2: Frontend  
cd /home/chirag/Test/Fast_Loan
npm run dev
```

### 2. Test Payment Features

#### Option A: Mobile Recharge Test

1. Login to the application
2. Navigate to **Recharge** page
3. Select **Mobile Recharge** tab
4. Enter mobile: `9876543210`
5. Select operator: `Airtel`
6. Choose plan: ₹155 or any plan
7. Click **"Pay with Razorpay"** button
8. **Razorpay Checkout opens**
9. Use test card:
   ```
   Card: 4111 1111 1111 1111
   CVV: 123
   Expiry: 12/25
   Name: Test User
   ```
10. Complete payment
11. ✅ Success message appears!

#### Option B: Bill Payment Test

1. Go to **Bill Payment** page
2. Select bill type: `Electricity`
3. Enter consumer number: `123456789`
4. Enter amount: ₹500
5. Click **"Fetch Bill"**
6. Click **"Pay with Razorpay"**
7. Use same test card above
8. ✅ Payment successful!

#### Option C: Loan EMI Payment Test

1. First, **apply for a loan**:
   - Go to **Loan Application**
   - Amount: ₹100,000
   - Tenure: 12 months
   - Submit application

2. **Admin approves loan** (login as admin or manually update in database)

3. Go to **Loan Details** page

4. Click **"Pay 1 EMI"** with Razorpay

5. Complete payment with test card

6. ✅ EMI marked as paid!

### 3. Verify in Backend Console

You should see logs like:
```
Executed query {
  text: 'INSERT INTO payments ...',
  duration: 5,
  rows: 1
}
```

### 4. Test Cards for Different Scenarios

#### ✅ Successful Payment
```
Card: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
```

#### ❌ Payment Failure
```
Card: 4000 0000 0000 0002
CVV: Any 3 digits
Expiry: Any future date
```

#### 💳 Other Test Cards
```
Mastercard: 5555 5555 5555 4444
Visa: 4012 8888 8888 1881
Amex: 3782 822463 10005
```

#### 📱 UPI Test
```
UPI ID: success@razorpay
```

#### 🏦 Net Banking
```
Select: Any bank
Username: success
Password: success
```

## Expected Results

### After Successful Payment:

1. ✅ Green toast: "Payment successful!"
2. ✅ Database updated (check backend console)
3. ✅ For recharge: Balance deducted/recharged
4. ✅ For loans: EMI status updated to "paid"
5. ✅ Razorpay dashboard shows transaction

### After Failed Payment:

1. ❌ Red toast: "Payment failed"
2. ⚠️ No database entry
3. ℹ️ User can retry payment

## Checking Razorpay Dashboard

1. Go to: https://dashboard.razorpay.com
2. Login with your Razorpay account
3. Navigate to **Payments** section
4. You'll see all test transactions
5. Click on any payment to see details

## Common Test Scenarios

### Scenario 1: Complete Mobile Recharge Flow
```
Login → Recharge → Select Airtel → Choose ₹155 plan → Pay with Razorpay → Enter test card → Success
```

### Scenario 2: Pay Multiple EMIs
```
Login → Loan Details → Pay 3 EMIs → Razorpay → Test card → Verify 3 EMIs marked paid
```

### Scenario 3: Test Payment Failure
```
Login → Any service → Pay with Razorpay → Use failure card → See error handling
```

### Scenario 4: Test UPI Payment
```
Login → Any service → Pay with Razorpay → Select UPI → Use success@razorpay → Success
```

## Debugging Tips

### If Razorpay Checkout doesn't open:
1. Check browser console for errors
2. Verify Razorpay script loaded in index.html
3. Check keyId is returned from backend

### If payment succeeds but not recorded:
1. Check backend console for errors
2. Verify `/razorpay/verify` endpoint is called
3. Check database connection

### If "Invalid key_id" error:
1. Restart backend server
2. Check `.env` file has correct credentials
3. Verify no extra spaces in credentials

## Test Checklist

- [ ] Mobile Recharge with Razorpay works
- [ ] DTH Recharge with Razorpay works  
- [ ] Bill Payment with Razorpay works
- [ ] Loan EMI Payment with Razorpay works
- [ ] Payment failure handled gracefully
- [ ] Database records payment correctly
- [ ] EMI status updates after payment
- [ ] Toast notifications appear correctly
- [ ] Razorpay dashboard shows transactions

## Production Readiness Checklist

Before going live:

- [ ] Replace test keys with production keys
- [ ] Complete Razorpay KYC
- [ ] Verify bank account
- [ ] Test with real small amounts
- [ ] Set up webhooks for payment notifications
- [ ] Enable auto-capture or manual capture as needed
- [ ] Configure payment methods (cards, UPI, wallets)
- [ ] Set up settlement schedule
- [ ] Add refund handling
- [ ] Implement payment retry logic

## Current Configuration

```
Environment: TEST MODE
Key ID: rzp_test_RpV7d7QkNsd8yp
Backend: http://localhost:5000
Frontend: http://localhost:3000 (or as configured)
Currency: INR
Payment Capture: Auto (immediate)
```

## Need Help?

- Check `RAZORPAY_CREDENTIALS_SETUP.md` for detailed integration info
- See `OTP_VERIFICATION_GUIDE.md` for OTP setup
- Razorpay Docs: https://razorpay.com/docs/
- Test Cards: https://razorpay.com/docs/payments/payments/test-card-details/

---

**Status**: ✅ FULLY CONFIGURED AND READY TO TEST!

Start testing now! 🚀
