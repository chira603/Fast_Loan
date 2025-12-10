# Pay EMI Feature - Implementation Guide

## Overview
The Pay EMI feature allows users to quickly access all their active loans and make EMI payments directly from the Loan Hub.

## User Flow

### 1. Access Pay EMI
```
Dashboard → Loans → Pay EMI
```
OR
```
Direct URL: /loan/pay-emi
```

### 2. View Active Loans
Users see all loans with status:
- **Approved**: Loan approved, awaiting first payment
- **Disbursed**: Active loan with ongoing EMI payments

### 3. Loan Information Displayed
For each active loan:
- **Loan ID & Purpose**
- **EMI Amount** (highlighted)
- **Total Loan Amount**
- **Paid Amount** (green)
- **Remaining Amount** (orange)
- **Tenure** (months)
- **Payment Progress Bar** (visual percentage)
- **Application Date**
- **Interest Rate**

### 4. Make Payment
Click **"Pay EMI"** button → Redirects to `/loan/{id}/pay`

## Payment Logic (Automatic)

### Status Transitions
```
1. approved + First Payment → disbursed
   - Sets disbursement_date
   - Activates the loan

2. disbursed + Payments → disbursed
   - Updates paid_amount
   - Maintains active status

3. disbursed + Final Payment (paid >= total) → repaid
   - Marks loan as fully paid
   - Closes the loan
```

### Payment Tracking
- Every successful payment updates `loans.paid_amount`
- Progress calculated: `(paid_amount / total_amount) * 100%`
- Remaining calculated: `total_amount - paid_amount`

## Components Created

### 1. PayEMI.jsx
**Location**: `src/pages/PayEMI.jsx`

**Features**:
- Lists all active loans (approved/disbursed status)
- Shows payment progress for each loan
- Direct "Pay EMI" buttons
- "View Details" links
- Empty state for no active loans
- Help section with payment options

**State Management**:
```javascript
- activeLoans: Array of loans needing payment
- loading: Boolean for loading state
```

**Key Functions**:
```javascript
loadActiveLoans()          // Fetches and filters active loans
calculateLoanProgress()    // Computes payment stats
getStatusBadge()          // Returns status badge UI
```

### 2. LoanHub.jsx (Updated)
**Changes**:
- Added 4th action card: "Pay EMI"
- Purple theme for Pay EMI button
- Icon: FaMoneyBillWave
- Navigation: `/loan/pay-emi`

### 3. LoanPayment Model (Enhanced)
**Location**: `backend/models/LoanPayment.js`

**Improvements**:
```javascript
updateLoanAfterPayment() {
  ✅ Sets disbursement_date on first payment
  ✅ Transitions: approved → disbursed
  ✅ Transitions: disbursed → repaid (when fully paid)
  ✅ Maintains disbursed status during EMI payments
  ✅ Updates paid_amount cumulatively
}
```

## Routes

```javascript
// App.jsx
<Route path="/loan/pay-emi" element={<ProtectedRoute><PayEMI /></ProtectedRoute>} />
```

## UI/UX Features

### Visual Indicators
1. **Status Badges**:
   - Approved: Green badge
   - Active: Blue badge

2. **Progress Bar**:
   - Gradient color (primary)
   - Percentage display
   - Animated transition

3. **Color Coding**:
   - Total: Neutral gray
   - Paid: Green
   - Remaining: Orange
   - Tenure: Blue

### Responsive Design
- Grid layout: 4 columns on desktop
- Stacks vertically on mobile
- Touch-friendly buttons

## Payment Options Available

Users can choose from 3 payment types on the payment page:

### 1. Pay EMI
- **Amount**: Fixed monthly installment (from loan.emi)
- **Use Case**: Regular monthly payment
- **Auto-calculated**: Yes

### 2. Prepayment
- **Amount**: Custom (user enters)
- **Use Case**: Pay extra to reduce tenure
- **Min**: ₹1
- **Max**: Remaining balance

### 3. Full Closing
- **Amount**: Remaining balance
- **Use Case**: Pay off entire loan
- **Auto-calculated**: Yes
- **Result**: Loan status → repaid

## Backend Validation

