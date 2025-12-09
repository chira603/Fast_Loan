# Razorpay Payment Button Locations

## 📱 Recharge Page

### Mobile Recharge Tab
- **Location**: Right side panel after selecting a plan
- **Buttons**: 
  1. "Recharge via Balance" (outline style - uses wallet)
  2. "Pay with Razorpay" (primary style - opens Razorpay checkout)

### DTH Recharge Tab
- **Location**: Right side panel after selecting a plan
- **Buttons**: 
  1. "Recharge via Balance" (outline style)
  2. "Pay with Razorpay" (primary style)

**User Flow**:
```
Enter mobile/DTH number → Select operator → Choose plan → 
Click "Pay with Razorpay" → Razorpay modal opens → 
Enter card details → Payment success → Recharge processed
```

---

## 💡 Bill Payment Page

### Bill Details Section
- **Location**: Right panel after fetching bill
- **Buttons**:
  1. "Pay via Balance" (outline style)
  2. "Pay with Razorpay" (primary style)

**User Flow**:
```
Select category (Electricity/Water/Gas) → Choose provider → 
Enter account number → Click "Fetch Bill" → 
Click "Pay with Razorpay" → Complete payment → Bill paid
```

---

## 💰 Loan Details Page

### EMI Payment Section
- **Location**: New section below repayment schedule (only shows for approved/disbursed loans)
- **Fields**:
  - Payment Amount input (pre-filled with EMI amount)
- **Buttons**:
  1. "Pay via Wallet" (outline style)
  2. "Pay with Razorpay" (primary style)

**User Flow**:
```
View loan details → Scroll to "Make EMI Payment" → 
Enter/confirm amount → Click "Pay with Razorpay" → 
Complete payment → Payment recorded in loan history
```

---

## 🎨 Button Styles

### "Pay with Razorpay" (Primary Button)
- Background: Primary color (blue)
- Text: White
- Full width within container
- Disabled state when processing

### "Pay via Balance/Wallet" (Outline Button)
- Border: Primary color
- Text: Primary color
- Background: Transparent/White
- Full width within container
- Disabled state when processing

---

## 🔄 Payment States

### Before Payment
- Buttons enabled
- Text: "Pay with Razorpay" / "Recharge via Balance"

### During Payment
- Buttons disabled
- Text: "Processing..."
- Cursor: not-allowed

### After Success
- Success toast notification
- Form resets
- Payment recorded
- History updated

### After Failure
- Error toast with message
- Buttons re-enabled
- User can retry

---

## 💳 Razorpay Checkout Modal

When "Pay with Razorpay" is clicked, a modal appears with:

### Payment Methods
- 💳 **Card** (Debit/Credit)
- 📱 **UPI** (Google Pay, PhonePe, etc.)
- 🏦 **Netbanking**
- 💰 **Wallets** (Paytm, PhonePe, etc.)
- 📄 **EMI**

### Display Information
- Business name: "FAST LOAN"
- Description: e.g., "Mobile Recharge - Airtel"
- Amount: Displayed prominently
- Secure badge: "Secured by Razorpay"

### Test Mode Indicator
- In test mode, Razorpay shows a test badge
- Test cards work
- No real money charged

---

## 🧪 Test Scenarios

### Success Path
```
1. Click "Pay with Razorpay"
2. Modal opens with payment options
3. Select "Card"
4. Enter: 4111 1111 1111 1111
5. CVV: 123, Expiry: 12/25
6. Click "Pay"
7. Modal closes automatically
8. Success toast appears
9. Transaction completes
10. Record saved in database
```

### Failure Path (Test)
```
1. Click "Pay with Razorpay"
2. Modal opens
3. Select "Card"
4. Enter: 4000 0000 0000 0002 (declined card)
5. Click "Pay"
6. Error message in modal
7. User can retry or close
8. No charge, no record
```

### User Cancellation
```
1. Click "Pay with Razorpay"
2. Modal opens
3. User clicks "X" or presses ESC
4. Modal closes
5. Error toast: "Payment cancelled"
6. Buttons re-enabled
```

---

## 📊 Example Screenshots (Expected Flow)

### Recharge Page
```
┌─────────────────────────────────────────────┐
│ Enter Mobile Number                          │
│ ┌─────────────────────────────────────────┐ │
│ │ Mobile: 9876543210                      │ │
│ │ Operator: Airtel ▼                      │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ Selected Plan: ₹499                          │
│ 2GB/Day + Unlimited Calls - 84 Days         │
│                                              │
│ ┌──────────────────┬──────────────────────┐ │
│ │ Recharge via     │ Pay with Razorpay    │ │
│ │ Balance          │                      │ │
│ └──────────────────┴──────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Bill Payment Page
```
┌─────────────────────────────────────────────┐
│ Bill Details                                 │
│                                              │
│ Customer Name: John Doe                      │
│ Account Number: 123456789                    │
│ Due Date: 2024-01-15                         │
│                                              │
│ Total Amount: ₹1,250                         │
│                                              │
│ ┌──────────────────┬──────────────────────┐ │
│ │ Pay via Balance  │ Pay with Razorpay    │ │
│ └──────────────────┴──────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Loan EMI Payment
```
┌─────────────────────────────────────────────┐
│ Make EMI Payment                             │
│                                              │
│ Payment Amount                               │
│ ┌─────────────────────────────────────────┐ │
│ │ 5000                                    │ │
│ └─────────────────────────────────────────┘ │
│ EMI Amount: ₹5,000                          │
│                                              │
│ ┌──────────────────┬──────────────────────┐ │
│ │ Pay via Wallet   │ Pay with Razorpay    │ │
│ └──────────────────┴──────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## ✅ Verification Points

After implementing, verify:

- [ ] Both buttons appear side-by-side
- [ ] "Pay with Razorpay" has primary (blue) styling
- [ ] "Pay via Balance/Wallet" has outline styling
- [ ] Buttons are same height and width
- [ ] Gap between buttons is consistent
- [ ] Buttons disable during processing
- [ ] Text changes to "Processing..." when clicked
- [ ] Razorpay modal opens smoothly
- [ ] Modal displays correct amount and description
- [ ] Payment success triggers original flow
- [ ] Success toast appears
- [ ] Payment recorded in database
- [ ] UI updates after payment

---

**All three pages (Recharge, BillPayment, LoanDetails) now have dual payment options!** 🎉
