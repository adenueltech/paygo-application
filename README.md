# PayGo - Pay-As-You-Go Digital Services Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![Rust](https://img.shields.io/badge/Rust-1.70+-orange.svg)](https://www.rust-lang.org/)

A revolutionary micro-billing platform that enables users to pay only for the digital services they actually use, featuring real-time billing, crypto wallet integration, and live streaming capabilities.

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Solution Overview](#-solution-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [API Documentation](#-api-documentation)
- [Smart Contracts & Blockchain](#-smart-contracts--blockchain)
- [Usage Examples](#-usage-examples)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## 🚨 Problem Statement

### Current Challenges in Digital Service Billing

1. **Rigid Payment Models**: Traditional services require upfront payments or fixed subscriptions, regardless of actual usage
2. **Lack of Granular Control**: Users cannot pay for exact service consumption (per minute, per feature)
3. **Limited Privacy**: Financial transactions often expose user spending patterns
4. **Complex Integration**: Service providers struggle to implement flexible billing systems
5. **High Entry Barriers**: Small service providers cannot afford sophisticated billing infrastructure

### Market Gap

- **Micro-billing Solutions**: No comprehensive platform for real-time, usage-based billing
- **Privacy-First Payments**: Limited options for private, crypto-based micro-transactions
- **Unified Platform**: Fragmented solutions for streaming, consultations, and digital services

## 💡 Solution Overview

PayGo is a comprehensive pay-as-you-go platform that revolutionizes digital service billing through:

### Core Innovation
- **Real-time Micro-billing**: Pay per minute/second of service usage
- **Privacy-First Architecture**: Zcash integration for shielded transactions
- **Unified Marketplace**: Single platform for multiple service types
- **Role-Based Ecosystem**: Users, vendors, and administrators with tailored experiences

### Business Model
- **Users**: Pay only for consumed services with transparent pricing
- **Vendors**: Earn from service provision with automated billing
- **Platform**: Revenue through transaction fees and premium features

## ✨ Key Features

### 🔐 User Management
- **Role-Based Access**: User (consumer), Vendor (provider), Admin (system)
- **Secure Authentication**: JWT-based auth with encrypted passwords
- **Profile Management**: Comprehensive user and vendor profiles

### 💰 Wallet & Billing System
- **Crypto Integration**: Support for ZEC, WZEC, USDT, USDC, ETH, DAI
- **PayGo UID**: Unique identifier for seamless service integration
- **Real-time Billing**: Per-minute/second charge calculation
- **Privacy Protection**: Shielded Zcash addresses for transaction privacy

### 📺 Live Streaming & Services
- **Agora Integration**: High-quality video streaming with low latency
- **Multi-Participant Sessions**: Host-audience streaming capabilities
- **Service Marketplace**: Browse and subscribe to vendor services
- **Consultation System**: Real-time user-vendor communication

### 📊 Analytics & Insights
- **Spending Analytics**: Detailed usage and cost breakdown
- **Vendor Earnings**: Comprehensive revenue tracking
- **Performance Metrics**: Service quality and usage statistics
- **Real-time Notifications**: Balance alerts and session updates

### 🔄 Real-time Features
- **Socket.IO Integration**: Live session management and notifications
- **Cost Updates**: Real-time billing during active sessions
- **Low Balance Alerts**: Automatic warnings at 20% balance threshold
- **Session Monitoring**: Live usage tracking and quality metrics

## 🛠 Technology Stack

### Frontend
```json
{
  "framework": "Next.js 16",
  "language": "TypeScript",
  "styling": "Tailwind CSS",
  "ui-components": "Radix UI",
  "streaming": "Agora RTC SDK",
  "blockchain": "Ethers.js v6",
  "charts": "Recharts",
  "forms": "React Hook Form + Zod",
  "animations": "Framer Motion"
}
```

### Backend API
```json
{
  "runtime": "Node.js 18+",
  "framework": "Express.js",
  "database": "MongoDB",
  "blockchain": "Ethers.js v6 + Web3.js v4",
  "authentication": "JWT",
  "real-time": "Socket.IO",
  "validation": "Custom middleware",
  "logging": "Winston",
  "testing": "Jest + Supertest"
}
```

### Smart Contracts (Solidity)
```json
{
  "framework": "Foundry",
  "network": "Base Sepolia",
  "contracts": [
    "PayGoEscrowVault",
    "PayGoBilling",
    "PayGoMarketplace",
    "PayGoMerchantRegistry",
    "PayGoSubscriptionScheduler"
  ],
  "security": "OpenZeppelin",
  "testing": "Foundry Test Suite"
}
```

### External Integrations
- **Agora**: Live streaming and video conferencing
- **MetaMask**: Web3 wallet integration
- **Base Network**: Ethereum Layer 2 for fast, low-cost transactions
- **Twilio**: SMS notifications
- **Email Service**: Transaction confirmations

## 🔗 System Integration Architecture

### Component Communication Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │ Smart Contracts │
│  (Next.js)      │◄──►│   (Node.js)     │◄──►│   (Solidity)    │
│                 │    │                 │    │                 │
│ • React UI      │    │ • REST API      │    │ • Escrow Vault  │
│ • Web3 Wallet   │    │ • JWT Auth      │    │ • Billing System │
│ • Agora Stream  │    │ • MongoDB       │    │ • Marketplace    │
│ • Real-time UI  │    │ • Blockchain    │    │ • Subscriptions  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
       │                       │                       │
       └───────────────────────┼───────────────────────┘
                               ▼
                    ┌─────────────────┐
                    │   Base Network  │
                    │   (Layer 2)     │
                    └─────────────────┘
```

### Integration Points

1. **Wallet Connection**: Frontend connects to MetaMask → Backend validates → Smart contracts store balances
2. **Session Billing**: Frontend starts session → Backend calls smart contract → Real-time billing on-chain
3. **Payment Processing**: User deposits → Escrow vault → Service charges → Merchant withdrawals
4. **Streaming Integration**: Agora SDK handles video → Backend tracks usage → Smart contracts bill per minute

### Data Flow Example: Starting a Session

1. **User Action**: Click "Start Session" in frontend
2. **Wallet Interaction**: MetaMask prompts for transaction approval
3. **Smart Contract Call**: Frontend calls `startSession()` on PayGoBilling contract
4. **Backend Sync**: API receives webhook/transaction confirmation
5. **Database Update**: MongoDB updated with session details
6. **Real-time Updates**: Socket.IO broadcasts session status
7. **Agora Integration**: Video streaming begins with billing tracking

### Security Integration

- **Multi-layer Authentication**: JWT + Web3 signature verification
- **On-chain Verification**: All financial transactions verified on blockchain
- **Role-based Access**: Smart contracts enforce user/vendor permissions
- **Encrypted Communications**: HTTPS + WebSocket secure connections

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PayGo Platform                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Frontend  │    │   Backend   │    │   Billing   │     │
│  │  Next.js    │◄──►│  Node.js    │◄──►│   Rust      │     │
│  │   React     │    │  Express    │    │  Actix-web  │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   MongoDB   │    │ PostgreSQL  │    │    Redis    │     │
│  │   Sessions  │    │   Billing   │    │   Cache     │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Zcash     │    │   Agora     │    │   Chipi     │     │
│  │ Blockchain  │    │  Streaming  │    │   Wallet    │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### System Components

1. **Frontend Layer**: User interface and client-side logic
2. **API Gateway**: Request routing and authentication
3. **Business Logic**: Service management and user operations
4. **Billing Engine**: Real-time payment processing
5. **Blockchain Layer**: Crypto wallet and transaction management
6. **External Services**: Third-party integrations

## 📁 Project Structure

```
pay-go-app-build/
├── paygofrontend/           # Next.js Frontend Application
│   ├── app/                 # Next.js App Router
│   ├── components/          # Reusable React Components
│   ├── lib/                 # Utilities and Hooks
│   ├── styles/              # Global Styles
│   └── public/              # Static Assets
├── paygoback/              # Node.js Backend API
│   ├── src/
│   │   ├── controllers/     # Business Logic
│   │   ├── models/          # Database Models
│   │   ├── routes/          # API Routes
│   │   ├── middleware/      # Custom Middleware
│   │   ├── utils/           # Helper Functions
│   │   └── services/        # External Service Integrations
│   ├── billing/             # Rust Billing Service
│   │   ├── src/             # Rust Source Code
│   │   ├── Cargo.toml       # Rust Dependencies
│   │   └── migration.sql    # Database Schema
│   └── tests/               # API Tests
└── README.md               # This file
```

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** 4.4+
- **MetaMask** or compatible Web3 wallet
- **Base Sepolia test ETH** (for blockchain interactions)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pay-go-app-build
   ```

2. **Setup Backend API**
   ```bash
   cd paygoback
   npm install
   cp .env.example .env  # Configure environment variables
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../paygofrontend
   npm install
   npm run dev
   ```

4. **Deploy Smart Contracts** (Already deployed to Base Sepolia)
   - Contracts are pre-deployed at the addresses listed in `paygosmart-contract/deployed-contracts.txt`
   - No additional deployment needed for development

### Environment Configuration

#### Backend (.env)
```env
# Database
MONGODB=mongodb://localhost:27017/paygo

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_LIFETIME=24h

# Blockchain (Base Sepolia)
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BLOCKCHAIN_PRIVATE_KEY=your_private_key_here

# Smart Contract Addresses
ESCROW_VAULT_ADDRESS=0xA973806Ba9102D42f102467EC9c0c859639139Be
BILLING_ADDRESS=0xB83B7fACFeAd639850A8E18D85f0AB0324D5b6D8
MARKETPLACE_ADDRESS=0xF4a7D296c6bfC7B3B1c9dA3c854E98153F957906
MERCHANT_REGISTRY_ADDRESS=0xc324464a1aC5C103c6060Df094f38Cb20d07c33d
SUBSCRIPTION_SCHEDULER_ADDRESS=0x1fEd1080A7D8369a5376406fc75Ee4C71f3997a6

# Email & SMS (optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
TWILIO_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token

# Server
PORT=5000
NODE_ENV=development
```

#### Frontend Environment
The frontend automatically connects to Base Sepolia and uses the deployed contract addresses.

### Environment Configuration

#### Backend (.env)
```env
# Database
MONGODB=mongodb://localhost:27017/paygo
POSTGRES_URL=postgresql://user:pass@localhost/paygo_billing

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_LIFETIME=24h

# Blockchain
ZCASH_RPC_URL=http://localhost:8232
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY

# External Services
AGORA_APP_ID=your-agora-app-id
AGORA_APP_CERTIFICATE=your-agora-certificate
CHIPI_API_KEY=your-chipi-api-key

# Notifications
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
TWILIO_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

## 📚 API Documentation

### Authentication Endpoints

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

### Wallet Management

```http
GET  /api/v1/wallet/balance
POST /api/v1/wallet/deposit
POST /api/v1/wallet/transfer
GET  /api/v1/wallet/analytics
```

### Service Marketplace

```http
GET  /api/v1/service
POST /api/v1/service          # Vendor only
PUT  /api/v1/service/:id      # Vendor only
```

### Streaming Sessions

```http
POST /api/v1/streams/start
PATCH /api/v1/streams/:id/stop
GET  /api/v1/streams/my-sessions
```

### Real-time Events (Socket.IO)

```javascript
// Connect to server
const socket = io('http://localhost:5000');

// Listen for balance updates
socket.on('balance-update', (data) => {
  console.log('New balance:', data.balance);
});

// Listen for session alerts
socket.on('session-alert', (alert) => {
  console.log('Alert:', alert.message);
});
```

## 🔗 Smart Contracts & Blockchain

### Zcash Integration

- **Shielded Addresses**: Privacy-preserving wallet addresses
- **Transaction Shielding**: Hide transaction amounts and participants
- **PayGo UID**: Unique identifier for service integration

### Supported Networks

- **Zcash Mainnet**: Primary privacy network
- **Ethereum**: ERC-20 token support
- **Cross-chain**: Wrapped Zcash (WZEC) for interoperability

### Billing Engine (Rust)

```rust
// Example: Process micro-payment
async fn process_payment(
    paygo_uid: &str,
    amount: Decimal,
    service_type: ServiceType
) -> Result<TransactionResult, BillingError> {
    // Validate PayGo UID
    // Check wallet balance
    // Process Zcash transaction
    // Update billing records
    // Return transaction result
}
```

## 💻 Usage Examples

### User Flow: Start Streaming Session

```javascript
// 1. User selects service and starts session
const response = await fetch('/api/v1/streams/start', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    serviceId: 'service_123',
    device: 'Chrome Desktop'
  })
});