### Security Checks (in loanPayments.js)
```javascript
✅ Loan exists
✅ User owns the loan
✅ Loan status is payable (approved/disbursed)
✅ Amount is valid (> 0)
✅ UPI VPA format validation (optional)
✅ Transaction reference is unique
```

## Error Handling

### Frontend
- Loading states
- Toast notifications
- Empty state UI
- Network error handling

### Backend
- Validation errors (400)
- Not found (404)
- Unauthorized (403)
- Server errors (500)

## Testing Checklist

### Manual Testing
- [ ] Navigate to Pay EMI from Loan Hub
- [ ] Verify only approved/disbursed loans show
- [ ] Check progress bar calculation
- [ ] Click "Pay EMI" and verify redirect
- [ ] Make first payment (approved → disbursed)
- [ ] Make subsequent payment (stays disbursed)
- [ ] Make final payment (disbursed → repaid)
- [ ] Verify empty state when no active loans

### Status Transition Testing
```sql
-- Check loan status before payment
SELECT id, status, paid_amount, disbursement_date FROM loans WHERE id = X;

-- Make payment via UI

-- Check loan status after payment
SELECT id, status, paid_amount, disbursement_date FROM loans WHERE id = X;

-- Check payment record
SELECT * FROM loan_payments WHERE loan_id = X ORDER BY created_at DESC LIMIT 1;
```

## Database Queries

### Get Active Loans
```sql
SELECT * FROM loans 
WHERE user_id = $1 
  AND status IN ('approved', 'disbursed')
ORDER BY application_date DESC;
```

### Get Payment History
```sql
SELECT * FROM loan_payments 
WHERE loan_id = $1 
ORDER BY payment_date DESC;
```

### Check Loan Progress
```sql
SELECT 
  id,
  amount as total_amount,
  paid_amount,
  (amount - COALESCE(paid_amount, 0)) as remaining_amount,
  ROUND((COALESCE(paid_amount, 0) / amount) * 100) as progress_percent
FROM loans 
WHERE id = $1;
```

## Future Enhancements

### Planned Features
1. **Auto-debit Setup**: Automatic EMI deduction
2. **Payment Reminders**: SMS/Email before due date
3. **Payment History**: Detailed transaction log
4. **Download Receipt**: PDF payment receipts
5. **EMI Calendar**: Visual payment schedule
6. **Partial Payments**: Allow payments less than EMI
7. **Missed Payment Alerts**: Overdue notifications
8. **Bulk Payment**: Pay multiple EMIs at once

### Advanced Features
1. **EMI Calculator**: Modify tenure/amount
2. **Foreclosure Calculator**: Early closure savings
3. **Payment Analytics**: Charts and insights
4. **Auto-reminders**: 3 days before due date
5. **Grace Period**: Late payment handling
6. **Penalty Calculation**: Automated late fees

## Dependencies

### Frontend
- react-router-dom: Navigation
- react-icons: Icons (FaMoneyBillWave, etc.)
- react-toastify: Notifications

### Backend
- No additional dependencies

## Troubleshooting

### Issue: No loans showing in Pay EMI
**Solution**: Check loan status
```sql
SELECT id, status FROM loans WHERE user_id = YOUR_USER_ID;
```
Only loans with status 'approved' or 'disbursed' appear.

### Issue: Payment not updating loan status
**Solution**: Check payment status
```sql
SELECT status FROM loan_payments WHERE transaction_ref = 'YOUR_REF';
```
Only payments with status 'success' trigger loan updates.

### Issue: Progress bar not accurate
**Solution**: Recalculate paid_amount
```sql
UPDATE loans 
SET paid_amount = (
  SELECT COALESCE(SUM(amount), 0) 
  FROM loan_payments 
  WHERE loan_id = loans.id AND status = 'success'
)
WHERE id = YOUR_LOAN_ID;
```

## API Endpoints Used

```
GET  /api/v1/loans                          - Get all user loans
POST /api/v1/loan-payments/initiate         - Start payment
POST /api/v1/loan-payments/verify           - Confirm payment
GET  /api/v1/loans/:id                      - Get loan details
```

## Summary

The Pay EMI feature provides a streamlined way for users to:
✅ View all active loans in one place
✅ See payment progress visually
✅ Make EMI payments quickly
✅ Track loan status automatically

All payment logic is handled automatically with proper status transitions and data updates.
