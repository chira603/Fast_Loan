import * as Yup from 'yup';

// Login validation schema
export const loginSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

// Registration validation schema
export const registerSchema = Yup.object({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters')
    .required('Username is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  full_name: Yup.string()
    .required('Full name is required'),
  phone: Yup.string()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Invalid phone number')
    .optional(),
  address: Yup.string().optional(),
});

// Loan application validation schema
export const loanApplicationSchema = Yup.object({
  amount: Yup.number()
    .min(100, 'Minimum loan amount is $100')
    .max(5000, 'Maximum loan amount is $5000')
    .required('Loan amount is required'),
  tenure_months: Yup.number()
    .min(3, 'Minimum tenure is 3 months')
    .max(36, 'Maximum tenure is 36 months')
    .required('Tenure is required'),
  purpose: Yup.string()
    .required('Loan purpose is required'),
  employment_status: Yup.string()
    .required('Employment status is required'),
  monthly_income: Yup.number()
    .min(0, 'Monthly income must be positive')
    .required('Monthly income is required'),
});

// Contact form validation schema
export const contactSchema = Yup.object({
  name: Yup.string()
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  message: Yup.string()
    .min(10, 'Message must be at least 10 characters')
    .required('Message is required'),
});

// Password update validation schema
export const passwordUpdateSchema = Yup.object({
  currentPassword: Yup.string()
    .required('Current password is required'),
  newPassword: Yup.string()
    .min(6, 'New password must be at least 6 characters')
    .required('New password is required'),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm new password is required'),
});
