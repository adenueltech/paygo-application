# Agora Live Streaming Backend Integration Guide

This document outlines the backend changes required to integrate Agora Live Streaming with the PayGo platform.

## Required Backend Changes

### 1. Install Agora SDK in Backend

Add the following dependency to `paygoback/package.json`:

```json
{
  "dependencies": {
    "agora-access-token": "^2.0.4"
  }
}
```

Run `npm install` to install the package.

### 2. Update StreamingSession Model

Modify `paygoback/src/models/StreamingSession.js` to include Agora channel information:

```javascript
const streamingSessionSchema = new mongoose.Schema({
  // ... existing fields ...

  // Add Agora-specific fields
  agoraChannel: {
    type: String,
    required: true,
    unique: true
  },
  agoraToken: {
    type: String,
    required: true
  },
  agoraAppId: {
    type: String,
    required: true,
    default: '16508d8f8518406287ee4e7f839fb0c3'
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uid: {
      type: Number,
      required: true
    },
    role: {
      type: String,
      enum: ['host', 'audience'],
      default: 'audience'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // ... existing fields ...
}, { timestamps: true });
```

### 3. Create Agora Token Service

Create `paygoback/src/utils/agoraToken.js`:

```javascript
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const APP_ID = '16508d8f8518406287ee4e7f839fb0c3';
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE; // Add to .env

class AgoraTokenService {
  static generateRtcToken(channelName, uid, role = RtcRole.PUBLISHER) {
    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      channelName,
      uid,
      role,
      privilegeExpiredTs
    );

    return token;
  }

  static generateChannelName(sessionId) {
    return `paygo-session-${sessionId}`;
  }

  static generateUid() {
    return Math.floor(Math.random() * 100000) + 1;
  }
}

module.exports = AgoraTokenService;
```

### 4. Update Streaming Controller

Modify `paygoback/src/controllers/StreamingController.js` to integrate Agora:

```javascript
const AgoraTokenService = require('../utils/agoraToken');

// ... existing imports ...

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

    // ✅ 4. Generate Agora channel and token
    const channelName = AgoraTokenService.generateChannelName(req.params.id || generateUUID());
    const userUid = AgoraTokenService.generateUid();
    const vendorUid = AgoraTokenService.generateUid();
    const userToken = AgoraTokenService.generateRtcToken(channelName, userUid, RtcRole.PUBLISHER);
    const vendorToken = AgoraTokenService.generateRtcToken(channelName, vendorUid, RtcRole.PUBLISHER);

    // ✅ 5. Create a streaming session with ALL required fields including Agora data
    const session = await StreamingSession.create({
      vendorId: vendorId,
      userId: req.user.userId,
      serviceId: serviceId,
      sessionId: generateUUID(),
      clientInfo: {
        device: device || 'unknown',
        ip: req.ip
      },
      startTime: new Date(),
      agoraChannel: channelName,
      agoraToken: userToken, // User's token
      agoraAppId: '16508d8f8518406287ee4e7f839fb0c3',
      participants: [{
        userId: req.user.userId,
        uid: userUid,
        role: 'host'
      }]
    });

    return res.status(201).json({
      message: 'Streaming session started successfully',
      session: {
        ...session.toObject(),
        agoraToken: userToken,
        userUid,
        vendorUid,
        vendorToken // Send vendor token for vendor to join
      },
      userRole: req.user.role
    });
  } catch (error) {
    logger.error('Start session error:', { error: error.message, userId: req.user.userId, serviceId });
    return res.status(500).json({
      message: 'Failed to start session'
    });
  }
};

// Add new endpoint to get Agora token for existing session
exports.getAgoraToken = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await StreamingSession.findOne({ sessionId });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Check if user is participant
    const isParticipant = session.participants.some(p => p.userId.toString() === req.user.userId);
    if (!isParticipant) return res.status(403).json({ message: 'Access denied' });

    const participant = session.participants.find(p => p.userId.toString() === req.user.userId);
    const token = AgoraTokenService.generateRtcToken(session.agoraChannel, participant.uid);

    res.status(200).json({
      appId: session.agoraAppId,
      channel: session.agoraChannel,
      token,
      uid: participant.uid
    });
  } catch (error) {
    logger.error('Get Agora token error:', { error: error.message, sessionId });
    res.status(500).json({ message: 'Failed to generate token' });
  }
};
```

### 5. Add Agora Token Route

Add to `paygoback/src/routes/streamRoutes.js`:

```javascript
const { getAgoraToken } = require('../controllers/StreamingController');

// ... existing routes ...

router.get('/:sessionId/agora-token', auth, getAgoraToken);
```

### 6. Update Vendor Session Joining

When vendor joins, update the session participants:

```javascript
// In vendor dashboard or session management
exports.joinSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await StreamingSession.findOne({ sessionId });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Check if vendor owns this session
    if (session.vendorId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Add vendor as participant if not already
    const vendorExists = session.participants.some(p => p.userId.toString() === req.user.userId);
    if (!vendorExists) {
      const vendorUid = AgoraTokenService.generateUid();
      session.participants.push({
        userId: req.user.userId,
        uid: vendorUid,
        role: 'host'
      });
      await session.save();
    }

    const vendorParticipant = session.participants.find(p => p.userId.toString() === req.user.userId);
    const token = AgoraTokenService.generateRtcToken(session.agoraChannel, vendorParticipant.uid);

    res.status(200).json({
      appId: session.agoraAppId,
      channel: session.agoraChannel,
      token,
      uid: vendorParticipant.uid
    });
  } catch (error) {
    logger.error('Join session error:', { error: error.message, sessionId });
    res.status(500).json({ message: 'Failed to join session' });
  }
};
```

### 7. Environment Variables

Add to `.env` file:

```env
AGORA_APP_ID=16508d8f8518406287ee4e7f839fb0c3
AGORA_APP_CERTIFICATE=your-agora-app-certificate-here
```

### 8. Update Session End Logic

Modify the `stopSession` function to clean up Agora resources:

```javascript
// 🛑 Stop session and calculate usage cost (Only session owner)
exports.stopSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

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

    // TODO: Clean up Agora channel/resources if needed

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
```

## Testing the Integration

### 1. Start a Session
```bash
# User starts session
POST /api/v1/streams/start
{
  "serviceId": "507f1f77bcf86cd799439011",
  "device": "Chrome Desktop"
}
```

Response includes Agora credentials:
```json
{
  "session": {
    "agoraChannel": "paygo-session-uuid",
    "agoraToken": "token...",
    "userUid": 12345,
    "vendorUid": 67890,
    "vendorToken": "token..."
  }
}
```

### 2. Get Token for Existing Session
```bash
GET /api/v1/streams/{sessionId}/agora-token
```

### 3. Join as Vendor
```bash
POST /api/v1/streams/{sessionId}/join
```

## Security Considerations

1. **Token Expiration**: Tokens expire after 1 hour for security
2. **Channel Names**: Unique channels prevent unauthorized access
3. **UID Management**: Unique UIDs per participant
4. **Role-based Access**: Different permissions for users and vendors

## Monitoring and Analytics

Add metrics collection for:
- Session duration
- Participant count
- Video/audio quality metrics
- Billing accuracy
- Error rates

## Deployment Notes

1. Set `AGORA_APP_CERTIFICATE` in production environment
2. Configure proper CORS for Agora domains
3. Monitor Agora usage and costs
4. Set up proper logging for debugging

## Next Steps

1. Implement screen sharing
2. Add recording capabilities
3. Integrate with billing system
4. Add quality monitoring
5. Implement reconnection logic