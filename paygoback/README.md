# PayGo Backend API

A comprehensive backend API for the PayGo platform - a flexible payment and service management system that enables users to pay-as-you-go for various digital services.

##  Overview

PayGo is a micro-billing platform that allows users to access services on a pay-per-use basis. The system supports real-time streaming sessions, wallet management, service marketplace, and consultation features between users and vendors.

##  Architecture

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │  External APIs  │
                       │   (Chipi, SMS)  │
                       └─────────────────┘
```

### Core Components

- **Authentication System**: JWT-based auth with role-based access (user/vendor/admin)
- **Wallet Management**: Crypto wallet integration with Chipi API
- **Service Marketplace**: Vendor service listings with pay-per-use billing
- **Streaming Sessions**: Real-time session management with Socket.IO
- **Consultation System**: User-vendor communication platform
- **Analytics**: Spending and usage analytics

## 📁 Project Structure

```
paygoback/
├── src/
│   ├── app.js                 # Main application entry point
│   ├── db/
│   │   └── connect.js         # MongoDB connection
│   ├── models/                # Database models
│   │   ├── Users.js           # User authentication model
│   │   ├── Service.js         # Service listings model
│   │   ├── StreamingSession.js # Session management model
│   │   ├── wallet.js          # Wallet/billing model
│   │   ├── Consultation.js    # Consultation system model
│   │   ├── Notification.js    # Notification model
│   │   ├── Image.js           # Image upload model
│   │   ├── Profile.js         # User profiles model
│   │   ├── VendorProfile.js   # Vendor profiles model
│   │   ├── AdminProfile.js    # Admin profiles model
│   │   ├── Billing.js         # Billing records model
│   │   └── DashboardStats.js  # Dashboard statistics model
│   ├── controllers/           # Business logic controllers
│   │   ├── auth.js            # Authentication logic
│   │   ├── Service.js         # Service management logic
│   │   ├── StreamingController.js # Session management logic
│   │   ├── wallet.js          # Wallet operations logic
│   │   ├── consultationController.js # Consultation logic
│   │   ├── profileController.js # Profile management logic
│   │   ├── vendorProfileController.js # Vendor profile logic
│   │   ├── notificationController.js # Notification logic
│   │   ├── imageController.js # Image upload logic
│   │   ├── userDashboardController.js # User dashboard logic
│   │   ├── vendorDashboardController.js # Vendor dashboard logic
│   │   └── billingController.js # Billing logic
│   ├── routes/                # API route definitions
│   │   ├── auth.js            # Authentication routes
│   │   ├── service.js         # Service routes
│   │   ├── streamRoutes.js    # Streaming routes
│   │   ├── wallet.js          # Wallet routes
│   │   ├── consultation.js    # Consultation routes
│   │   ├── profile.js         # Profile routes
│   │   ├── vendorProfile.js   # Vendor profile routes
│   │   ├── notifications.js   # Notification routes
│   │   ├── images.js          # Image routes
│   │   ├── dashboardRoutes.js # Dashboard routes
│   │   └── billing.js         # Billing routes
│   ├── middleware/            # Custom middleware
│   │   ├── authentication.js  # JWT authentication
│   │   ├── validation.js      # Input validation
│   │   ├── error-handler.js   # Error handling
│   │   ├── not-found.js       # 404 handler
│   │   ├── multer-config.js   # File upload config
│   │   └── upload.js          # Upload middleware
│   ├── utils/                 # Utility functions
│   │   ├── logger.js          # Logging utility
│   │   ├── chipi.js           # Chipi wallet API client
│   │   ├── wallet.js          # Wallet utilities
│   │   ├── notify.js          # Notification utilities
│   │   ├── sendEmail.js       # Email service
│   │   └── sendSMS.js         # SMS service
│   ├── errors/                # Error classes
│   │   ├── bad-request.js     # 400 error
│   │   ├── not-found.js       # 404 error
│   │   ├── unauthenticated.js # 401 error
│   │   ├── custom-api.js      # Custom API error
│   │   └── index.js           # Error exports
│   └── services/              # Service layer
│       └── walletService.js   # Wallet service logic
├── tests/                     # Test files
│   ├── setup.js               # Test configuration
│   ├── paygo.test.js          # Main API tests
│   └── role-based-streaming.test.js # Streaming tests
├── public/uploads/            # Uploaded files directory
├── logs/                      # Application logs
├── node_modules/              # Dependencies
├── package.json               # Project configuration
├── README.md                  # This file
└── ...
```

## 🔧 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd paygoback
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**

   Create a `.env` file in the root directory:

   ```env
   # Database
   MONGODB=mongodb://localhost:27017/paygo

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_LIFETIME=24h

   # Chipi Wallet API
   CHIPI_API_KEY=your-chipi-api-key

   # Email Service (optional)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-email-password

   # SMS Service (optional)
   TWILIO_SID=your-twilio-sid
   TWILIO_AUTH_TOKEN=your-twilio-token
   TWILIO_PHONE_NUMBER=your-twilio-number

   # Logging
   LOG_LEVEL=info

   # Server
   PORT=5000
   NODE_ENV=development
   ```

4. **Start MongoDB**
   ```bash
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication
```
POST /api/v1/auth/register  # User registration
POST /api/v1/auth/login     # User login
```

