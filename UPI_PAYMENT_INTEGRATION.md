# UPI Payment Integration Guide

## Overview
Razorpay has been completely removed from Recharge and Bill Payment sections. Users can now pay directly using **PhonePe**, **Google Pay**, and **Paytm** via UPI deep links.

## What Changed

### ✅ Removed
- Razorpay payment gateway integration
- `createRazorpayOrder`, `openRazorpayCheckout`, `verifyRazorpayPayment` functions
- All Razorpay-related code and dependencies

### ✅ Added
- UPI deep link integration for PhonePe, Google Pay, and Paytm
- Direct app redirection for payments
- Beautiful payment method selection UI with icons

## How It Works

### UPI Deep Link Format
```javascript
upi://pay?pa=<UPI_ID>&pn=<NAME>&am=<AMOUNT>&cu=INR&tn=<NOTE>
```

**Parameters:**
- `pa`: Payee Address (Your UPI ID)
- `pn`: Payee Name (Your business name)
- `am`: Amount (in INR)
- `cu`: Currency (INR)
- `tn`: Transaction Note (Description)

### Example UPI Link
```
upi://pay?pa=fastloan@ybl&pn=Fast Loan&am=299&cu=INR&tn=Mobile Recharge - Airtel
```

## Configuration

### Update Your UPI IDs

**File: `src/pages/Recharge.jsx` (Lines ~215-220)**
```javascript
const upiIds = {
  phonepe: 'YOUR_PHONEPE_UPI_ID@ybl',      // e.g., merchant@ybl
  googlepay: 'YOUR_GOOGLEPAY_UPI_ID@okaxis', // e.g., merchant@okaxis
  paytm: 'YOUR_PAYTM_UPI_ID@paytm',         // e.g., merchant@paytm
};
```

**File: `src/pages/BillPayment.jsx` (Lines ~95-100)**
```javascript
const upiIds = {
  phonepe: 'YOUR_PHONEPE_UPI_ID@ybl',
  googlepay: 'YOUR_GOOGLEPAY_UPI_ID@okaxis',
  paytm: 'YOUR_PAYTM_UPI_ID@paytm',
};
```

### Common UPI Handles (Suffixes)
| Provider | UPI Handle Examples |
|----------|-------------------|
| **PhonePe** | `@ybl`, `@axl`, `@ibl` |
| **Google Pay** | `@okaxis`, `@okicici`, `@oksbi` |
| **Paytm** | `@paytm` |
| **Other** | `@upi`, `@apl`, `@icici` |

## User Flow

### Mobile/DTH Recharge
1. User enters mobile number
2. Selects operator and plan
3. Sees selected plan with amount
4. Clicks on **PhonePe**, **Google Pay**, or **Paytm** button
5. **Automatically redirected** to selected UPI app
6. User completes payment in the app
7. Returns to website (payment confirmation via UPI app)

### Bill Payment
1. User selects bill category (Electricity/Water/Gas)
2. Enters account number and fetches bill
3. Reviews bill details
4. Clicks on **PhonePe**, **Google Pay**, or **Paytm** button
5. **Automatically redirected** to selected UPI app
6. Completes payment
7. Returns to website

## Features

### ✅ Benefits
- **Zero Gateway Fees** - No payment gateway charges
- **Instant Redirection** - Direct to user's preferred UPI app
- **Mobile Optimized** - Seamless experience on mobile devices
- **No Registration** - Users pay with existing UPI apps
- **Wide Acceptance** - Works with all UPI-enabled apps

### 📱 Supported Platforms
- **Android** - Opens UPI app directly
- **iOS** - Opens UPI app if installed
- **Desktop** - Shows UPI QR code (browser dependent)

## Payment Method UI

### Visual Design
Each payment option is displayed as a card with:
- **Icon**: Official app logo (PhonePe purple, Google Pay blue, Paytm cyan)
- **Label**: App name
- **Hover Effect**: Scale animation + shadow
- **Color Theme**: Brand-specific colors

### Layout
```
┌─────────────────────────────────────┐
│   Select Payment Method             │
├─────────┬──────────┬────────────────┤
│ PhonePe │ GooglePay│    Paytm      │
│   🟣    │    🔵    │     🔵        │
└─────────┴──────────┴────────────────┘
```

