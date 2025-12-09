# Operator Detection & Plan Testing Guide

## Test Numbers for Each Operator

### Airtel (Default for unknown numbers)
- **9988776655** - Default
- **9111222333** - Default
- **8765432109** - Default
- Any number not matching JIO, VI, or BSNL patterns

### Jio
- **9876543210** - JIO
- **9123456789** - JIO
- **8888777666** - JIO
- **7777666555** - JIO
- **7000111222** - JIO
- **6666555444** - JIO
- **8000999888** - JIO

### Vi (Vodafone Idea)
- **9999888777** - VI
- **9090111222** - VI
- **9191222333** - VI
- **9292333444** - VI
- **9393444555** - VI
- **9595666777** - VI

### BSNL
- **9400111222** - BSNL
- **9500222333** - BSNL
- **9434555666** - BSNL
- **9436777888** - BSNL
- **9450999000** - BSNL

## How to Test

### Mobile Recharge

1. **Enter Mobile Number** (10 digits)
   - System will auto-detect operator
   - OR manually select from dropdown

2. **Select Operator** (if needed)
   - Choose from: Airtel, Jio, Vi, BSNL
   - System will load operator-specific plans

3. **Browse Plans**
   - Switch between categories:
     - Popular 🔥
     - Recommended ⭐
     - Data 📊
     - Talktime 💰
     - Long Term 📅

4. **Select Plan & Recharge**
   - Click on any plan card
   - Click "Recharge Now" button

### Plan Counts by Operator

| Operator | Total Plans | Popular | Recommended | Data | Talktime | Long Term | Annual |
|----------|-------------|---------|-------------|------|----------|-----------|--------|
| Airtel   | 8 plans     | 3       | 1           | 1    | 1        | 1         | 1      |
| Jio      | 10 plans    | 2       | 1           | 1    | 1        | 2         | 2      |
| Vi       | 9 plans     | 2       | 1           | 1    | 1        | 2         | 1      |
| BSNL     | 8 plans     | 2       | 1           | 1    | 1        | 1         | 2      |

## Sample Plans by Operator

### Airtel Plans
- ₹155 - Truly Unlimited (28 days) - 1GB/day
- ₹239 - Entertainment Pack (28 days) - 1.5GB/day + Disney+
- ₹299 - Premium Unlimited (28 days) - 2GB/day + Amazon Prime
- ₹666 - Long Validity Pack (84 days) - 1.5GB/day
- ₹2999 - Annual Pack (365 days) - 2GB/day

### Jio Plans
- ₹155 - Unlimited Voice + Data (28 days) - 1GB/day
- ₹239 - Prime Pack (28 days) - 1.5GB/day + JioTV
- ₹299 - Premium Unlimited (28 days) - 2GB/day + Netflix
- ₹666 - Quarterly Pack (84 days) - 1.5GB/day
- ₹2999 - Annual Pack (365 days) - 2.5GB/day

### Vi Plans
- ₹155 - Unlimited Combo (28 days) - 1GB/day
- ₹239 - Entertainment Plus (28 days) - 1.5GB/day + Vi Movies
- ₹299 - Premium Pack (28 days) - 2GB/day + Amazon Prime
- ₹719 - Quarterly Pack (84 days) - 1.5GB/day
- ₹2899 - Annual Pack (365 days) - 1.5GB/day

### BSNL Plans
- ₹107 - Budget Plan (26 days) - 1GB/day
- ₹187 - Data Pack (28 days) - 2GB/day
- ₹197 - Premium Value (28 days) - 2GB/day
- ₹397 - Long Validity (80 days) - 1GB/day
- ₹2399 - Yearly Unlimited (365 days) - 2GB/day

## DTH Testing

### Tata Sky
- 6 plans available (₹199 - ₹999)

### Airtel Digital TV
- 6 plans available (₹199 - ₹899)

### Dish TV
- 5 plans available (₹199 - ₹799)

### Sun Direct
- 5 plans available (₹199 - ₹699)

## API Endpoints

### Mobile Recharge
```
POST /api/v1/recharge/detect-operator
Body: { "mobile": "9876543210" }

GET /api/v1/recharge/plans?operator=JIO&circle=Mumbai

POST /api/v1/recharge/mobile
Body: { mobile, operator, circle, planId, amount, planDetails }
```

### DTH Recharge
```
GET /api/v1/recharge/dth-operators

GET /api/v1/recharge/dth-plans?operator=TATASKY

POST /api/v1/recharge/dth
Body: { operator, accountNumber, amount, planId, planDetails }
```

## Features Tested

✅ Auto operator detection based on number
✅ Manual operator selection dropdown
✅ Operator-specific plans loaded correctly
✅ All 4 operators working (Airtel, Jio, Vi, BSNL)
✅ All 4 DTH operators working
✅ Plan categories filtering
✅ Multiple plans per operator
✅ Talktime, Data, Combo plans
✅ Long validity and annual plans

## Expected Behavior

1. **Enter any 10-digit number**: System attempts auto-detection
2. **Operator dropdown enabled**: Can manually override detection
3. **Plans load automatically**: Based on selected operator
4. **Filter by category**: Switch between plan types
5. **Visual feedback**: Loading states, success/error messages
6. **Transaction history**: View past recharges

## Common Issues & Solutions

**Issue**: Auto-detection selects wrong operator
**Solution**: Use manual operator dropdown to select correct one

**Issue**: No plans showing
**Solution**: Ensure operator is selected and number is 10 digits

**Issue**: Plans showing for wrong operator
**Solution**: Clear and re-enter number, or change operator manually

---

**Last Updated**: December 9, 2025
**Status**: ✅ All operators working with comprehensive plans
