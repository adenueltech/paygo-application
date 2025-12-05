// middleware/validation.js

// Validate integer ID (Sequelize auto-increment)
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  const idNum = parseInt(id, 10);
  if (!id || isNaN(idNum) || idNum <= 0) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  next();
};

// Validate required fields
const validateRequired = (fields) => {
  return (req, res, next) => {
    const missing = fields.filter(field => !req.body[field]);
    if (missing.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missing.join(', ')}`
      });
    }
    next();
  };
};

// Validate vendor role or allow users to create streaming services
const validateVendor = async (req, res, next) => {
  const User = require('../models/Users');
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Allow users to create streaming services (video type)
    const isStreamingService = req.body.type === 'video';
    const isVendor = user.role === 'vendor';

    if (!isVendor && !isStreamingService) {
      return res.status(403).json({ message: 'Access denied. Vendor account required for non-streaming services' });
    }

    req.user.vendor = user; // Attach for later use
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  validateObjectId,
  validateRequired,
  validateVendor
};