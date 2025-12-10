-- Migration for Tap-to-Delay Repayment & Flex+ Membership Feature
-- Date: December 10, 2025

-- 1. Create delay_requests table
CREATE TABLE IF NOT EXISTS delay_requests (
    id SERIAL PRIMARY KEY,
    loan_id INTEGER NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emi_month INTEGER NOT NULL,
    original_due_date DATE NOT NULL,
    new_due_date DATE NOT NULL,
    delay_days INTEGER NOT NULL CHECK (delay_days >= 1 AND delay_days <= 2),
    delay_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    extra_interest DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_charge DECIMAL(10,2) NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'approved',
    payment_status VARCHAR(20) DEFAULT 'pending',
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_delay_days CHECK (delay_days BETWEEN 1 AND 2)
);

-- 2. Create flex_subscriptions table for Flex+ Membership
CREATE TABLE IF NOT EXISTS flex_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_type VARCHAR(50) DEFAULT 'flex_plus',
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 99.00,
    status VARCHAR(20) DEFAULT 'active',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    auto_renewal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('active', 'expired', 'cancelled'))
);

-- 3. Create delay_payments table to track delay fee payments
CREATE TABLE IF NOT EXISTS delay_payments (
    id SERIAL PRIMARY KEY,
    delay_request_id INTEGER NOT NULL REFERENCES delay_requests(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100) UNIQUE,
    upi_txn_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    payment_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_payment_status CHECK (status IN ('pending', 'success', 'failed'))
);

-- 4. Add columns to loans table for Flex+ and 28-day EMI tracking
ALTER TABLE loans 
ADD COLUMN IF NOT EXISTS flex_subscription_expiry TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_emi_date DATE,
ADD COLUMN IF NOT EXISTS next_emi_date DATE,
ADD COLUMN IF NOT EXISTS total_delays_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS emi_cycle_days INTEGER DEFAULT 28;

-- 5. Add columns to users table for Flex+ membership
ALTER TABLE users
ADD COLUMN IF NOT EXISTS has_flex_plus BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS flex_plus_expiry TIMESTAMP,
ADD COLUMN IF NOT EXISTS total_flex_delays_used INTEGER DEFAULT 0;

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_delay_requests_loan_id ON delay_requests(loan_id);
CREATE INDEX IF NOT EXISTS idx_delay_requests_user_id ON delay_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_delay_requests_status ON delay_requests(status);
CREATE INDEX IF NOT EXISTS idx_delay_requests_created_at ON delay_requests(created_at);

CREATE INDEX IF NOT EXISTS idx_flex_subscriptions_user_id ON flex_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_flex_subscriptions_status ON flex_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_flex_subscriptions_end_date ON flex_subscriptions(end_date);

CREATE INDEX IF NOT EXISTS idx_delay_payments_delay_request_id ON delay_payments(delay_request_id);
CREATE INDEX IF NOT EXISTS idx_delay_payments_user_id ON delay_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_delay_payments_status ON delay_payments(status);

-- 7. Create function to check if user has active Flex+ subscription
CREATE OR REPLACE FUNCTION has_active_flex_plus(p_user_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    v_has_active BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM flex_subscriptions 
        WHERE user_id = p_user_id 
        AND status = 'active' 
        AND end_date > CURRENT_TIMESTAMP
    ) INTO v_has_active;
    
    RETURN v_has_active;
END;
$$ LANGUAGE plpgsql;

-- 8. Create function to calculate next EMI date (28-day cycle)
CREATE OR REPLACE FUNCTION calculate_next_emi_date(p_loan_id INTEGER)
RETURNS DATE AS $$
DECLARE
    v_last_emi_date DATE;
    v_next_emi_date DATE;
BEGIN
    SELECT last_emi_date INTO v_last_emi_date
    FROM loans
    WHERE id = p_loan_id;
    
    IF v_last_emi_date IS NULL THEN
        -- First EMI: 28 days from disbursement
        SELECT disbursement_date + INTERVAL '28 days' INTO v_next_emi_date
        FROM loans
        WHERE id = p_loan_id;
    ELSE
        -- Subsequent EMIs: 28 days from last EMI
        v_next_emi_date := v_last_emi_date + INTERVAL '28 days';
    END IF;
    
    RETURN v_next_emi_date;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger to update Flex+ status in users table
