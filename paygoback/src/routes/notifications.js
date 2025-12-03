// routes/notifications.js
const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authentication');
const {
  createNotification,
  getUserNotifications,
  markAsRead,
  deleteNotification
} = require('../controllers/notificationController');

router.route('/')
  .post(authenticateUser, createNotification)
  .get(authenticateUser, getUserNotifications);

router.route('/:id')
  .patch(authenticateUser, markAsRead)
  .delete(authenticateUser, deleteNotification);

module.exports = router;