### Wallet Management
```
POST /api/v1/wallet/deposit         # Deposit funds
POST /api/v1/wallet/withdraw        # Withdraw funds
GET  /api/v1/wallet/balance         # Get balance
POST /api/v1/wallet/transfer        # Transfer to another user
GET  /api/v1/wallet/transactions    # Get transaction history
GET  /api/v1/wallet/address         # Get wallet address
POST /api/v1/wallet/swap            # Auto swap currencies
GET  /api/v1/wallet/analytics       # Spending analytics
```

### Service Marketplace
```
GET  /api/v1/service                # List all services
GET  /api/v1/service/:id            # Get service details
POST /api/v1/service                # Create service (vendor)
PUT  /api/v1/service/:id            # Update service (vendor)
DELETE /api/v1/service/:id          # Delete service (vendor)
GET  /api/v1/service/vendor/my-services # Vendor's services
PATCH /api/v1/service/:id/toggle-status # Toggle service status
```

### Streaming Sessions
```
POST /api/v1/streams/start          # Start session
PATCH /api/v1/streams/:sessionId/metrics # Update metrics
PATCH /api/v1/streams/:sessionId/stop   # Stop session
GET  /api/v1/streams/my-sessions    # User's sessions
```

### Consultations
```
POST /api/v1/consultations              # Create consultation
GET  /api/v1/consultations              # List user consultations
GET  /api/v1/consultations/:id          # Get consultation details
POST /api/v1/consultations/:id/message  # Send message
PATCH /api/v1/consultations/:id/status  # Update status (vendor)
GET  /api/v1/consultations/vendor/inbox # Vendor inbox
```

### Dashboard
```
GET /api/v1/dashboard/user/overview     # User dashboard
GET /api/v1/dashboard/user/sessions     # User sessions
GET /api/v1/dashboard/vendor/overview   # Vendor dashboard
GET /api/v1/dashboard/vendor/earnings   # Vendor earnings
```

### Profiles
```
POST /api/v1/profiles/create        # Create profile
GET  /api/v1/profiles/my-profile    # Get my profile
PATCH /api/v1/profiles/update       # Update profile
DELETE /api/v1/profiles/delete      # Delete profile
GET  /api/v1/profiles/all           # List all profiles
```

### Notifications
```
GET  /api/v1/notifications          # Get notifications
POST /api/v1/notifications          # Create notification
PATCH /api/v1/notifications/:id     # Mark as read
DELETE /api/v1/notifications/:id    # Delete notification
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **user**: Regular users who can access services and create sessions
- **vendor**: Service providers who can list services and manage consultations
- **admin**: Administrative users with full system access

## 💳 Payment Flow

1. **User Registration**: User creates account and optional wallet
2. **Service Discovery**: User browses available services
3. **Session Start**: User initiates streaming session
4. **Real-time Billing**: System charges per minute/second based on service rate
5. **Session End**: Final billing calculation and wallet deduction
6. **Analytics**: User can view spending and usage analytics

## 🔄 Real-time Features

The application uses Socket.IO for real-time communication:

- **Session Management**: Live session start/stop notifications
- **Cost Updates**: Real-time billing updates during sessions
- **Low Balance Alerts**: Automatic notifications when balance is low
- **Usage Tracking**: Live usage metrics updates

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test paygo.test.js
```

## 📊 Database Models

### User Model
```javascript
{
  name: String,
  email: String,
  password: String, // hashed
  role: ['user', 'vendor', 'admin'],
  walletAddress: String,
  isVerified: Boolean,
  isActive: Boolean
}
```

### Service Model
```javascript
{
  userId: ObjectId, // vendor
  name: String,
  description: String,
  category: String,
  type: ['video', 'audio', 'data', 'other'],
  rate: Number,
  unit: String, // per_second, per_minute, etc.
  isActive: Boolean
}
```

### StreamingSession Model
```javascript
{
  userId: ObjectId,
  vendorId: ObjectId,
  serviceId: ObjectId,
  sessionId: String, // UUID
  status: ['active', 'completed', 'cancelled'],
  startTime: Date,
  endTime: Date,
  totalCost: Number,
  qualityMetrics: Array
}
```

## 🚨 Error Handling

The API uses consistent error response format:

```json
{
  "message": "Error description",
  "statusCode": 400
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## 📝 Logging

The application uses Winston for structured logging. Logs are written to:
- `logs/error.log`: Error level logs
- `logs/combined.log`: All logs
- Console (development only)

## 🔒 Security Features

- **Input Validation**: Comprehensive validation using middleware
- **Authentication**: JWT with proper secret management
- **Authorization**: Role-based access control
- **Rate Limiting**: Express rate limiter protection
- **CORS**: Configured for cross-origin requests
- **Helmet**: Security headers
- **XSS Protection**: Input sanitization

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB=mongodb://username:password@host:port/database
JWT_SECRET=your-production-jwt-secret
CHIPI_API_KEY=your-production-chipi-key
LOG_LEVEL=warn
```

### PM2 Deployment

```bash
npm install -g pm2
pm2 start src/app.js --name paygo-backend
pm2 startup
pm2 save
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support or questions, please contact the development team or create an issue in the repository.

---

**PayGo Backend API v1.0.0**
Built with Node.js, Express, MongoDB, and Socket.IO
