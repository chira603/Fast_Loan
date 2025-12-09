-- FAST LOAN Application - Sample Data
-- Seeds for testing and development
-- Note: Passwords are hashed using bcrypt (example hash for 'password123')

-- Insert Sample Users
INSERT INTO users (username, email, password_hash, role, full_name, phone, address, kyc_verified) VALUES
('admin', 'admin@fastloan.com', '$2b$10$rKzVQ5xP6Y3X8FmYvZ2N3eLnKGKGv.mGxEg5dkKPY3X8FmYvZ2N3e', 'admin', 'Admin User', '+1-555-0100', '123 Admin St, City, State', true),
('johndoe', 'john.doe@email.com', '$2b$10$rKzVQ5xP6Y3X8FmYvZ2N3eLnKGKGv.mGxEg5dkKPY3X8FmYvZ2N3e', 'client', 'John Doe', '+1-555-0101', '456 Main St, City, State', true),
('janedoe', 'jane.doe@email.com', '$2b$10$rKzVQ5xP6Y3X8FmYvZ2N3eLnKGKGv.mGxEg5dkKPY3X8FmYvZ2N3e', 'client', 'Jane Doe', '+1-555-0102', '789 Elm St, City, State', true),
('bobsmith', 'bob.smith@email.com', '$2b$10$rKzVQ5xP6Y3X8FmYvZ2N3eLnKGKGv.mGxEg5dkKPY3X8FmYvZ2N3e', 'client', 'Bob Smith', '+1-555-0103', '321 Oak Ave, City, State', false),
('alicejohnson', 'alice.j@email.com', '$2b$10$rKzVQ5xP6Y3X8FmYvZ2N3eLnKGKGv.mGxEg5dkKPY3X8FmYvZ2N3e', 'client', 'Alice Johnson', '+1-555-0104', '654 Pine Rd, City, State', true);

-- Insert Sample Loans
INSERT INTO loans (user_id, amount, tenure_months, interest_rate, emi, status, application_date, approval_date, purpose, employment_status, monthly_income, repayment_schedule) VALUES
(2, 3000.00, 12, 12.00, 266.07, 'approved', CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '8 days', 'Home Renovation', 'Employed', 5000.00, 
'[{"month": 1, "due_date": "2026-01-07", "amount": 266.07, "principal": 236.07, "interest": 30.00, "status": "pending"}, 
  {"month": 2, "due_date": "2026-02-07", "amount": 266.07, "principal": 238.43, "interest": 27.64, "status": "pending"},
  {"month": 3, "due_date": "2026-03-07", "amount": 266.07, "principal": 240.81, "interest": 25.26, "status": "pending"},
  {"month": 4, "due_date": "2026-04-07", "amount": 266.07, "principal": 243.22, "interest": 22.85, "status": "pending"},
  {"month": 5, "due_date": "2026-05-07", "amount": 266.07, "principal": 245.65, "interest": 20.42, "status": "pending"},
  {"month": 6, "due_date": "2026-06-07", "amount": 266.07, "principal": 248.11, "interest": 17.96, "status": "pending"},
  {"month": 7, "due_date": "2026-07-07", "amount": 266.07, "principal": 250.59, "interest": 15.48, "status": "pending"},
  {"month": 8, "due_date": "2026-08-07", "amount": 266.07, "principal": 253.10, "interest": 12.97, "status": "pending"},
  {"month": 9, "due_date": "2026-09-07", "amount": 266.07, "principal": 255.63, "interest": 10.44, "status": "pending"},
  {"month": 10, "due_date": "2026-10-07", "amount": 266.07, "principal": 258.19, "interest": 7.88, "status": "pending"},
  {"month": 11, "due_date": "2026-11-07", "amount": 266.07, "principal": 260.77, "interest": 5.30, "status": "pending"},
  {"month": 12, "due_date": "2026-12-07", "amount": 266.07, "principal": 263.38, "interest": 2.69, "status": "pending"}]'),

(3, 5000.00, 24, 10.50, 233.26, 'disbursed', CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP - INTERVAL '12 days', 'Medical Emergency', 'Employed', 7500.00, 
'[{"month": 1, "due_date": "2026-01-07", "amount": 233.26, "principal": 189.76, "interest": 43.50, "status": "pending"}]'),

(4, 2000.00, 6, 14.00, 352.92, 'pending', CURRENT_TIMESTAMP - INTERVAL '2 days', NULL, 'Debt Consolidation', 'Self-Employed', 3500.00, NULL),

(5, 4500.00, 18, 11.50, 279.35, 'approved', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '3 days', 'Education', 'Employed', 6000.00, 
'[{"month": 1, "due_date": "2026-01-07", "amount": 279.35, "principal": 243.60, "interest": 35.75, "status": "pending"}]'),

(2, 1500.00, 12, 12.50, 134.41, 'rejected', CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP - INTERVAL '28 days', 'Personal Use', 'Employed', 5000.00, NULL);

-- Insert Sample Payments
INSERT INTO payments (loan_id, amount, payment_date, status, transaction_id, payment_method) VALUES
(2, 233.26, CURRENT_TIMESTAMP - INTERVAL '5 days', 'success', 'TXN001234567890', 'Credit Card'),
(2, 233.26, CURRENT_TIMESTAMP - INTERVAL '35 days', 'success', 'TXN001234567891', 'Bank Transfer');

