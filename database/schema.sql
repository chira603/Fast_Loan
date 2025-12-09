-- FAST LOAN Application Database Schema
-- PostgreSQL Database Design
-- Created: December 2025

-- Enable UUID extension (optional, for better IDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing types if they exist (for clean migrations)
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS loan_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;

-- Drop existing tables for a clean migration (drop children first)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('client', 'admin');
CREATE TYPE loan_status AS ENUM ('pending', 'approved', 'rejected', 'disbursed', 'repaid');
CREATE TYPE payment_status AS ENUM ('success', 'failed');

-- Users Table (Clients and Admins)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'client',
    full_name VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    kyc_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loans Table (Loan Applications and Details)
CREATE TABLE IF NOT EXISTS loans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0 AND amount <= 5000),
    tenure_months INTEGER NOT NULL CHECK (tenure_months >= 3 AND tenure_months <= 36),
    interest_rate DECIMAL(5,2) NOT NULL CHECK (interest_rate > 0),
    emi DECIMAL(10,2) NOT NULL,
    status loan_status DEFAULT 'pending',
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approval_date TIMESTAMP,
    repayment_schedule JSONB,
    purpose VARCHAR(255),
    employment_status VARCHAR(100),
    monthly_income DECIMAL(10,2),
    notes TEXT
);

-- Payments Table (Repayment Tracking)
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    loan_id INTEGER NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status payment_status DEFAULT 'success',
    transaction_id VARCHAR(100) UNIQUE,
    payment_method VARCHAR(50),
    notes TEXT
);

-- Contacts Table (Contact Us Submissions)
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE
);

-- Notifications Table (Optional - for tracking user notifications)
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs Table (For compliance and security)
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_loans_user_id ON loans(user_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_application_date ON loans(application_date);

CREATE INDEX IF NOT EXISTS idx_payments_loan_id ON payments(loan_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

CREATE INDEX IF NOT EXISTS idx_contacts_submitted_at ON contacts(submitted_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- Trigger Function for Auto-updating updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply Trigger to Users Table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Billers Table (Operators/Service Providers)
CREATE TABLE IF NOT EXISTS billers (
    id SERIAL PRIMARY KEY,
    biller_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    logo_url TEXT,
    fetch_requirement VARCHAR(20),
    payment_modes JSONB,
    input_params JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bill Payments Table
CREATE TABLE IF NOT EXISTS bill_payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    biller_id INTEGER REFERENCES billers(id),
    operator_name VARCHAR(100),
    account_number VARCHAR(100),
    customer_name VARCHAR(200),
    bill_amount DECIMAL(10,2),
    payment_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    platform_bill_id VARCHAR(100) UNIQUE,
    transaction_id VARCHAR(100),
    operator_transaction_id VARCHAR(100),
    bill_number VARCHAR(100),
    due_date DATE,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    bill_details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recharges Table
CREATE TABLE IF NOT EXISTS recharges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recharge_type VARCHAR(50) NOT NULL,
    operator_name VARCHAR(100) NOT NULL,
    circle VARCHAR(50),
    mobile_number VARCHAR(15),
    account_number VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL,
    plan_id VARCHAR(100),
    plan_details JSONB,
    status VARCHAR(50) DEFAULT 'pending',
    transaction_id VARCHAR(100) UNIQUE,
    operator_transaction_id VARCHAR(100),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Saved Billers Table (Quick Access)
CREATE TABLE IF NOT EXISTS saved_billers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    biller_id INTEGER REFERENCES billers(id),
    nickname VARCHAR(100),
    account_number VARCHAR(100) NOT NULL,
    operator_name VARCHAR(100),
    category VARCHAR(50),
    auto_pay_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, account_number, category)
);

-- Indexes for Bill Payments & Recharges
CREATE INDEX IF NOT EXISTS idx_bill_payments_user_id ON bill_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_bill_payments_status ON bill_payments(status);
CREATE INDEX IF NOT EXISTS idx_bill_payments_date ON bill_payments(payment_date);

CREATE INDEX IF NOT EXISTS idx_recharges_user_id ON recharges(user_id);
CREATE INDEX IF NOT EXISTS idx_recharges_mobile ON recharges(mobile_number);
CREATE INDEX IF NOT EXISTS idx_recharges_status ON recharges(status);
CREATE INDEX IF NOT EXISTS idx_recharges_date ON recharges(payment_date);

CREATE INDEX IF NOT EXISTS idx_billers_category ON billers(category);
CREATE INDEX IF NOT EXISTS idx_saved_billers_user_id ON saved_billers(user_id);

-- Comments for Documentation
COMMENT ON TABLE users IS 'Stores user information for both clients and administrators';
COMMENT ON TABLE loans IS 'Stores loan application and management data';
COMMENT ON TABLE payments IS 'Tracks all loan repayments and transactions';
COMMENT ON TABLE contacts IS 'Stores contact form submissions';
COMMENT ON TABLE notifications IS 'User notifications for loan updates';
COMMENT ON TABLE audit_logs IS 'Security and compliance audit trail';
COMMENT ON TABLE billers IS 'Stores bill payment operators and service providers';
COMMENT ON TABLE bill_payments IS 'Tracks all bill payment transactions';
COMMENT ON TABLE recharges IS 'Tracks mobile, DTH, and other recharge transactions';
COMMENT ON TABLE saved_billers IS 'User saved billers for quick access';
