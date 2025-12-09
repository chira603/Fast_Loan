# 🚀 Razorpay Quick Start - 5 Minute Setup

## ✅ Pre-Setup Checklist

Before you begin, make sure:
- [ ] Frontend is running (npm run dev)
- [ ] Backend is running (cd backend && npm start)
- [ ] Database is connected
- [ ] You have internet connection

---

## 📝 Step-by-Step Setup

### Step 1: Get Razorpay Keys (2 minutes)

1. **Sign up at Razorpay**:
   ```
   🌐 Open: https://dashboard.razorpay.com/signup
   📧 Enter your email
   📱 Verify with OTP
   ```

2. **Generate Test Keys**:
   ```
   1. After signup, you'll see the dashboard
   2. Look for "Test Mode" toggle (top-right) - ensure it's ON
   3. Click "Settings" (gear icon) → "API Keys"
   4. Click "Generate Test Key"
   5. You'll see:
      - Key ID: rzp_test_XXXXXXXXXXXXX
      - Key Secret: (click "Show" to reveal)
   6. Copy both keys
   ```

---

### Step 2: Add Keys to Backend (1 minute)

1. **Navigate to backend folder**:
   ```bash
   cd /home/chirag/Test/Fast_Loan/backend
   ```

2. **Edit .env file**:
   ```bash
   nano .env
   # or
   code .env
   ```

3. **Add these lines** (replace XXX with your actual keys):
   ```env
   RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXX
   RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
   ```

4. **Save and close** (Ctrl+O, Enter, Ctrl+X for nano)

---

### Step 3: Restart Backend (30 seconds)

```bash
# Stop current server (Ctrl+C if running)
# Then restart:
cd /home/chirag/Test/Fast_Loan/backend
npm start
```

**Expected output**: Server should start without "Razorpay keys missing" warning

---

### Step 4: Test Payment (2 minutes)

1. **Open browser**: http://localhost:3000

2. **Test Mobile Recharge**:
   ```
   📍 Navigate to: Recharge page
   
   📱 Enter mobile: 9876543210
   
   🔧 Select operator: Airtel (or any)
   
   💰 Choose plan: Any plan (e.g., ₹499)
   
   🎯 Click: "Pay with Razorpay" button
   
   💳 In Razorpay modal:
      Card: 4111 1111 1111 1111
      CVV: 123
      Expiry: 12/25
      Name: Test User
   
   ✅ Click: "Pay" button
   
   🎉 Expected: Success notification + Recharge processed
   ```

---

## 🧪 Quick Test Checklist

After setup, verify these work:

- [ ] **Recharge - Mobile**
  - Enter number → Select operator → Choose plan → Pay with Razorpay → Success

- [ ] **Recharge - DTH**
  - Switch to DTH tab → Select operator → Enter ID → Choose plan → Pay → Success

- [ ] **Bill Payment**
  - Select Electricity → Choose provider → Enter account → Fetch bill → Pay with Razorpay → Success

- [ ] **Loan EMI**
  - View loan details → Make EMI Payment section → Enter amount → Pay with Razorpay → Success

---

## 🎯 Success Indicators

### ✅ Payment Successful When You See:

1. **In App**:
   - ✅ Green success toast notification
   - ✅ Payment appears in history
   - ✅ Transaction recorded
   - ✅ Form resets

2. **In Razorpay Dashboard** (https://dashboard.razorpay.com):
   - ✅ New payment in "Payments" tab
   - ✅ Status shows "Captured"
   - ✅ Amount matches
   - ✅ Notes contain context (mobile/loan_id/etc.)

---

## 🐛 Common Issues & Quick Fixes

### Issue: "Razorpay is not defined"
```bash
# Fix: Hard refresh browser
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### Issue: "Invalid Key ID"
```bash
# Fix: Verify .env file
cat backend/.env | grep RAZORPAY

# Should show:
# RAZORPAY_KEY_ID=rzp_test_...
# RAZORPAY_KEY_SECRET=...

# If not, add keys and restart server
```

### Issue: Payment modal doesn't open
```bash
# Fix: Check browser console
1. Open DevTools (F12)
2. Check for errors
3. Verify Razorpay script loaded:
   - In console type: window.Razorpay
   - Should NOT be undefined
```

### Issue: "Signature verification failed"
```bash
# Fix: Ensure Key ID and Secret are from same key pair
1. Go to Razorpay Dashboard
2. Settings → API Keys
3. Regenerate both keys together
4. Update .env with BOTH new keys
5. Restart backend
```

---

## 📋 Copy-Paste Commands

### Full Setup in One Go:
```bash
# 1. Navigate to project
cd /home/chirag/Test/Fast_Loan

# 2. Edit .env (add keys manually)
nano backend/.env

# Add these lines (with your keys):
# RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXX
# RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXX

# 3. Restart backend
cd backend
npm start
```

### Test Card (Copy to Clipboard):
```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
Name: Test User
```

---

## 🎓 What Each File Does

| File | Purpose |
|------|---------|
| `backend/services/razorpayService.js` | Creates orders, verifies signatures |
| `backend/routes/payments.js` | API endpoints for order/verify |
| `src/services/razorpay.js` | Frontend helper functions |
| `src/pages/Recharge.jsx` | Mobile/DTH with Razorpay buttons |
| `src/pages/BillPayment.jsx` | Utility bills with Razorpay |
| `src/pages/LoanDetails.jsx` | EMI payments with Razorpay |

---

## 🔗 Important Links

| Resource | URL |
|----------|-----|
| Razorpay Dashboard | https://dashboard.razorpay.com |
| Test Cards | https://razorpay.com/docs/payments/payments/test-card-upi-details/ |
| Documentation | https://razorpay.com/docs/ |
| API Reference | https://razorpay.com/docs/api/ |

---

## ⏱️ Time Breakdown

- **Razorpay Signup**: 2 minutes
- **Get API Keys**: 1 minute
- **Update .env**: 1 minute
- **Restart Server**: 30 seconds
- **First Test Payment**: 2 minutes

**Total**: ~7 minutes from start to first successful payment! 🚀

---

## 🎉 You're All Set!

Once you complete the 4 steps above, your application will have:

✅ Razorpay payment gateway integrated  
✅ Multiple payment methods (Card, UPI, Netbanking)  
✅ Secure payment verification  
✅ Transaction recording  
✅ Ready for production (after KYC)  

---

## 📞 Support

Need help?
- 📖 Check `RAZORPAY_SETUP_GUIDE.md` for detailed guide
- 🎨 Check `RAZORPAY_BUTTON_GUIDE.md` for UI reference
- 📊 Check `RAZORPAY_INTEGRATION_SUMMARY.md` for complete overview
- 📧 Email Razorpay: support@razorpay.com

---

**Happy Testing!** 🎊

Remember: Use **TEST MODE** keys (starting with `rzp_test_`) for development.
