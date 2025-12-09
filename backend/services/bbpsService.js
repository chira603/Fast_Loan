/**
 * BBPS Service - Mock Implementation
 * In production, replace with actual Setu/Razorpay/BBPS API calls
 * This service simulates API responses for development
 */

// Mock Mobile Operators and Circles
const MOBILE_OPERATORS = {
  AIRTEL: { name: 'Airtel', logo: 'https://via.placeholder.com/80?text=Airtel' },
  JIO: { name: 'Jio', logo: 'https://via.placeholder.com/80?text=Jio' },
  VI: { name: 'Vi (Vodafone Idea)', logo: 'https://via.placeholder.com/80?text=Vi' },
  BSNL: { name: 'BSNL', logo: 'https://via.placeholder.com/80?text=BSNL' }
};

const CIRCLES = [
  'Mumbai', 'Delhi', 'Karnataka', 'Maharashtra', 'Tamil Nadu',
  'Kolkata', 'Gujarat', 'Rajasthan', 'UP East', 'UP West'
];

// Mock Mobile Recharge Plans
const MOBILE_PLANS = {
  AIRTEL: [
    {
      planId: 'AIR001',
      amount: 155,
      validity: '28 days',
      description: 'Truly Unlimited',
      benefits: { data: '1 GB/day', voice: 'Unlimited', sms: '100 SMS/day', otherBenefits: ['Free Hellotunes'] },
      category: 'POPULAR',
      talktime: 0
    },
    {
      planId: 'AIR002',
      amount: 239,
      validity: '28 days',
      description: 'Entertainment Pack',
      benefits: { data: '1.5 GB/day', voice: 'Unlimited', sms: '100 SMS/day', otherBenefits: ['Disney+ Hotstar Mobile', 'Wynk Music'] },
      category: 'POPULAR',
      talktime: 0
    },
    {
      planId: 'AIR003',
      amount: 299,
      validity: '28 days',
      description: 'Premium Unlimited',
      benefits: { data: '2 GB/day', voice: 'Unlimited', sms: '100 SMS/day', otherBenefits: ['Amazon Prime Lite', 'Airtel Thanks'] },
      category: 'RECOMMENDED',
      talktime: 0
    },
    {
      planId: 'AIR004',
      amount: 666,
      validity: '84 days',
      description: 'Long Validity Pack',
      benefits: { data: '1.5 GB/day', voice: 'Unlimited', sms: '100 SMS/day', otherBenefits: ['Disney+ Hotstar'] },
      category: 'LONG_TERM',
      talktime: 0
    },
    {
      planId: 'AIR005',
      amount: 2999,
      validity: '365 days',
      description: 'Annual Pack',
      benefits: { data: '2 GB/day', voice: 'Unlimited', sms: '100 SMS/day', otherBenefits: ['Disney+ Hotstar VIP', 'Amazon Prime'] },
      category: 'ANNUAL',
      talktime: 0
    },
    {
      planId: 'AIR006',
      amount: 49,
      validity: '28 days',
      description: 'Data Booster',
      benefits: { data: '3 GB', voice: 'NA', sms: 'NA' },
      category: 'DATA_ADDON',
      talktime: 0
    },
    {
      planId: 'AIR007',
      amount: 10,
      validity: 'NA',
      description: 'Talktime Recharge',
      benefits: {},
      category: 'TALKTIME',
      talktime: 7.47
    },
    {
      planId: 'AIR008',
      amount: 179,
      validity: '28 days',
      description: 'Data + Voice',
      benefits: { data: '2 GB/day', voice: 'Unlimited', sms: '100 SMS/day' },
      category: 'DATA_COMBO',
      talktime: 0
    }
  ],
  JIO: [
    {
      planId: 'JIO001',
      amount: 155,
      validity: '28 days',
      description: 'Unlimited Voice + Data',
      benefits: { data: '1 GB/day', voice: 'Unlimited', sms: '100 SMS/day', otherBenefits: ['Jio Apps'] },
      category: 'POPULAR',
      talktime: 0
    },
    {
      planId: 'JIO002',
      amount: 239,
      validity: '28 days',
      description: 'Prime Pack',
      benefits: { data: '1.5 GB/day', voice: 'Unlimited', sms: '100 SMS/day', otherBenefits: ['JioTV', 'JioCinema'] },
      category: 'RECOMMENDED',
      talktime: 0
    },
    {
      planId: 'JIO003',
      amount: 299,
      validity: '28 days',
      description: 'Premium Unlimited',
      benefits: { data: '2 GB/day', voice: 'Unlimited', sms: '100 SMS/day', otherBenefits: ['Netflix Mobile', 'Amazon Prime'] },
      category: 'POPULAR',
      talktime: 0
    },
    {
      planId: 'JIO004',
      amount: 666,
      validity: '84 days',
      description: 'Quarterly Pack',
      benefits: { data: '1.5 GB/day', voice: 'Unlimited', sms: '100 SMS/day' },
      category: 'LONG_TERM',
      talktime: 0
    },
    {
      planId: 'JIO005',
      amount: 2999,
      validity: '365 days',
      description: 'Annual Pack',
      benefits: { data: '2.5 GB/day', voice: 'Unlimited', sms: '100 SMS/day', otherBenefits: ['Jio Apps Subscription'] },
      category: 'ANNUAL',
      talktime: 0
    },
    {
      planId: 'JIO006',
      amount: 479,
      validity: '56 days',
      description: 'Value Pack',
      benefits: { data: '1.5 GB/day', voice: 'Unlimited', sms: '100 SMS/day', otherBenefits: ['JioSaavn Pro'] },
      category: 'LONG_TERM',
      talktime: 0
    },
    {
      planId: 'JIO007',
      amount: 10,
      validity: 'NA',
      description: 'Talktime Top-up',
      benefits: {},
      category: 'TALKTIME',
      talktime: 8.41
    },
    {
      planId: 'JIO008',
      amount: 25,
      validity: '28 days',
      description: 'Data Add-on',
      benefits: { data: '2 GB', voice: 'NA', sms: 'NA' },
      category: 'DATA_ADDON',
      talktime: 0
    },
    {
      planId: 'JIO009',
      amount: 209,
      validity: '28 days',
      description: 'Data Booster',
      benefits: { data: '1 GB/day', voice: 'Unlimited', sms: '100 SMS/day', otherBenefits: ['Extra 6GB Data'] },
      category: 'DATA_COMBO',
      talktime: 0
    },
    {
      planId: 'JIO010',
      amount: 1559,
      validity: '336 days',
      description: 'Long Term Value',
      benefits: { data: '1.5 GB/day', voice: 'Unlimited', sms: '100 SMS/day' },
      category: 'ANNUAL',
      talktime: 0
    }
  ],
  VI: [
    {
      planId: 'VI001',
      amount: 155,
      validity: '28 days',
      description: 'Unlimited Combo',
      benefits: { data: '1 GB/day', voice: 'Unlimited', sms: '100 SMS/day' },
      category: 'POPULAR',
      talktime: 0
    },
    {
      planId: 'VI002',
      amount: 239,
      validity: '28 days',
      description: 'Entertainment Plus',
      benefits: { data: '1.5 GB/day', voice: 'Unlimited', sms: '100 SMS/day', otherBenefits: ['Vi Movies & TV'] },
      category: 'RECOMMENDED',
      talktime: 0
    },
    {
      planId: 'VI003',
      amount: 299,
      validity: '28 days',
      description: 'Premium Pack',
      benefits: { data: '2 GB/day', voice: 'Unlimited', sms: '100 SMS/day', otherBenefits: ['Amazon Prime'] },
      category: 'POPULAR',
      talktime: 0
    },
    {
      planId: 'VI004',
      amount: 479,
      validity: '56 days',
      description: 'Double Validity Pack',
      benefits: { data: '1.5 GB/day', voice: 'Unlimited', sms: '100 SMS/day' },
      category: 'LONG_TERM',
      talktime: 0
    },
    {
      planId: 'VI005',
      amount: 719,
      validity: '84 days',
      description: 'Quarterly Pack',
      benefits: { data: '1.5 GB/day', voice: 'Unlimited', sms: '100 SMS/day', otherBenefits: ['Vi Movies & TV', 'Binge All Night'] },
      category: 'LONG_TERM',
      talktime: 0
    },
    {
      planId: 'VI006',
      amount: 2899,
      validity: '365 days',
      description: 'Annual Value Pack',
      benefits: { data: '1.5 GB/day', voice: 'Unlimited', sms: '100 SMS/day', otherBenefits: ['Weekend Data Rollover'] },
      category: 'ANNUAL',
      talktime: 0
    },
    {
      planId: 'VI007',
      amount: 19,
      validity: 'NA',
      description: 'Talktime Recharge',
      benefits: {},
      category: 'TALKTIME',
      talktime: 14.25
    },
    {
      planId: 'VI008',
      amount: 49,
      validity: '28 days',
      description: 'Data Add-on',
      benefits: { data: '4 GB', voice: 'NA', sms: 'NA' },
      category: 'DATA_ADDON',
      talktime: 0
    },
    {
      planId: 'VI009',
      amount: 181,
      validity: '28 days',
      description: 'Value for Money',
      benefits: { data: '1 GB/day', voice: 'Unlimited', sms: '100 SMS/day' },
      category: 'DATA_COMBO',
      talktime: 0
    }
  ],
  BSNL: [
    {
      planId: 'BSNL001',
      amount: 107,
      validity: '26 days',
      description: 'Budget Plan',
      benefits: { data: '1 GB/day', voice: 'Unlimited', sms: '100 SMS/day' },
      category: 'POPULAR',
      talktime: 0
    },
    {
      planId: 'BSNL002',
      amount: 187,
      validity: '28 days',
      description: 'Data Pack',
      benefits: { data: '2 GB/day', voice: 'Unlimited', sms: '100 SMS/day' },
      category: 'RECOMMENDED',
      talktime: 0
    },
    {
      planId: 'BSNL003',
      amount: 197,
      validity: '28 days',
      description: 'Premium Value',
      benefits: { data: '2 GB/day', voice: 'Unlimited', sms: '100 SMS/day', otherBenefits: ['BSNL Tunes'] },
      category: 'POPULAR',
      talktime: 0
    },
    {
      planId: 'BSNL004',
      amount: 397,
      validity: '80 days',
      description: 'Long Validity',
      benefits: { data: '1 GB/day', voice: 'Unlimited', sms: '100 SMS/day' },
      category: 'LONG_TERM',
      talktime: 0
    },
    {
      planId: 'BSNL005',
      amount: 1498,
      validity: '300 days',
      description: 'Annual Budget Pack',
      benefits: { data: '1 GB/day', voice: 'Unlimited', sms: '100 SMS/day' },
      category: 'ANNUAL',
      talktime: 0
    },
    {
      planId: 'BSNL006',
      amount: 2399,
      validity: '365 days',
      description: 'Yearly Unlimited',
      benefits: { data: '2 GB/day', voice: 'Unlimited', sms: '100 SMS/day' },
      category: 'ANNUAL',
      talktime: 0
    },
    {
      planId: 'BSNL007',
      amount: 10,
      validity: 'NA',
      description: 'Talktime',
      benefits: {},
      category: 'TALKTIME',
      talktime: 9.12
    },
    {
      planId: 'BSNL008',
      amount: 29,
      validity: '28 days',
      description: 'Data Voucher',
      benefits: { data: '2 GB', voice: 'NA', sms: 'NA' },
      category: 'DATA_ADDON',
      talktime: 0
    }
  ]
};

