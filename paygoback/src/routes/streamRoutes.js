const express = require('express');
const router = express.Router();
const { startSession, addMetrics, stopSession, getUserSessions } = require('../controllers/StreamingController');
const auth = require('../middleware/authentication'); // JWT middleware

router.post('/start', auth, startSession);
router.patch('/:sessionId/metrics', auth, addMetrics);
router.patch('/:sessionId/stop', auth, stopSession);
router.get('/my-sessions', auth, getUserSessions);

module.exports = router;
