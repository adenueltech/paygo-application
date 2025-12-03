// controllers/consultationController.js
const Consultation = require('../models/Consultation');
const User = require('../models/Users');
const Service = require('../models/Service');

// Create a new consultation request
exports.createConsultation = async (req, res) => {
  try {
    const { vendorId, serviceId, initialMessage } = req.body;
    const userId = req.user.userId;

    if (!vendorId || !serviceId) {
      return res.status(400).json({ message: 'Vendor ID and Service ID are required' });
    }

    // Check if vendor exists and is a vendor
    const vendor = await User.findById(vendorId);
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(400).json({ message: 'Invalid vendor' });
    }

    // Check if service exists and belongs to vendor
    const service = await Service.findOne({ _id: serviceId, userId: vendorId });
    if (!service) {
      return res.status(400).json({ message: 'Service not found' });
    }

    const consultation = await Consultation.create({
      userId,
      vendorId,
      serviceId,
      messages: initialMessage ? [{
        sender: userId,
        message: initialMessage
      }] : []
    });

    res.status(201).json({
      message: 'Consultation request created successfully',
      consultation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's consultations
exports.getUserConsultations = async (req, res) => {
  try {
    const userId = req.user.userId;

    const consultations = await Consultation.find({ userId })
      .populate('vendorId', 'name email')
      .populate('serviceId', 'name')
      .sort({ createdAt: -1 });

    const formatted = consultations.map(c => ({
      id: c._id,
      vendor: c.vendorId.name,
      service: c.serviceId.name,
      status: c.status,
      date: c.createdAt.toISOString().split('T')[0], // YYYY-MM-DD
      avatar: '/placeholder-logo.png' // placeholder
    }));

    res.status(200).json({ consultations: formatted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get consultation by ID
exports.getConsultationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const consultation = await Consultation.findOne({
      _id: id,
      $or: [{ userId }, { vendorId: userId }]
    })
      .populate('userId', 'name email')
      .populate('vendorId', 'name email')
      .populate('serviceId', 'name');

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    res.status(200).json({ consultation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send message in consultation
exports.sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.userId;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const consultation = await Consultation.findOne({
      _id: id,
      $or: [{ userId }, { vendorId: userId }]
    });

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    consultation.messages.push({
      sender: userId,
      message
    });

    await consultation.save();

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update consultation status (vendor only)
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    const validStatuses = ['pending', 'accepted', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const consultation = await Consultation.findOneAndUpdate(
      { _id: id, vendorId: userId },
      { status },
      { new: true }
    );

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found or access denied' });
    }

    res.status(200).json({
      message: 'Status updated successfully',
      consultation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get vendor's consultation inbox
exports.getVendorInbox = async (req, res) => {
  try {
    const vendorId = req.user.userId;

    const consultations = await Consultation.find({ vendorId })
      .populate('userId', 'name email')
      .populate('serviceId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ consultations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};