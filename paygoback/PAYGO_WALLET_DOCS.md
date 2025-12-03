# PayGo Wallet System Documentation

## Overview
PayGo is a Pay-As-You-Go (PAYG) wallet system that enables micro-billing for streaming, consultations, SaaS, and other services. Users pay only for what they use, with real-time balance deduction and crypto wallet integration.

## Core Concepts

### PayGo UID
- **Purpose**: Unique identifier linking user wallet to service usage
- **Format**: 16-character hash generated from user ID
- **Usage**: Required for all PAYG transactions and SDK integration

### Supported Tokens
- **ZEC** (Zcash) - Primary privacy coin
- **WZEC** (Wrapped Zcash) - For cross-chain compatibility
- **USDT/USDC** - Stablecoins for consistent pricing
- **ETH/DAI** - Ethereum ecosystem tokens

## API Endpoints

### Wallet Management

#### Get PayGo UID
```http
GET /api/wallet/paygo-uid
Authorization: Bearer <token>
```
**Response:**
```json
{
  "paygoUID": "a1b2c3d4e5f6g7h8"
}
```

#### Deposit Funds
```http
POST /api/wallet/deposit
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 100,
  "token": "USDT",
  "transactionHash": "0x123..."
}
```

#### Get Balance
```http
GET /api/wallet/balance
Authorization: Bearer <token>
```
**Response:**
```json
{
  "balance": 85.50
}
```

### PAYG Operations

#### Charge Session (Micro-billing - Normal Users Only)
```http
POST /api/v1/wallet/charge-session
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "session_123",
  "amount": 2.50,
  "rate": 0.5,
  "duration": 5,
  "serviceType": "streaming"
}
```
**Response (Normal User):**
```json
{
  "msg": "Charge successful",
  "remainingBalance": 83.00,
  "isLowBalance": false,
  "sessionId": "session_123",
  "userRole": "user"
}
```
**Response (Vendor/Admin - Access Denied):**
```json
{
  "msg": "Access denied. Only normal users can be charged for sessions.",
  "userRole": "vendor"
}
```

#### Get Analytics
```http
GET /api/wallet/analytics
Authorization: Bearer <token>
```
**Response:**
```json
{
  "todaySpend": 12.50,
  "monthSpend": 245.75,
  "serviceBreakdown": {
    "streaming": 150.25,
    "consultation": 95.50
  },
  "totalBalance": 83.00
}
```

## User Flow

### 1. Onboarding
1. User signs up → Auto-wallet creation
2. System generates PayGo UID
3. Creates Zcash shielded address + ERC20 address
4. User selects role: **User** (consumer) or **Vendor** (service provider)
5. User receives wallet credentials

### 2. Funding Wallet
1. User deposits crypto via supported tokens
2. Balance updated in real-time
3. PayGo UID activated for spending

### 3. Service Usage (Role-Based)
**Normal Users:**
1. Browse marketplace for services
2. Subscribe to service using PayGo UID
3. **Can start streaming sessions**
4. Balance deducted per minute/usage
5. Low balance alerts at 20% threshold
6. Session ends → Final charge processed

**Vendors:**
1. Create and manage services
2. Set pricing and descriptions
3. **Cannot start streaming sessions** (only provide services)
4. Receive payments from users
5. View earnings analytics

### 4. Analytics & Management
1. View spending breakdown by service
2. Track daily/monthly usage
3. Manage subscriptions
4. Withdraw remaining funds

## SDK Integration

### For Vendors
```javascript
// Initialize PayGo SDK
const paygo = new PayGoSDK({
  apiKey: 'your_api_key',
  environment: 'production'
});

// Process payment
const result = await paygo.processPayment({
  paygoUID: 'user_paygo_uid',
  serviceId: 'your_service_id',
  usageMetrics: {
    rate: 0.5,        // per minute
    duration: 10,     // minutes
    serviceType: 'streaming',
    sessionId: 'session_123'
  }
});

if (result.success) {
  // Unlock service for user
  console.log('Payment successful:', result.transactionId);
} else {
  // Handle insufficient funds
  console.log('Payment failed:', result.error);
}
```

### Integration Steps
1. Add PayGo SDK to vendor website
2. User enters PayGo UID when starting service
3. Vendor sends usage metrics to PayGo backend
4. PayGo processes payment and returns success/failure
5. Vendor unlocks/locks service based on response

## Real-time Billing

### Session Charging (Role-Based)
- **Who Can Be Charged**: Only normal users (role: 'user')
- **Rate**: Defined per minute (e.g., $0.50/min)
- **Frequency**: Charged every minute during active session
- **Balance Check**: Before each charge
- **Alerts**: Low balance warning at 20% threshold
- **Access Control**: Vendors and admins cannot be charged

### Service Types & Rates
- **Streaming**: 1.0x base rate
- **Consultation**: 1.2x base rate (premium)
- **SaaS**: 0.8x base rate (discounted)
- **Data**: 1.1x base rate

### Role-Based Access
- **Normal Users**: Can start streams, can be charged
- **Vendors**: Create services, cannot start streams, cannot be charged
- **Admins**: System management, cannot start streams, cannot be charged

## Security Features

### Wallet Security
- Self-custody Zcash wallet with shielded addresses
- Encrypted private key storage
- PayGo UID for transaction privacy

### Transaction Security
- All transactions recorded with timestamps
- Session-based tracking prevents double charging
- Balance validation before each charge

## Error Handling

### Common Errors
```json
{
  "msg": "Insufficient balance",
  "currentBalance": 5.25,
  "required": 10.00
}
```

```json
{
  "msg": "Invalid PayGo UID",
  "error": "UID not found"
}
```

```json
{
  "msg": "Session expired",
  "sessionId": "session_123"
}
```

## Notifications

### Low Balance Alert
- Triggered at 20% of initial balance
- Sent via push notification and email
- In-session modal prompt for top-up

### Session Alerts
- Session paused due to zero balance
- Payment confirmation after each charge
- Session end summary with total cost

## Testing

### Test Endpoints
```bash
# Get PayGo UID (All roles)
curl -H "Authorization: Bearer <token>" \
     http://localhost:3001/api/v1/wallet/paygo-uid

# Start streaming session (Normal users only)
curl -X POST \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"serviceId":"service_123","device":"mobile"}' \
     http://localhost:3001/api/v1/streams/start

# Simulate session charge (Normal users only)
curl -X POST \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"sessionId":"test_123","amount":1.0,"rate":0.5,"duration":2,"serviceType":"streaming"}' \
     http://localhost:3001/api/v1/wallet/charge-session

# Get user sessions (Normal users only)
curl -H "Authorization: Bearer <token>" \
     http://localhost:3001/api/v1/streams/my-sessions
```

### Test Data
- Test PayGo UID: `test1234567890ab`
- Test session rates: $0.10/min for testing
- Test tokens: Use testnet versions

## Deployment Notes

### Environment Variables
```env
ZCASH_RPC_URL=http://localhost:8232
ZCASH_RPC_USER=username
ZCASH_RPC_PASS=password
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/...
LOW_BALANCE_THRESHOLD=20
```

### Database Indexes
```javascript
// Recommended indexes for performance
db.wallets.createIndex({ "userId": 1 }, { unique: true })
db.wallets.createIndex({ "paygoUID": 1 }, { unique: true })
db.wallets.createIndex({ "transactions.sessionId": 1 })
```

This documentation covers the complete PayGo wallet system flow, from user onboarding to real-time micro-billing and vendor SDK integration.