const { session, agoraToken, userUid } = await response.json();

// 2. Initialize Agora streaming
const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
await client.join(agoraAppId, session.agoraChannel, agoraToken, userUid);

// 3. Session runs with real-time billing
// Balance deducted per minute automatically
```

### Vendor Flow: Create Service

```javascript
// Vendor creates new service
const service = await fetch('/api/v1/service', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${vendorToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Video Consultation',
    description: 'Professional video consultation service',
    type: 'video',
    rate: 2.50,  // $2.50 per minute
    category: 'consultation'
  })
});
```

## 🧪 Testing

### Backend Tests

```bash
cd paygoback
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm test -- auth.test.js   # Specific test file
```

### Integration Tests

```bash
# Run full system integration test
node test-integration.js

# Expected output:
# ✅ BACKEND: Backend API responding correctly
# ✅ BLOCKCHAIN: Connected to Base Sepolia
# ✅ CONTRACTS: All contracts deployed and accessible
# ✅ INTEGRATION: Basic integration flow working
```

### Manual Testing

#### Test Wallet Connection
1. Open frontend at `http://localhost:3000`
2. Click "Connect Wallet" in the dashboard
3. Approve MetaMask connection
4. Verify wallet address appears in UI

#### Test Session Billing
```bash
# Start a session (requires authentication)
curl -X POST http://localhost:5000/api/v1/wallet/charge-session \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"serviceId":"test_service"}'

# End session
curl -X POST http://localhost:5000/api/v1/wallet/end-session \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"your_session_id"}'
```

