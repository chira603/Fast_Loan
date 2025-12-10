/**
 * EMI Calculator Utility
 * Calculates Equated Monthly Installment for a loan
 * 
 * Formula: EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)
 * Where:
 * P = Principal loan amount
 * r = Monthly interest rate (annual rate / 12 / 100)
 * n = Number of monthly installments
 */

export const calculateEMI = (principal, annualRate, tenureMonths) => {
  const monthlyRate = annualRate / 12 / 100;
  const emi = 
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);

  const totalAmount = emi * tenureMonths;
  const totalInterest = totalAmount - principal;

  return {
    emi: Math.round(emi * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    principal: Math.round(principal * 100) / 100,
  };
};

/**
 * Generate repayment schedule
 */
export const generateRepaymentSchedule = (principal, annualRate, tenureMonths, startDate = new Date()) => {
  const monthlyRate = annualRate / 12 / 100;
  const emi = calculateEMI(principal, annualRate, tenureMonths).emi;
  
  const schedule = [];
  let remainingPrincipal = principal;
  const start = new Date(startDate);

  for (let month = 1; month <= tenureMonths; month++) {
    const interestPayment = remainingPrincipal * monthlyRate;
    const principalPayment = emi - interestPayment;
    remainingPrincipal -= principalPayment;

    const dueDate = new Date(start);
    dueDate.setMonth(dueDate.getMonth() + month);

    schedule.push({
      month,
      due_date: dueDate.toISOString().split('T')[0],
      amount: Math.round(emi * 100) / 100,
      principal: Math.round(principalPayment * 100) / 100,
      interest: Math.round(interestPayment * 100) / 100,
      balance: Math.max(0, Math.round(remainingPrincipal * 100) / 100),
      status: 'pending',
    });
  }

  return schedule;
};

/**
 * Calculate total loan cost
 */
export const calculateLoanCost = (principal, annualRate, tenureMonths) => {
  const { totalAmount, totalInterest } = calculateEMI(principal, annualRate, tenureMonths);
  const processingFee = principal * 0.02; // 2% processing fee (example)
  
  return {
    totalAmount,
    totalInterest,
    processingFee: Math.round(processingFee * 100) / 100,
    totalCost: Math.round((totalAmount + processingFee) * 100) / 100,
  };
};

/**
 * Validate loan amount
 */
export const validateLoanAmount = (amount) => {
  const min = parseFloat(import.meta.env.VITE_MIN_LOAN_AMOUNT) || 1;
  const max = parseFloat(import.meta.env.VITE_MAX_LOAN_AMOUNT) || 500000;
  
  if (isNaN(amount) || amount < min || amount > max) {
    return {
      valid: false,
      message: `Loan amount must be between ₹${min.toLocaleString('en-IN')} and ₹${max.toLocaleString('en-IN')}`,
    };
  }
  
  return { valid: true };
};

/**
 * Validate tenure
 */
export const validateTenure = (months) => {
  const min = parseInt(import.meta.env.VITE_MIN_TENURE) || 3;
  const max = parseInt(import.meta.env.VITE_MAX_TENURE) || 36;
  
  if (isNaN(months) || months < min || months > max) {
    return {
      valid: false,
      message: `Tenure must be between ${min} and ${max} months`,
    };
  }
  
  return { valid: true };
};

/**
 * Format currency in Indian Rupees
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Calculate affordability
 */
export const checkAffordability = (monthlyIncome, emiAmount) => {
  const emiToIncomeRatio = (emiAmount / monthlyIncome) * 100;
  
  return {
    ratio: Math.round(emiToIncomeRatio * 100) / 100,
    affordable: emiToIncomeRatio <= 40, // EMI should not exceed 40% of income
    message: emiToIncomeRatio <= 40 
      ? 'This loan is within your affordable range' 
      : 'This EMI exceeds recommended 40% of your monthly income',
  };
};