// Mock DTH Operators
const DTH_OPERATORS = {
  TATASKY: { name: 'Tata Sky', logo: 'https://via.placeholder.com/80?text=TataSky' },
  AIRTEL_DTH: { name: 'Airtel Digital TV', logo: 'https://via.placeholder.com/80?text=AirtelDTH' },
  DISH_TV: { name: 'Dish TV', logo: 'https://via.placeholder.com/80?text=DishTV' },
  SUN_DIRECT: { name: 'Sun Direct', logo: 'https://via.placeholder.com/80?text=SunDirect' }
};

// Mock DTH Plans
const DTH_PLANS = {
  TATASKY: [
    { planId: 'TATA001', amount: 499, validity: '30 days', planName: 'Family Entertainment Pack', description: '150+ channels including HD', channels: 150, category: 'BASE_PACK' },
    { planId: 'TATA002', amount: 250, validity: '30 days', planName: 'Sports HD Pack', description: 'All sports channels in HD', channels: 25, category: 'ADDON' },
    { planId: 'TATA003', amount: 199, validity: '30 days', planName: 'Movies Pack', description: 'Premium movie channels', channels: 30, category: 'ADDON' },
    { planId: 'TATA004', amount: 999, validity: '90 days', planName: 'Premium Annual', description: 'All channels with HD', channels: 250, category: 'ANNUAL' },
    { planId: 'TATA005', amount: 299, validity: '30 days', planName: 'Hindi Basic', description: 'All Hindi channels', channels: 80, category: 'BASE_PACK' },
    { planId: 'TATA006', amount: 699, validity: '30 days', planName: 'Premium HD', description: 'All channels with HD quality', channels: 200, category: 'BASE_PACK' }
  ],
  AIRTEL_DTH: [
    { planId: 'ADTH001', amount: 449, validity: '30 days', planName: 'Basic Pack', description: '120+ channels', channels: 120, category: 'BASE_PACK' },
    { planId: 'ADTH002', amount: 599, validity: '30 days', planName: 'Family Entertainment', description: '180+ channels with HD', channels: 180, category: 'BASE_PACK' },
    { planId: 'ADTH003', amount: 349, validity: '30 days', planName: 'Regional Plus', description: 'Regional language channels', channels: 100, category: 'BASE_PACK' },
    { planId: 'ADTH004', amount: 299, validity: '30 days', planName: 'Sports Pack', description: 'All sports channels', channels: 20, category: 'ADDON' },
    { planId: 'ADTH005', amount: 899, validity: '90 days', planName: 'Quarterly Value', description: 'Long validity pack', channels: 150, category: 'ANNUAL' },
    { planId: 'ADTH006', amount: 199, validity: '30 days', planName: 'HD Movie Pack', description: 'HD movies and entertainment', channels: 25, category: 'ADDON' }
  ],
  DISH_TV: [
    { planId: 'DISH001', amount: 399, validity: '30 days', planName: 'South Family Pack', description: 'Regional + National channels', channels: 140, category: 'BASE_PACK' },
    { planId: 'DISH002', amount: 299, validity: '30 days', planName: 'Hindi Pack', description: 'Hindi entertainment channels', channels: 90, category: 'BASE_PACK' },
    { planId: 'DISH003', amount: 549, validity: '30 days', planName: 'Family Sports HD', description: 'Sports + Entertainment', channels: 160, category: 'BASE_PACK' },
    { planId: 'DISH004', amount: 199, validity: '30 days', planName: 'Kids Pack', description: 'Kids channels bundle', channels: 15, category: 'ADDON' },
    { planId: 'DISH005', amount: 799, validity: '90 days', planName: 'Quarterly HD', description: 'HD channels for 3 months', channels: 180, category: 'ANNUAL' }
  ],
  SUN_DIRECT: [
    { planId: 'SUN001', amount: 350, validity: '30 days', planName: 'Tamil Basic Pack', description: 'Tamil channels package', channels: 100, category: 'BASE_PACK' },
    { planId: 'SUN002', amount: 250, validity: '30 days', planName: 'Telugu Pack', description: 'Telugu entertainment', channels: 80, category: 'BASE_PACK' },
    { planId: 'SUN003', amount: 499, validity: '30 days', planName: 'South Premium', description: 'All South Indian channels', channels: 150, category: 'BASE_PACK' },
    { planId: 'SUN004', amount: 199, validity: '30 days', planName: 'Movie Lovers', description: 'Regional movie channels', channels: 20, category: 'ADDON' },
    { planId: 'SUN005', amount: 699, validity: '90 days', planName: 'Value Pack', description: 'Long term value package', channels: 140, category: 'ANNUAL' }
  ]
};

