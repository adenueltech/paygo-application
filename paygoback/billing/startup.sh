#!/bin/bash

echo "🚀 Starting PayGo Billing System Setup..."

# Check if Docker is installed
if command -v docker &> /dev/null; then
    echo "✅ Docker found - using Docker for database setup"
    
    # Start PostgreSQL and Redis with Docker
    echo "📦 Starting PostgreSQL and Redis containers..."
    docker run -d --name paygo-postgres \
        -e POSTGRES_DB=paygo_billing \
        -e POSTGRES_PASSWORD=password \
        -p 5432:5432 \
        postgres:15
    
    docker run -d --name paygo-redis \
        -p 6379:6379 \
        redis:7-alpine
    
    echo "⏳ Waiting for databases to start..."
    sleep 10
    
else
    echo "❌ Docker not found. Please install Docker or set up PostgreSQL/Redis manually"
    echo "   PostgreSQL: Create database 'paygo_billing' with user 'postgres' and password 'password'"
    echo "   Redis: Start Redis server on port 6379"
fi

echo "🔧 Running database migrations..."
cd /home/dave/Code/paygo/paygo

# Create a simple migration SQL file if it doesn't exist
if [ ! -f "migration.sql" ]; then
    echo "📝 Creating basic database schema..."
    cat > migration.sql << 'EOF'
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
EOF
fi

echo "🎯 Starting the PayGo billing service..."
cargo run

echo "🎉 PayGo billing system is running!"
echo "📡 API is available at: http://localhost:8080"
echo "🔍 Health check: curl http://localhost:8080/api/v1/health"
echo "📝 API docs: Check src/api.rs for available endpoints"
