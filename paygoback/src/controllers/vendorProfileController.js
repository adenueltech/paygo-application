const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const Vendor = require('../models/VendorProfile');

// 📌 Create Vendor Profile
const createVendorProfile = async (req, res) => {
  try {
    const { companyName, phone, address, bio, socialLinks, servicesOffered, logo } = req.body;
    const userId = req.user.userId; // comes from authentication middleware

    // Check if vendor profile already exists
    const existingVendor = await Vendor.findOne({ userId });
    if (existingVendor) {
      throw new CustomError.BadRequestError('Vendor profile already exists');
    }

    const vendor = await Vendor.create({
      userId,
      companyName,
      phone,
      address: address || '',
      bio: bio || '',
      logo: logo || '',
      servicesOffered: servicesOffered || [],
      socialLinks: socialLinks 
  ? (typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks) 
  : {},
    });

    await vendor.populate('userId', 'name email');

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Vendor profile created successfully',
      vendor
    });
  } catch (error) {
    throw new CustomError.BadRequestError(`Vendor profile creation failed: ${error.message}`);
  }
};

// 📌 Get My Vendor Profile
const getMyVendorProfile = async (req, res) => {
  
    const userId = req.user.userId;

    const vendor = await Vendor.findOne({ userId }).populate('userId', 'name email');
    if (!vendor) {
      throw new CustomError.NotFoundError('Vendor profile not found');
    }

    res.status(StatusCodes.OK).json({
      success: true,
      vendor
    });
  }

// 📌 Update Vendor Profile
const updateVendorProfile = async (req, res) => {
  try {
    const { companyName, phone, address, bio, socialLinks, servicesOffered, logo, uid } = req.body;
    const userId = req.user.userId;

    const vendor = await Vendor.findOne({ userId });
    if (!vendor) {
      throw new CustomError.NotFoundError('Vendor profile not found');
    }

    const updatedVendor = await Vendor.findOneAndUpdate(
      { userId },
      {
        companyName: companyName || vendor.companyName,
        phone: phone || vendor.phone,
        address: address !== undefined ? address : vendor.address,
        bio: bio !== undefined ? bio : vendor.bio,
        logo: logo !== undefined ? logo : vendor.logo,
        servicesOffered: servicesOffered || vendor.servicesOffered,
        socialLinks: socialLinks 
  ? (typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks) 
  : profile.socialLinks,
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Vendor profile updated successfully',
      vendor: updatedVendor
    });
  } catch (error) {
    throw new CustomError.BadRequestError(`Vendor profile update failed: ${error.message}`);
  }
};

// 📌 Delete Vendor Profile
const deleteVendorProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const vendor = await Vendor.findOneAndDelete({ userId });
    if (!vendor) {
      throw new CustomError.NotFoundError('Vendor profile not found');
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Vendor profile deleted successfully'
    });
  } catch (error) {
    throw new CustomError.BadRequestError(`Vendor profile deletion failed: ${error.message}`);
  }
};

// 📌 Get All Vendors (Admin only)
const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(StatusCodes.OK).json({
      success: true,
      count: vendors.length,
      vendors
    });
  } catch (error) {
    throw new CustomError.BadRequestError(`Failed to fetch vendors: ${error.message}`);
  }
};

module.exports = {
  createVendorProfile,
  getMyVendorProfile,
  updateVendorProfile,
  deleteVendorProfile,
  getAllVendors
};