// Plan Categories
const PLAN_CATEGORIES = [
  { code: 'POPULAR', name: 'Popular Plans' },
  { code: 'RECOMMENDED', name: 'Recommended' },
  { code: 'DATA_ADDON', name: 'Data Add-ons' },
  { code: 'TALKTIME', name: 'Talktime' },
  { code: 'LONG_TERM', name: 'Long Validity' },
  { code: 'ANNUAL', name: 'Annual Plans' },
  { code: 'DATA_COMBO', name: 'Data + Voice' }
];

// Mock Bill Payment Operators
const BILL_OPERATORS = {
  ELECTRICITY: [
    { id: 'ELEC001', name: 'Adani Electricity Mumbai', billerId: 'MAHA000MAHA01', logo: 'https://via.placeholder.com/80?text=Adani' },
    { id: 'ELEC002', name: 'TATA Power Delhi', billerId: 'DELHI000DEL01', logo: 'https://via.placeholder.com/80?text=TATA' },
    { id: 'ELEC003', name: 'BEST Mumbai', billerId: 'BEST000MUM01', logo: 'https://via.placeholder.com/80?text=BEST' },
    { id: 'ELEC004', name: 'BSES Rajdhani Delhi', billerId: 'BSES000DEL01', logo: 'https://via.placeholder.com/80?text=BSES' }
  ],
  WATER: [
    { id: 'WATER001', name: 'Mumbai Municipal Corporation', billerId: 'MMC000MUM01', logo: 'https://via.placeholder.com/80?text=MMC' },
    { id: 'WATER002', name: 'Delhi Jal Board', billerId: 'DJB000DEL01', logo: 'https://via.placeholder.com/80?text=DJB' }
  ],
  GAS: [
    { id: 'GAS001', name: 'Mahanagar Gas Limited', billerId: 'MGL000MUM01', logo: 'https://via.placeholder.com/80?text=MGL' },
    { id: 'GAS002', name: 'Indraprastha Gas Limited', billerId: 'IGL000DEL01', logo: 'https://via.placeholder.com/80?text=IGL' },
    { id: 'GAS003', name: 'Gujarat Gas Limited', billerId: 'GGL000GUJ01', logo: 'https://via.placeholder.com/80?text=GGL' }
  ]
};

