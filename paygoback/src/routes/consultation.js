// routes/consultation.js
const express = require('express');
const router = express.Router();
const {
  createConsultation,
  getUserConsultations,
  getConsultationById,
  sendMessage,
  updateStatus,
  getVendorInbox
} = require('../controllers/consultationController');
const authenticateUser = require('../middleware/authentication');

// Create consultation
router.post('/', authenticateUser, createConsultation);

// Get user's consultations
router.get('/', authenticateUser, getUserConsultations);

// Get consultation by ID
router.get('/:id', authenticateUser, getConsultationById);

// Send message
router.post('/:id/message', authenticateUser, sendMessage);

// Update status (vendor)
router.patch('/:id/status', authenticateUser, updateStatus);

// Vendor inbox
router.get('/vendor/inbox', authenticateUser, getVendorInbox);

module.exports = router;