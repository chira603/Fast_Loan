-- Add loan_payments table for tracking EMI and other loan payments
CREATE TABLE IF NOT EXISTS loan_payments (
  id SERIAL PRIMARY KEY,
  loan_id INTEGER NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('emi', 'prepayment', 'closing')),
  transaction_ref VARCHAR(100) UNIQUE NOT NULL,
  upi_vpa VARCHAR(100),
  upi_txn_id VARCHAR(100),
  response_code VARCHAR(10),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'cancelled')),
  payment_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_loan_payments_loan_id ON loan_payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_user_id ON loan_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_loan_payments_transaction_ref ON loan_payments(transaction_ref);
CREATE INDEX IF NOT EXISTS idx_loan_payments_status ON loan_payments(status);

-- Add paid_amount column to loans table if it doesn't exist
ALTER TABLE loans ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS disbursement_date TIMESTAMP;

-- Add loan_disbursements table for tracking when loans are disbursed to users
CREATE TABLE IF NOT EXISTS loan_disbursements (
  id SERIAL PRIMARY KEY,
  loan_id INTEGER NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  transaction_ref VARCHAR(100) UNIQUE NOT NULL,
  disbursement_method VARCHAR(50) DEFAULT 'bank_transfer' CHECK (disbursement_method IN ('bank_transfer', 'upi', 'wallet')),
  bank_account_number VARCHAR(50),
  ifsc_code VARCHAR(20),
  upi_vpa VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  transaction_id VARCHAR(100),
  disbursement_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_loan_disbursements_loan_id ON loan_disbursements(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_disbursements_user_id ON loan_disbursements(user_id);
CREATE INDEX IF NOT EXISTS idx_loan_disbursements_status ON loan_disbursements(status);

-- Add UPI configuration table (for storing business UPI details)
CREATE TABLE IF NOT EXISTS upi_config (
  id SERIAL PRIMARY KEY,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default UPI config (update these with actual values)
INSERT INTO upi_config (config_key, config_value) VALUES 
  ('business_upi_vpa', 'fastloan@paytm'),
  ('business_name', 'Fast Loan'),
  ('merchant_code', '5399')
ON CONFLICT (config_key) DO NOTHING;

COMMENT ON TABLE loan_payments IS 'Tracks all EMI and loan repayments made by users';
COMMENT ON TABLE loan_disbursements IS 'Tracks loan amount disbursements to users after approval';
COMMENT ON TABLE upi_config IS 'Stores UPI payment configuration for the business';