/**
 * Detect mobile operator from number
 */
async function detectOperator(mobileNumber) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock detection based on first 4 digits
  const prefix = mobileNumber.substring(0, 4);
  let operator = 'AIRTEL';
  
  // JIO prefixes: 9876, 9123, 8888, 6000-6999, 7000-7999, 8000-8999
  if (['9876', '9123', '8888', '6000', '6111', '6222', '6333', '6444', '6555', '6666', '6777', '6888', '6999',
       '7000', '7111', '7222', '7333', '7444', '7555', '7666', '7777', '7888', '7999',
       '8000', '8111', '8222', '8333', '8444', '8555', '8666', '8777', '8888', '8999'].includes(prefix)) {
    operator = 'JIO';
  }
  // VI prefixes: 9999, 7777, 9090, 9191, 9292
  else if (['9999', '9090', '9191', '9292', '9393', '9494', '9595', '9696', '9797', '9898'].includes(prefix)) {
    operator = 'VI';
  }
  // BSNL prefixes: 9400, 9500, 9434, 9436
  else if (['9400', '9500', '9434', '9436', '9437', '9439', '9450', '9451', '9452', '9453'].includes(prefix)) {
    operator = 'BSNL';
  }
  // Default to AIRTEL for all other numbers

  const randomCircle = CIRCLES[Math.floor(Math.random() * CIRCLES.length)];

  return {
    success: true,
    mobile: mobileNumber,
    operator,
    operatorName: MOBILE_OPERATORS[operator].name,
    operatorLogo: MOBILE_OPERATORS[operator].logo,
    circle: randomCircle,
    type: 'PREPAID'
  };
}

