-- Basic schema for PayGo billing system
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS streaming_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_code VARCHAR(12) UNIQUE NOT NULL,
    user_wallet_address VARCHAR(255) NOT NULL,
    vendor_wallet_address VARCHAR(255) NOT NULL,
    vendor_id VARCHAR(255) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    last_billed_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    rate_per_hour DECIMAL(20,8) NOT NULL,
    total_amount_billed DECIMAL(20,8) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS spending_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_wallet_address VARCHAR(255) NOT NULL,
    approved_amount DECIMAL(20,8) NOT NULL,
    remaining_amount DECIMAL(20,8) NOT NULL,
    rate_per_hour DECIMAL(20,8) NOT NULL,
    max_streaming_hours DECIMAL(10,2) NOT NULL,
    used_streaming_hours DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_code ON streaming_sessions(session_code);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON streaming_sessions(status);
CREATE INDEX IF NOT EXISTS idx_permissions_wallet ON spending_permissions(user_wallet_address);
CREATE INDEX IF NOT EXISTS idx_permissions_status ON spending_permissions(status);

-- PayGo Billing System Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Streaming sessions table
CREATE TABLE IF NOT EXISTS streaming_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_code VARCHAR(12) UNIQUE NOT NULL,
    user_wallet_address VARCHAR(255) NOT NULL,
    vendor_wallet_address VARCHAR(255) NOT NULL,
    vendor_id VARCHAR(255) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    last_billed_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    rate_per_hour DECIMAL(20,8) NOT NULL,
    total_amount_billed DECIMAL(20,8) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spending permissions table
CREATE TABLE IF NOT EXISTS spending_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_wallet_address VARCHAR(255) NOT NULL,
    approved_amount DECIMAL(20,8) NOT NULL,
    remaining_amount DECIMAL(20,8) NOT NULL,
    rate_per_hour DECIMAL(20,8) NOT NULL,
    max_streaming_hours DECIMAL(10,2) NOT NULL,
    used_streaming_hours DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing transactions table
CREATE TABLE IF NOT EXISTS billing_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES streaming_sessions(id),
    user_wallet_address VARCHAR(255) NOT NULL,
    vendor_wallet_address VARCHAR(255) NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    transaction_hash VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_code ON streaming_sessions(session_code);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON streaming_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON streaming_sessions(user_wallet_address);
CREATE INDEX IF NOT EXISTS idx_permissions_wallet ON spending_permissions(user_wallet_address);
CREATE INDEX IF NOT EXISTS idx_permissions_status ON spending_permissions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_session ON billing_transactions(session_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON billing_transactions(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON streaming_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON spending_permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON billing_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

