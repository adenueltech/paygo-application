const StreamingSession = require('../models/StreamingSession');
const Service = require('../models/Service');
const crypto = require('crypto');
const logger = require('../utils/logger');
const AgoraTokenService = require('../utils/agoraToken');

// Generate UUID using crypto.randomUUID for RFC 4122 compliance
const generateUUID = () => {
  return crypto.randomUUID();
};

// 🎬 Start a new streaming session (Only for normal users)
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

    // ✅ 3. Get vendorId from the service
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
