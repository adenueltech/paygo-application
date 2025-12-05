const express = require('express');
const router = express.Router();
const { startSession, addMetrics, stopSession, getUserSessions, getActiveSessions, generateVideoSDKToken } = require('../controllers/StreamingController');
const auth = require('../middleware/authentication'); // JWT middleware

router.post('/start', auth, startSession);
router.patch('/:sessionId/metrics', auth, addMetrics);
router.patch('/:sessionId/stop', auth, stopSession);
router.get('/my-sessions', auth, getUserSessions);
router.get('/active', getActiveSessions); // Public endpoint for marketplace
router.get('/:sessionId/videosdk-token', generateVideoSDKToken); // Temporarily remove auth for testing

module.exports = router;
