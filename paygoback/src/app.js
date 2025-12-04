require('dotenv').config();
require('express-async-errors');

// extra security packages
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');
const fileUpload = require('express-fileupload');
const path = require('path');

const http = require('http');
const { Server } = require('socket.io');

const { sendEmail, sendSMS } = require('./utils/notify');
// Swagger
//const swaggerUI = require('swagger-ui-express');
//const YAML = require('yamljs');
//const swaggerDocument = YAML.load('./swagger.yaml');

// Blockchain service
const blockchainService = require('./services/blockchainService');

const express = require('express');
const app = express();
const server = http.createServer(app);

// ✅ Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000', // Development
      'https://paygo-application.vercel.app', // Production frontend
      '*' // Allow all for now, but should be restricted in production
    ],
    methods: ['GET', 'POST']
  }
});

// 💬 Real-time connection logic
io.on('connection', (socket) => {
  console.log(`🟢 New client connected: ${socket.id}`);

  // When a user starts a session
  socket.on('start-session', async(userId) => {
    console.log(`User ${userId} started session`);

    // Notify user by email/SMS
    await sendEmail(user.email, 'Session Started', `Your session has started successfully.`);
    await sendSMS(user.phone, `🚗 Your session has started successfully.`);


    io.emit('session-started', { userId, message: 'Session started successfully' });
  });

    socket.on('stop-session', async (user) => {
    console.log(`User ${user.id} stopped session`);

    await sendEmail(user.email, 'Session Ended', `Your session has ended.`);
    await sendSMS(user.phone, `🛑 Your session has ended.`);

    io.emit('session-stopped', { userId: user.id });
  });

  socket.on('low-balance', async (user) => {
    if (user.balance < 100) {
      const msg = `⚠️ Your wallet balance is low: ${user.balance}. Please recharge.`;
      await sendEmail(user.email, 'Low Balance Alert', msg);
      await sendSMS(user.phone, msg);
    }
  });


  // When user activity/usage updates
  socket.on('usage-update', (data) => {
    console.log('Usage data:', data);

    // Example: calculate cost dynamically
    const cost = data.usage * 0.05; // Your rate logic

    io.emit('cost-update', {
      userId: data.userId,
      usage: data.usage,
      cost,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Client disconnected: ${socket.id}`);
  });
});







const connectDB = require('./db/connect');
const authenticateUser = require('./middleware/authentication');
 
// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

/*app.set('trust proxy', 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);*/
app.use(express.json());
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000', // Development
    'https://paygo-application.vercel.app', // Production frontend
    '*' // Allow all for now, but should be restricted in production
  ],
  credentials: true
}));
app.use(xss());

//app.get('/', (req, res) => {
//res.send('<h1>Jobs API</h1><a href="/api-docs">Documentation</a>');
//});
//app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
// Enable file uploads
app.use(fileUpload({
  createParentPath: true,
  limits: {
    fileSize: 6 * 1024 * 1024 // 6MB limit (matches your validation)
  },
  abortOnLimit: false, // Set to false to handle errors gracefully
  safeFileNames: true,
  preserveExtension: true
}));
// Serve static files from public directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Health check endpoint (works even without database)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'PayGo Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

//app.use('/api/billing', billingRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;


const start = async () => {
  try {
    // Try to connect to PostgreSQL (don't fail if it doesn't work)
    let sequelize = null;
    try {
      sequelize = connectDB(process.env.DATABASE_URL || process.env.DATABASE_URL);
      await sequelize.sync({ alter: true }); // Sync database models with alter

      // Initialize models BEFORE requiring routes
      const initModels = require('./models');
      const models = initModels(sequelize);

      console.log('✅ PostgreSQL database connected and synced');
      console.log('✅ Models initialized');
    } catch (dbError) {
      console.log('⚠️  Database connection failed, running without database:', dbError.message);
      console.log('📝 Some features will not work without database connection');
    }

    // Always set up routes, even if database fails
    try {
      const notificationRoutes = require('./routes/notifications');
      const authRouter = require('./routes/auth');
      const profileRoutes = require('./routes/profile');
      const VendorRouter = require('./routes/vendorProfile');
      const AdminProfileRouter = require('./routes/AdminProfile');
      const walletRoutes = require('./routes/wallet');
      const serviceRoutes = require('./routes/service');
      const streamRoutes = require('./routes/streamRoutes');
      const dashboardRoutes = require('./routes/dashboardRoutes');
      const consultationRoutes = require('./routes/consultation');
      const imageRoutes = require('./routes/images');

      // Set up routes
      app.use('/api/v1/auth', authRouter);
      if (sequelize) {
        app.use('/api/v1/profile', authenticateUser, profileRoutes);
        app.use('/api/v1/images', imageRoutes);
        app.use('/api/v1/profiles', authenticateUser, profileRoutes);
        app.use('/api/v1/vendorprofiles', authenticateUser, VendorRouter);
        app.use('/api/v1/Adminprofiles', authenticateUser, AdminProfileRouter);
        app.use('/api/v1/wallet', authenticateUser, walletRoutes);
        app.use('/api/v1/service', authenticateUser, serviceRoutes);
        app.use('/api/v1/dashboard', dashboardRoutes);
        app.use('/api/v1/notifications', notificationRoutes);
        app.use('/api/v1/consultations', consultationRoutes);
      }
      app.use('/api/v1/streams', streamRoutes);

      console.log('✅ Routes initialized');
    } catch (routeError) {
      console.log('❌ Error setting up routes:', routeError.message);
    }

    // Initialize blockchain service (don't fail if it doesn't work)
    try {
      const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org';
      const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;

      if (privateKey && privateKey !== 'your_private_key_here') {
        await blockchainService.initialize(rpcUrl, privateKey);
        console.log('✅ Blockchain service initialized');
      } else {
        console.log('⚠️  Blockchain private key not provided - running in read-only mode');
        await blockchainService.initialize(rpcUrl);
      }
    } catch (blockchainError) {
      console.log('⚠️  Blockchain service initialization failed:', blockchainError.message);
    }

    server.listen(port, () =>
      console.log(`🚀 Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log('❌ Critical error starting server:', error);
    // Still try to start server even with errors
    server.listen(port, () =>
      console.log(`🚨 Server started with errors on port ${port}...`)
    );
  }
};

start();

module.exports = app;