## Testing

### Test on Mobile Device
1. Open the recharge/bill payment page on mobile
2. Select a plan/bill
3. Click on any UPI payment button
4. **Should open** the respective app
5. Complete test payment

### Test on Desktop
1. Click UPI button
2. Browser will attempt to open UPI app
3. If no app installed, may show error or QR code

## Payment Verification

### Manual Verification Required
Since UPI deep links don't provide automatic callbacks, you need to:

1. **Ask user to confirm** payment completion
2. **Verify via UPI transaction ID** (manual entry)
3. **Check bank statement** for payment confirmation
4. **Implement webhook** from payment aggregator (optional)

### Recommended Approach
Add a "Payment Completed" button after UPI redirection:
```javascript
// After UPI redirect
<button onClick={confirmPayment}>
  I've completed the payment
</button>
```

Then verify payment via:
- Transaction ID entry
- Bank SMS parsing (Android only)
- Third-party verification API

## Advanced Integration (Optional)

### Payment Verification Service
Consider integrating with:
- **Razorpay Payment Links** (for verification only)
- **PayU UPI** (with callback support)
- **Instamojo** (UPI + verification)
- **Cashfree** (UPI deep links with webhooks)

### Backend Verification
```javascript
// Example: Verify payment on backend
POST /api/payments/verify-upi
{
  "transactionId": "UPI_TXN_123456",
  "amount": 299,
  "upiId": "fastloan@ybl"
}
```

## Troubleshooting

### UPI App Not Opening
**Issue:** Click on UPI button but app doesn't open

**Solutions:**
1. Ensure UPI app is installed on device
2. Check browser allows app redirects
3. Test with `window.location.href` (currently used)
4. Try alternative: `window.open(upiLink, '_self')`

### Invalid UPI ID
**Issue:** Payment fails with invalid VPA

**Solutions:**
1. Verify your UPI IDs are active
2. Test with personal UPI ID first
3. Ensure correct UPI handle (@ybl, @paytm, etc.)

### Amount Not Pre-filled
**Issue:** UPI app opens but amount is empty

**Solutions:**
1. Check amount is number, not string
2. Ensure `am` parameter is set correctly
3. Some apps don't support pre-filled amounts

## Security Considerations

### ✅ Best Practices
- Validate all payment amounts on backend
- Log all payment attempts
- Don't trust frontend payment confirmations
- Implement rate limiting on payment endpoints
- Store UPI IDs securely (environment variables)

### ⚠️ Important Notes
- UPI deep links are **not PCI-DSS compliant** on their own
- Implement proper **payment reconciliation**
- Add **fraud detection** for unusual patterns
- Keep **audit logs** of all transactions

## Environment Variables (Recommended)

```env
# .env file
VITE_UPI_PHONEPE_ID=merchant@ybl
VITE_UPI_GOOGLEPAY_ID=merchant@okaxis
VITE_UPI_PAYTM_ID=merchant@paytm
```

**Usage:**
```javascript
const upiIds = {
  phonepe: import.meta.env.VITE_UPI_PHONEPE_ID,
  googlepay: import.meta.env.VITE_UPI_GOOGLEPAY_ID,
  paytm: import.meta.env.VITE_UPI_PAYTM_ID,
};
```

## Files Modified

1. **`src/pages/Recharge.jsx`**
   - Removed Razorpay imports
   - Added UPI payment handlers
   - Updated payment UI with UPI buttons

2. **`src/pages/BillPayment.jsx`**
   - Removed Razorpay imports
   - Added UPI payment handlers
   - Updated payment UI with UPI buttons

## Next Steps

1. ✅ **Update UPI IDs** with your merchant IDs
2. ✅ **Test on mobile device** with real UPI apps
3. ⚠️ **Add payment verification** flow
4. ⚠️ **Implement backend reconciliation**
5. ⚠️ **Add payment confirmation UI**

## Support

For UPI integration issues:
- **NPCI UPI**: https://www.npci.org.in/what-we-do/upi
- **PhonePe Business**: https://business.phonepe.com/
- **Google Pay Business**: https://pay.google.com/business/
- **Paytm Business**: https://business.paytm.com/

---

**Status:** ✅ UPI Integration Complete - Ready for Testing
**Last Updated:** December 10, 2025