-- Insert Sample Contact Submissions
INSERT INTO contacts (user_id, name, email, message, submitted_at, resolved) VALUES
(2, 'John Doe', 'john.doe@email.com', 'I have a question about my loan application status. Can you please provide an update?', CURRENT_TIMESTAMP - INTERVAL '3 days', true),
(NULL, 'Sarah Williams', 'sarah.w@email.com', 'What are the eligibility criteria for a $4000 loan? I would like to apply.', CURRENT_TIMESTAMP - INTERVAL '1 day', false),
(3, 'Jane Doe', 'jane.doe@email.com', 'Thank you for the quick approval! The process was very smooth.', CURRENT_TIMESTAMP - INTERVAL '10 days', true);

-- Insert Sample Notifications
INSERT INTO notifications (user_id, title, message, type, read) VALUES
(2, 'Loan Approved', 'Your loan application #1 for $3000 has been approved!', 'loan_approval', true),
(2, 'Payment Due', 'Your EMI payment of $266.07 is due on January 7, 2026.', 'payment_reminder', false),
(3, 'Loan Disbursed', 'Your loan amount of $5000 has been disbursed to your account.', 'loan_disbursement', true),
(4, 'Application Received', 'We have received your loan application and it is under review.', 'application_status', true),
(5, 'Loan Approved', 'Your loan application #4 for $4500 has been approved!', 'loan_approval', false);

-- Insert Sample Audit Logs
INSERT INTO audit_logs (user_id, action, table_name, record_id, ip_address) VALUES
(1, 'USER_LOGIN', 'users', 1, '192.168.1.100'),
(2, 'LOAN_APPLICATION_SUBMITTED', 'loans', 1, '192.168.1.101'),
(1, 'LOAN_APPROVED', 'loans', 1, '192.168.1.100'),
(3, 'USER_LOGIN', 'users', 3, '192.168.1.102'),
(2, 'PAYMENT_MADE', 'payments', 1, '192.168.1.101');

-- Insert Sample Billers
INSERT INTO billers (biller_id, name, category, logo_url, fetch_requirement, is_active) VALUES
('ELEC001', 'Adani Electricity Mumbai', 'ELECTRICITY', 'https://via.placeholder.com/100?text=Adani', 'MANDATORY', true),
('ELEC002', 'TATA Power Delhi', 'ELECTRICITY', 'https://via.placeholder.com/100?text=TATA', 'MANDATORY', true),
('WATER001', 'Mumbai Municipal Corporation', 'WATER', 'https://via.placeholder.com/100?text=MMC', 'MANDATORY', true),
('GAS001', 'Mahanagar Gas Limited', 'GAS', 'https://via.placeholder.com/100?text=MGL', 'MANDATORY', true);

-- Insert Sample Saved Billers
INSERT INTO saved_billers (user_id, biller_id, nickname, account_number, operator_name, category) VALUES
(2, 1, 'Home Electricity', '1234567890', 'Adani Electricity Mumbai', 'ELECTRICITY'),
(2, 3, 'Home Water', '9876543210', 'Mumbai Municipal Corporation', 'WATER');

-- Insert Sample Bill Payments
INSERT INTO bill_payments (user_id, biller_id, operator_name, account_number, customer_name, bill_amount, payment_amount, status, platform_bill_id, transaction_id) VALUES
(2, 1, 'Adani Electricity Mumbai', '1234567890', 'John Doe', 1250.00, 1250.00, 'success', 'BILL001', 'TXN2025001'),
(3, 2, 'TATA Power Delhi', '5555666677', 'Jane Doe', 890.50, 890.50, 'success', 'BILL002', 'TXN2025002');

-- Insert Sample Recharges
INSERT INTO recharges (user_id, recharge_type, operator_name, circle, mobile_number, amount, plan_id, status, transaction_id) VALUES
(2, 'MOBILE', 'Airtel', 'Mumbai', '9876543210', 299.00, 'AIR_MUM_299', 'success', 'RCH2025001'),
(3, 'DTH', 'Tata Sky', NULL, NULL, 500.00, 'TATA_BASE_500', 'success', 'RCH2025002'),
(2, 'MOBILE', 'Jio', 'Mumbai', '9123456789', 239.00, 'JIO_MUM_239', 'success', 'RCH2025003');

-- Summary Statistics Query (for verification)
-- Uncomment to run after seeding

-- SELECT 
--     (SELECT COUNT(*) FROM users) as total_users,
--     (SELECT COUNT(*) FROM users WHERE role = 'client') as total_clients,
--     (SELECT COUNT(*) FROM loans) as total_loans,
--     (SELECT COUNT(*) FROM loans WHERE status = 'approved') as approved_loans,
--     (SELECT COUNT(*) FROM payments) as total_payments,
--     (SELECT COUNT(*) FROM contacts) as total_contacts,
--     (SELECT COUNT(*) FROM billers) as total_billers,
--     (SELECT COUNT(*) FROM bill_payments) as total_bill_payments,
--     (SELECT COUNT(*) FROM recharges) as total_recharges;
