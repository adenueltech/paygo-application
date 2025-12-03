// controllers/serviceController.js
const Service = require('../models/Service');
const User = require('../models/Users');

// Vendor validation moved to middleware

// ✅ Create a new service (Only vendor)
exports.createService = async (req, res) => {
  try {
    const { name, description, category, subcategory, type, rate, unit, metadata, isActive, tags } = req.body;
    const userId = req.user.userId;

    // Input validation
    if (!name || !description || !category || !subcategory || !type || !rate || !unit) {
      return res.status(400).json({ message: 'All required fields must be provided: name, description, category, subcategory, type, rate, unit' });
    }

    const validCategories = [
      'Time-Based', 'Usage-Based', 'Digital Products & Content',
      'E-commerce & Marketplace', 'Data & Analytics', 'Specialized Services'
    ];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const validTypes = ['video', 'audio', 'data', 'other'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid type. Must be video, audio, data, or other' });
    }

    const validUnits = ['per_second', 'per_minute', 'per_hour', 'per_session', 'per_gb', 'per_transaction', 'per_request'];
    if (!validUnits.includes(unit)) {
      return res.status(400).json({ message: 'Invalid unit' });
    }

    if (isNaN(parseFloat(rate)) || parseFloat(rate) <= 0) {
      return res.status(400).json({ message: 'Rate must be a positive number' });
    }

    // Vendor validation handled by middleware

    // Check for duplicates
    const existingService = await Service.findOne({
      userId: userId,
      name: name.trim()
    });

    if (existingService) {
      return res.status(409).json({
        message: 'You already have a service with this name',
        suggestion: 'Please use a different name for your service'
      });
    }

    // Create service
    const service = await Service.create({
      userId: userId,
      name: name.trim(),
      description: description.trim(),
      category,
      subcategory,
      type,
      rate: parseFloat(rate),
      unit,
      metadata: metadata || {},
      isActive: isActive !== undefined ? isActive : true,
      tags: tags || []
    });

    res.status(201).json({
      message: 'Service created successfully',
      service
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all services (Public - anyone can view)
exports.getAllServices = async (req, res) => {
  try {
    const filter = {};
    
    // Filter by vendor if requested
    if (req.query.vendorId) {
      filter.userId = req.query.vendorId;
    }

    // Only return active services by default for public access
    if (req.query.includeInactive !== 'true') {
      filter.isActive = true;
    }

    const services = await Service.find(filter)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ count: services.length, services });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get a single service by ID (Public)
exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid service ID' });
    }

    const service = await Service.findById(id)
      .populate('userId', 'name email role');

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update service (only vendor who owns it)
exports.updateService = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Validate ObjectId
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid service ID' });
    }

    // Vendor validation handled by middleware

    const service = await Service.findOne({ _id: id, userId });
    if (!service) {
      return res.status(404).json({ message: 'Service not found or access denied' });
    }

    // Safe update - only allow specific fields
    const allowedFields = ['name', 'description', 'category', 'subcategory', 'type', 'rate', 'unit', 'metadata', 'isActive', 'tags'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'rate' && (isNaN(parseFloat(req.body[field])) || parseFloat(req.body[field]) <= 0)) {
          return res.status(400).json({ message: 'Rate must be a positive number' });
        }
        updates[field] = field === 'name' || field === 'description' ? req.body[field].trim() : req.body[field];
      }
    }

    Object.assign(service, updates);
    await service.save();

    res.status(200).json({ message: 'Service updated successfully', service });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ Delete service (only vendor who owns it)
exports.deleteService = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Validate ObjectId
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid service ID' });
    }

    // Verify user is vendor
    const vendorCheck = await validateVendor(userId);
    if (!vendorCheck.isValid) {
      return res.status(403).json({ message: vendorCheck.message });
    }

    const deleted = await Service.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return res.status(404).json({ message: 'Service not found or access denied' });
    }

    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Toggle active/inactive status (only vendor who owns it)
exports.toggleServiceStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Validate ObjectId
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid service ID' });
    }

    // Verify user is vendor
    const vendorCheck = await validateVendor(userId);
    if (!vendorCheck.isValid) {
      return res.status(403).json({ message: vendorCheck.message });
    }

    const service = await Service.findOne({ _id: id, userId });
    if (!service) {
      return res.status(404).json({ message: 'Service not found or access denied' });
    }

    service.isActive = !service.isActive;
    await service.save();

    res.status(200).json({
      message: 'Service status updated',
      isActive: service.isActive
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get my services (Current vendor's services only)
exports.getMyServices = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Vendor validation handled by middleware

    const services = await Service.find({ userId })
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ count: services.length, services });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};