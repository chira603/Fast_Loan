# Razorpay Integration - Complete Setup Guide

## ✅ Integration Status: READY TO USE

Your Razorpay credentials have been successfully integrated throughout the application!

## Credentials Configured

```
Key ID: rzp_test_RpV7d7QkNsd8yp
Key Secret: iziPR0ntw2jcWWyFPEjNavet
Environment: TEST MODE
```

⚠️ **Important**: These are TEST credentials. Payments will be simulated and no real money will be charged.

## Where Credentials Are Used

### Backend Configuration
**File**: `backend/.env`
```env
RAZORPAY_KEY_ID=rzp_test_RpV7d7QkNsd8yp
RAZORPAY_KEY_SECRET=iziPR0ntw2jcWWyFPEjNavet
PAYMENT_GATEWAY=razorpay
```

### Frontend Configuration
**File**: `.env`
```env
VITE_RAZORPAY_KEY_ID=rzp_test_RpV7d7QkNsd8yp
```

### Integration Points

1. **Backend Service** (`backend/services/razorpayService.js`)
   - Initializes Razorpay SDK with credentials
   - Creates payment orders
   - Verifies payment signatures

2. **Payment Routes** (`backend/routes/payments.js`)
   - `/api/v1/payments/razorpay/order` - Creates Razorpay order
   - `/api/v1/payments/razorpay/verify` - Verifies payment
   - Returns `keyId` to frontend for checkout

3. **Frontend Pages** (All using keyId from backend response)
   - ✅ `src/pages/Recharge.jsx` - Mobile & DTH recharge
   - ✅ `src/pages/BillPayment.jsx` - Utility bill payments
   - ✅ `src/pages/LoanDetails.jsx` - Loan EMI payments

4. **Razorpay Script** (`index.html`)
   - Loaded: `https://checkout.razorpay.com/v1/checkout.js`

## Features Enabled

### 1. Mobile Recharge
- Operators: Airtel, Jio, Vi, BSNL
- Amount range: ₹10 - ₹2999
- Payment via Razorpay Checkout

### 2. DTH Recharge
- Operators: Tata Sky, Airtel DTH, Dish TV, Sun Direct
- Amount range: ₹200 - ₹5000
- Payment via Razorpay Checkout

### 3. Bill Payments
- Types: Electricity, Water, Gas
- Payment via Razorpay Checkout

### 4. Loan EMI Payments
- Make single or multiple EMI payments
- Track payment status
- Auto-update loan status when fully paid
- Payment via Razorpay Checkout

## How to Test

### Step 1: Start the Application

```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend
npm run dev
```

### Step 2: Test Payment Flow

1. **Login** to the application
2. **Choose a service**:
   - Mobile Recharge
   - Bill Payment
   - Loan EMI Payment

3. **Click "Pay with Razorpay"**
4. **Razorpay Checkout will open** with test credentials
5. **Use Razorpay Test Cards**:

### Test Card Details

#### Successful Payment
```
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
Name: Any name
```

#### Payment Failure (for testing)
```
Card Number: 4000 0000 0000 0002
CVV: Any 3 digits
Expiry: Any future date
```

#### UPI Test (in test mode)
```
UPI ID: success@razorpay
```

#### Netbanking Test
```
Select any bank
Use "success" as username and password
```

### Step 3: Verify Payment

After successful payment:
1. ✅ Payment confirmation toast appears
2. ✅ Transaction recorded in database
3. ✅ For loans: EMI status updated to "paid"
4. ✅ For loans: Loan status changes to "repaid" when fully paid

## Payment Flow Diagram

```
User clicks "Pay with Razorpay"
         ↓
Frontend calls /api/v1/payments/razorpay/order
         ↓
Backend creates Razorpay order
         ↓
Backend returns: orderId, amount, keyId
         ↓
Frontend opens Razorpay Checkout
         ↓
User completes payment
         ↓
Razorpay returns: payment_id, order_id, signature
         ↓
Frontend calls /api/v1/payments/razorpay/verify
         ↓
Backend verifies signature
         ↓
Backend records payment in database
         ↓
Success! User redirected/notified
```

## API Endpoints

### Create Razorpay Order
```http
POST /api/v1/payments/razorpay/order
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 100.00,
  "purpose": "Mobile Recharge",
  "notes": {
    "mobile": "9876543210",
    "operator": "Airtel"
  }
}

Response:
{
  "success": true,
  "data": {
    "orderId": "order_xyz123",
    "amount": 10000,
    "currency": "INR",
    "receipt": "rcpt_123_1234567890",
    "keyId": "rzp_test_RpV7d7QkNsd8yp"
  }
}
```

### Verify Payment
```http
POST /api/v1/payments/razorpay/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "razorpay_order_id": "order_xyz123",
  "razorpay_payment_id": "pay_abc456",
  "razorpay_signature": "signature_hash",
  "amount": 100.00
}

Response:
{
  "success": true,
  "message": "Payment verified successfully"
}
```

## Switching to Production

When ready for production:

1. **Get Production Credentials**:
   - Login to Razorpay Dashboard
   - Go to Settings → API Keys
   - Generate Live API Keys
   - Enable Payment Methods

2. **Update Environment Variables**:
   ```env
   # backend/.env
   RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY_ID
   RAZORPAY_KEY_SECRET=YOUR_LIVE_KEY_SECRET
   ```

   ```env
   # .env
   VITE_RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY_ID
   ```

3. **Complete KYC**:
   - Submit business documents
   - Verify bank account
   - Activate payment gateway

4. **Test in Production** with small amounts first

5. **Enable Webhooks** (optional but recommended):
   - URL: `https://your-domain.com/api/v1/payments/razorpay/webhook`
   - Events: payment.captured, payment.failed

## Security Features

✅ **Signature Verification**: All payments verified using HMAC SHA256
✅ **Amount Validation**: Server-side amount verification
✅ **User Authorization**: Protected routes with JWT
✅ **Transaction Logging**: All payments recorded in database
✅ **Error Handling**: Graceful failure handling

## Troubleshooting

### Issue: "Razorpay is not defined"
**Solution**: Ensure Razorpay script is loaded in `index.html`

### Issue: "Invalid key_id"
**Solution**: 
1. Check `backend/.env` has correct `RAZORPAY_KEY_ID`
2. Restart backend server
3. Verify keyId is returned from `/razorpay/order` endpoint

### Issue: "Signature verification failed"
**Solution**:
1. Check `RAZORPAY_KEY_SECRET` in backend/.env
2. Ensure payment response contains all three: order_id, payment_id, signature
3. Check server logs for signature mismatch details

### Issue: Payment successful but not recorded
**Solution**:
1. Check `/razorpay/verify` endpoint is called
2. Verify database connection
3. Check server logs for errors

## Razorpay Dashboard

Access your dashboard at: https://dashboard.razorpay.com

- **Payments**: View all transactions
- **Orders**: See created orders
- **Settlements**: Track payouts
- **Reports**: Download transaction reports
- **Webhooks**: Configure event notifications
- **API Keys**: Manage credentials

## Support

- Razorpay Docs: https://razorpay.com/docs/
- Test Cards: https://razorpay.com/docs/payments/payments/test-card-details/
- Support: support@razorpay.com

## Next Steps

1. ✅ Credentials configured
2. ✅ Integration complete
3. 🔄 **Test payments** using test cards
4. 🔄 Verify database updates
5. 📝 Complete KYC for production
6. 🚀 Switch to production keys

---

**Status**: ✅ READY FOR TESTING

The Razorpay integration is fully configured and ready to use with test credentials!
