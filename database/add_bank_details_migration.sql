-- Add bank account details to users table for loan disbursement
-- Migration: Add Bank Details to Users Table
-- Date: 2024-01-XX

-- Add bank account fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_number VARCHAR(18);
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_holder_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS ifsc_code VARCHAR(11);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS branch_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_type VARCHAR(20) CHECK (account_type IN ('savings', 'current', NULL));
ALTER TABLE users ADD COLUMN IF NOT EXISTS upi_id VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_verified_at TIMESTAMP;

-- Add comments for documentation
COMMENT ON COLUMN users.account_number IS 'Bank account number for loan disbursement (9-18 digits)';
COMMENT ON COLUMN users.account_holder_name IS 'Name as per bank account';
COMMENT ON COLUMN users.ifsc_code IS 'Bank IFSC code for NEFT/RTGS/IMPS transfers';
COMMENT ON COLUMN users.bank_name IS 'Bank name (e.g., HDFC Bank, ICICI Bank)';
COMMENT ON COLUMN users.branch_name IS 'Bank branch name';
COMMENT ON COLUMN users.account_type IS 'Account type: savings or current';
COMMENT ON COLUMN users.upi_id IS 'UPI ID for instant disbursement (format: username@bank)';
COMMENT ON COLUMN users.bank_verified IS 'Whether bank account has been verified';
COMMENT ON COLUMN users.bank_verified_at IS 'Timestamp when bank account was verified';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_account_number ON users(account_number) WHERE account_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_ifsc_code ON users(ifsc_code) WHERE ifsc_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_upi_id ON users(upi_id) WHERE upi_id IS NOT NULL;

-- Update loan disbursements table to reference user bank details
-- (loan_disbursements table already has these fields as copy for audit trail)

-- Create a view for user bank details
CREATE OR REPLACE VIEW user_bank_details AS
SELECT 
    u.id as user_id,
    u.username,
    u.email,
    u.full_name,
    u.account_number,
    u.account_holder_name,
    u.ifsc_code,
    u.bank_name,
    u.branch_name,
    u.account_type,
    u.upi_id,
    u.bank_verified,
    u.bank_verified_at,
    CASE 
        WHEN u.account_number IS NOT NULL AND u.ifsc_code IS NOT NULL THEN TRUE
        ELSE FALSE
    END as has_bank_details,
    CASE 
        WHEN u.upi_id IS NOT NULL THEN TRUE
        ELSE FALSE
    END as has_upi_details
FROM users u;

-- Grant permissions on the view
GRANT SELECT ON user_bank_details TO PUBLIC;

-- Sample update statement (for testing - do not run in production)
-- UPDATE users SET 
--     account_number = '1234567890',
--     account_holder_name = 'John Doe',
--     ifsc_code = 'SBIN0001234',
--     bank_name = 'State Bank of India',
--     branch_name = 'Main Branch',
--     account_type = 'savings',
--     upi_id = 'johndoe@paytm',
--     bank_verified = TRUE,
--     bank_verified_at = CURRENT_TIMESTAMP
-- WHERE id = 1;

-- Verification queries
-- SELECT * FROM user_bank_details WHERE user_id = 1;
-- SELECT COUNT(*) as users_with_bank_details FROM users WHERE account_number IS NOT NULL;
-- SELECT COUNT(*) as users_with_upi FROM users WHERE upi_id IS NOT NULL;

COMMIT;
