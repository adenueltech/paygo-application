// controllers/notificationController.js
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');
const sendSMS = require('../utils/sendSMS');

// 📬 Create a new notification
exports.createNotification = async (req, res) => {
  const { title, message, type } = req.body;
  const user = req.user.userId;

  const notification = await Notification.create({ user, title, message, type });

  // Optionally send Email or SMS based on type or user role
  if (type === 'payment') {
    await sendEmail(req.user.email, 'Payment Receipt', message);
  } else if (type === 'alert') {
    await sendSMS(req.user.phone, `Alert: ${message}`);
  }

  res.status(201).json({ success: true, notification });
};

// 📋 Get all notifications for logged-in user
exports.getUserNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user.userId })
    .sort({ createdAt: -1 });
  res.status(200).json({ count: notifications.length, notifications });
};

// 🧭 Mark as read
exports.markAsRead = async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findOneAndUpdate(
    { _id: id, user: req.user.userId },
    { read: true },
    { new: true }
  );
  if (!notification) {
    return res.status(404).json({ msg: 'Notification not found' });
  }
  res.status(200).json({ success: true, notification });
};

// 🗑️ Delete a notification
exports.deleteNotification = async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findOneAndDelete({
    _id: id,
    user: req.user.userId
  });
  if (!notification) {
    return res.status(404).json({ msg: 'Notification not found' });
  }
  res.status(200).json({ msg: 'Notification deleted' });
};
