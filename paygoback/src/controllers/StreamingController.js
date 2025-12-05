const StreamingSession = require('../models/StreamingSession');
const Service = require('../models/Service');
const crypto = require('crypto');
const logger = require('../utils/logger');
const AgoraTokenService = require('../utils/agoraToken');
const { StatusCodes } = require('http-status-codes');

// Generate UUID using crypto.randomUUID for RFC 4122 compliance
const generateUUID = () => {
  return crypto.randomUUID();
};

// 🎟️ Generate VideoSDK token for streaming session
exports.generateVideoSDKToken = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Input validation
    if (!sessionId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Session ID is required' });
    }

    // For demo purposes, allow token generation without session check
    // TODO: Re-enable session validation for production

    // Generate VideoSDK JWT token
    const VIDEOSDK_API_KEY = process.env.VIDEOSDK_TOKEN;
    const VIDEOSDK_SECRET_KEY = process.env.VIDEOSDK_SECRET;

    if (!VIDEOSDK_API_KEY || !VIDEOSDK_SECRET_KEY) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'VideoSDK configuration missing'
      });
    }

    const roomId = `paygo-session-${sessionId}`;

    // Generate JWT token for VideoSDK
    const payload = {
      apikey: VIDEOSDK_API_KEY,
      permissions: ['allow_join', 'allow_mod'],
      version: 2,
      roomId: roomId,
      participantId: `user-${Date.now()}`,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    // Simple JWT generation (in production, use a proper JWT library)
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const encodeBase64 = (obj) => {
      return Buffer.from(JSON.stringify(obj)).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    };

    const crypto = require('crypto');
    const encodedHeader = encodeBase64(header);
    const encodedPayload = encodeBase64(payload);
    const data = `${encodedHeader}.${encodedPayload}`;

    const signature = crypto.createHmac('sha256', VIDEOSDK_SECRET_KEY).update(data).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    const token = `${data}.${signature}`;

    return res.status(StatusCodes.OK).json({
      message: 'VideoSDK token generated successfully',
      videosdkConfig: {
        roomId: roomId,
        token: token,
        mode: 'SEND_AND_RECV' // or 'RECV_ONLY' for audience
      }
    });

  } catch (error) {
    logger.error('Generate VideoSDK token error:', { error: error.message, sessionId });
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to generate VideoSDK token'
    });
  }
};

//  Start a new streaming session
exports.startSession = async (req, res) => {
  try {
    // ✅ 1. Check if user is a normal user (not vendor)
    if (req.user.role !== 'user') {
      return res.status(403).json({ 
        message: 'Access denied. Only normal users can start streaming sessions.',
        userRole: req.user.role 
      });
    }

    const { serviceId, device } = req.body;

    // Input validation
    if (!serviceId) {
      return res.status(400).json({ message: 'Service ID is required' });
    }
    if (!serviceId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid service ID format' });
    }

    // ✅ 2. Make sure the service exists
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    // ✅ 3. Check if user can access this service
    // Users can start sessions with any service, or with their own services
    const isOwnService = service.userId.toString() === req.user.userId;
    const canAccessService = req.user.role === 'user' || isOwnService;

    if (!canAccessService) {
      return res.status(403).json({ message: 'Access denied. You can only start sessions with available services.' });
    }

    // ✅ 4. Get vendorId from the service
    const vendorId = service.userId;

    // ✅ 4. Create a streaming session with ALL required fields
    const session = await StreamingSession.create({
      vendorId: vendorId,
      userId: req.user.userId,
      serviceId: serviceId,
      sessionId: generateUUID(),
      clientInfo: {
        device: device || 'unknown',
        ip: req.ip
      },
      startTime: new Date()
    });

    return res.status(201).json({
      message: 'Streaming session started successfully',
      session,
      userRole: req.user.role
    });
  } catch (error) {
    logger.error('Start session error:', { error: error.message, userId: req.user.userId, serviceId });
    return res.status(500).json({
      message: 'Failed to start session'
    });
  }
};


// 📊 Add streaming quality metrics
exports.addMetrics = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { bitrate, latency, frameDrops } = req.body;

    // Input validation
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }
    if (bitrate === undefined || latency === undefined || frameDrops === undefined) {
      return res.status(400).json({ message: 'bitrate, latency, and frameDrops are required' });
    }
    if (typeof bitrate !== 'number' || typeof latency !== 'number' || typeof frameDrops !== 'number') {
      return res.status(400).json({ message: 'bitrate, latency, and frameDrops must be numbers' });
    }

    const session = await StreamingSession.findOneAndUpdate(
      { sessionId },
      {
        $push: {
          qualityMetrics: {
            timestamp: new Date(),
            bitrate,
            latency,
            frameDrops
          }
        }
      },
      { new: true }
    );

    if (!session) return res.status(404).json({ message: 'Session not found' });

    return res.status(200).json({
      message: 'Metrics updated successfully',
      session
    });
  } catch (error) {
    logger.error('Metrics update error:', { error: error.message, sessionId });
    return res.status(500).json({ message: 'Failed to update metrics' });
  }
};

// 🛑 Stop session and calculate usage cost (Only session owner)
exports.stopSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Input validation
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    const session = await StreamingSession.findOne({ sessionId });

    if (!session) return res.status(404).json({ message: 'Session not found' });

    // ✅ Check if user owns this session
    if (session.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied. You can only stop your own sessions.' });
    }

    session.endTime = new Date();
    session.status = 'completed';

    // Calculate usage in minutes (PayGo billing is per minute)
    const usageMinutes = Math.ceil((session.endTime - session.startTime) / (1000 * 60));
    session.totalUsageSeconds = Math.floor((session.endTime - session.startTime) / 1000);

    // 💰 Calculate cost based on service rate (per minute)
    const service = await Service.findById(session.serviceId);
    const ratePerMinute = service ? service.rate : 1.0;

    session.totalCost = usageMinutes * ratePerMinute;

    await session.save();

    return res.status(200).json({
      message: 'Session stopped and cost calculated successfully',
      totalUsageMinutes: usageMinutes,
      totalUsageSeconds: session.totalUsageSeconds,
      totalCost: session.totalCost,
      ratePerMinute,
      session
    });
  } catch (error) {
    logger.error('Stop session error:', { error: error.message, sessionId });
    return res.status(500).json({ message: 'Failed to stop session' });
  }
};

// 🔍 Get user's active sessions (Only for normal users)
exports.getUserSessions = async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Access denied. Only normal users can view streaming sessions.' });
    }

    const sessions = await StreamingSession.find({ userId: req.user.userId })
      .populate('serviceId', 'name description rate')
      .sort({ startTime: -1 });

    return res.status(200).json({
      message: 'User sessions retrieved successfully',
      sessions,
      count: sessions.length
    });
  } catch (error) {
    logger.error('Get user sessions error:', { error: error.message, userId: req.user.userId });
    return res.status(500).json({ message: 'Failed to retrieve sessions' });
  }
};

// 🌐 Get all active/live sessions (Public - for marketplace)
exports.getActiveSessions = async (req, res) => {
  try {
    const activeSessions = await StreamingSession.find({
      status: 'active',
      endTime: null // Not ended yet
    })
      .populate('serviceId', 'name description rate type')
      .populate('vendorId', 'name')
      .sort({ startTime: -1 })
      .limit(20); // Limit to recent active sessions

    return res.status(200).json({
      message: 'Active sessions retrieved successfully',
      sessions: activeSessions,
      count: activeSessions.length
    });
  } catch (error) {
    logger.error('Get active sessions error:', { error: error.message });
    return res.status(500).json({ message: 'Failed to retrieve active sessions' });
  }
};