/**
 * Get recharge plans for operator
 */
async function getRechargePlans(operator, circle) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const plans = MOBILE_PLANS[operator] || MOBILE_PLANS.AIRTEL;

  return {
    success: true,
    operator: MOBILE_OPERATORS[operator]?.name || 'Airtel',
    circle,
    plans,
    categories: PLAN_CATEGORIES
  };
}

/**
 * Process mobile recharge
 */
async function processMobileRecharge(rechargeData) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const txnId = `RCH${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  const operatorTxnId = `OP${Date.now()}${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

  return {
    success: true,
    status: 'SUCCESS',
    message: 'Recharge successful',
    transactionId: txnId,
    operatorTransactionId: operatorTxnId,
    mobile: rechargeData.mobile,
    operator: rechargeData.operator,
    amount: rechargeData.amount,
    timestamp: new Date().toISOString()
  };
}

/**
 * Get DTH operators
 */
async function getDTHOperators() {
  return {
    success: true,
    operators: Object.keys(DTH_OPERATORS).map(key => ({
      code: key,
      ...DTH_OPERATORS[key]
    }))
  };
}

/**
 * Get DTH plans
 */
async function getDTHPlans(operator) {
  await new Promise(resolve => setTimeout(resolve, 300));

  return {
    success: true,
    operator: DTH_OPERATORS[operator]?.name || 'Tata Sky',
    plans: DTH_PLANS[operator] || DTH_PLANS.TATASKY
  };
}