#### Test Smart Contract Interaction
```bash
# Check contract balance (read-only)
cast call 0xA973806Ba9102D42f102467EC9c0c859639139Be \
  "getUserBalance(address,address)(uint256)" \
  0xYourWalletAddress \
  0x0000000000000000000000000000000000000000 \
  --rpc-url https://sepolia.base.org
```

## 🚢 Deployment

### Production Environment Setup

1. **Configure Environment Variables**
   ```env
   NODE_ENV=production
   MONGODB=mongodb://prod-server/paygo
   REDIS_URL=redis://prod-cache:6379
   ```

2. **Build and Deploy**
   ```bash
   # Backend
   cd paygoback
   npm run build
   pm2 start ecosystem.config.js

   # Frontend
   cd paygofrontend
   npm run build
   npm start

   # Billing Service
   cd billing
   cargo build --release
   ./target/release/paygo
   ```

### Docker Deployment

```dockerfile
# Multi-stage build for Rust billing service
FROM rust:1.70 as builder
WORKDIR /app
COPY billing/ .
RUN cargo build --release

# Node.js API
FROM node:18-alpine
COPY paygoback/ /app/
RUN npm ci --only=production

# Next.js Frontend
FROM node:18-alpine as frontend
COPY paygofrontend/ /app/
RUN npm run build
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests for new features**
5. **Ensure all tests pass**
6. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
7. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open a Pull Request**

### Development Guidelines

- Follow ESLint and Prettier configurations
- Write comprehensive tests for new features
- Update documentation for API changes
- Use conventional commit messages
- Maintain code coverage above 80%

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Agora.io** for live streaming infrastructure
- **Zcash** for privacy-preserving blockchain technology
- **Chipi** for wallet API services
- **Open source community** for amazing tools and libraries

## 📞 Support

- **Documentation**: [Full API Docs](./paygoback/README.md)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

---

**PayGo v1.0.0** - Revolutionizing digital service billing with privacy-first, real-time micro-payments.

Built with ❤️ using Next.js, Node.js, Rust, and cutting-edge blockchain technology.