CREATE OR REPLACE FUNCTION update_user_flex_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'active' AND NEW.end_date > CURRENT_TIMESTAMP THEN
        UPDATE users 
        SET has_flex_plus = TRUE, 
            flex_plus_expiry = NEW.end_date
        WHERE id = NEW.user_id;
    ELSIF NEW.status IN ('expired', 'cancelled') OR NEW.end_date <= CURRENT_TIMESTAMP THEN
        UPDATE users 
        SET has_flex_plus = FALSE, 
            flex_plus_expiry = NULL
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_flex_status
    AFTER INSERT OR UPDATE ON flex_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_flex_status();

-- 10. Create trigger to update loan's total_delays_count
CREATE OR REPLACE FUNCTION update_loan_delays_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' THEN
        UPDATE loans 
        SET total_delays_count = total_delays_count + 1
        WHERE id = NEW.loan_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_loan_delays_count
    AFTER INSERT OR UPDATE ON delay_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_loan_delays_count();

-- 11. Create view for active Flex+ subscribers
CREATE OR REPLACE VIEW active_flex_subscribers AS
SELECT 
    u.id as user_id,
    u.username,
    u.email,
    u.full_name,
    fs.id as subscription_id,
    fs.start_date,
    fs.end_date,
    fs.amount_paid,
    fs.auto_renewal,
    u.total_flex_delays_used,
    EXTRACT(DAY FROM (fs.end_date - CURRENT_TIMESTAMP)) as days_remaining
FROM users u
JOIN flex_subscriptions fs ON u.id = fs.user_id
WHERE fs.status = 'active' 
AND fs.end_date > CURRENT_TIMESTAMP
ORDER BY fs.end_date;

-- 12. Create view for delay requests summary
CREATE OR REPLACE VIEW delay_requests_summary AS
SELECT 
    dr.id,
    dr.loan_id,
    dr.user_id,
    u.full_name,
    u.email,
    l.amount as loan_amount,
    dr.emi_month,
    dr.delay_days,
    dr.original_due_date,
    dr.new_due_date,
    dr.total_charge,
    dr.status,
    dr.payment_status,
    dr.created_at,
    CASE 
        WHEN u.has_flex_plus THEN 'Flex+ Member'
        ELSE 'Regular User'
    END as user_type
FROM delay_requests dr
JOIN users u ON dr.user_id = u.id
JOIN loans l ON dr.loan_id = l.id
ORDER BY dr.created_at DESC;

-- 13. Insert sample Flex+ pricing configuration
CREATE TABLE IF NOT EXISTS flex_pricing (
    id SERIAL PRIMARY KEY,
    plan_name VARCHAR(50) NOT NULL,
    duration_months INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    features JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO flex_pricing (plan_name, duration_months, price, features) VALUES
('Flex+ Monthly', 1, 99.00, '{"free_delays": true, "delay_fee_discount": 50, "extra_interest_discount": 50, "priority_support": true}'),
('Flex+ Quarterly', 3, 249.00, '{"free_delays": true, "delay_fee_discount": 50, "extra_interest_discount": 50, "priority_support": true, "savings": 48}'),
('Flex+ Annual', 12, 899.00, '{"free_delays": true, "delay_fee_discount": 50, "extra_interest_discount": 50, "priority_support": true, "savings": 289}')
ON CONFLICT DO NOTHING;

-- 14. Comments for documentation
COMMENT ON TABLE delay_requests IS 'Stores EMI delay requests with 1-2 day flexibility';
COMMENT ON TABLE flex_subscriptions IS 'Tracks Flex+ membership subscriptions (₹99/month)';
COMMENT ON TABLE delay_payments IS 'Tracks payments for delay fees';
COMMENT ON TABLE flex_pricing IS 'Stores Flex+ subscription pricing plans';

COMMENT ON COLUMN loans.emi_cycle_days IS '28-day EMI cycle as per requirement';
COMMENT ON COLUMN delay_requests.delay_days IS 'Number of days to delay (1 or 2 only)';
COMMENT ON COLUMN flex_subscriptions.amount_paid IS 'Subscription amount (₹99/month default)';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE '✅ Tap-to-Delay Repayment feature tables created';
    RAISE NOTICE '✅ Flex+ Membership (₹99/month) system implemented';
    RAISE NOTICE '✅ 28-day EMI cycle configured';
    RAISE NOTICE '✅ 1-2 days delay limit enforced';
END $$;