/**
 * Get bill payment operators by category
 */
async function getBillOperators(category) {
  await new Promise(resolve => setTimeout(resolve, 300));

  return {
    success: true,
    category,
    operators: BILL_OPERATORS[category] || []
  };
}

/**
 * Fetch bill details
 */
async function fetchBillDetails(billerId, accountNumber) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Mock bill data
  const billAmount = (Math.random() * 3000 + 500).toFixed(2);
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  return {
    success: true,
    billDetails: {
      accountNumber,
      billerId,
      customerName: 'John Doe',
      billAmount: parseFloat(billAmount),
      dueDate: dueDate.toISOString().split('T')[0],
      billDate: new Date().toISOString().split('T')[0],
      billNumber: `BILL${Date.now()}`,
      billPeriod: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      additionalInfo: {
        unitsConsumed: Math.floor(Math.random() * 500) + 100,
        previousBalance: 0,
        lateFee: 0
      }
    }
  };
}

/**
 * Process bill payment
 */
async function processBillPayment(paymentData) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const platformBillId = `BILL${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  const txnId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

  return {
    success: true,
    status: 'SUCCESS',
    message: 'Bill payment successful',
    platformBillID: platformBillId,
    txnReferenceId: txnId,
    receiptId: `RCPT${Date.now()}`,
    timestamp: new Date().toISOString(),
    acknowledgeNumber: `ACK${Math.random().toString(36).substr(2, 8).toUpperCase()}`
  };
}

module.exports = {
  detectOperator,
  getRechargePlans,
  processMobileRecharge,
  getDTHOperators,
  getDTHPlans,
  getBillOperators,
  fetchBillDetails,
  processBillPayment
};
