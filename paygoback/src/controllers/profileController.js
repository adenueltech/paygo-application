const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const Profile = require('../models/Profile');

// Create Profile
const createProfile = async (req, res) => {
  try {
    const { phone, address, bio, socialLinks, uid } = req.body;
    const userId = req.user.userId;

    // Check if profile already exists
    const existingProfile = await Profile.findOne({ userId });
    if (existingProfile) {
      throw new CustomError.BadRequestError('Profile already exists');
    }

    const profile = await Profile.create({
      userId,
      uid,
      phone,
      address: address || '',
      bio: bio || '',
      socialLinks: socialLinks 
  ? (typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks) 
  : {},

    });

    await profile.populate('userId', 'name email');

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Profile created successfully',
      profile
    });

  } catch (error) {
    throw new CustomError.BadRequestError(`Profile creation failed: ${error.message}`);
  }
};

// Get My Profile
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const profile = await Profile.findOne({ userId })
      .populate('userId', 'name email role');

    if (!profile) {
      throw new CustomError.NotFoundError('Profile not found');
    }

    res.status(StatusCodes.OK).json({
      success: true,
      profile
    });

  } catch (error) {
    throw new CustomError.BadRequestError(`Failed to fetch profile: ${error.message}`);
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  try {
    const { phone, address, bio, socialLinks,  uid } = req.body;
    const userId = req.user.userId;

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      throw new CustomError.NotFoundError('Profile not found');
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      { userId },
      {
        phone: phone || profile.phone,
        address: address !== undefined ? address : profile.address,
        bio: bio !== undefined ? bio : profile.bio,
       socialLinks: socialLinks 
  ? (typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks) 
  : profile.socialLinks,
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile
    });

  } catch (error) {
    throw new CustomError.BadRequestError(`Profile update failed: ${error.message}`);
  }
};

// Delete Profile
const deleteProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const profile = await Profile.findOneAndDelete({ userId });

    if (!profile) {
      throw new CustomError.NotFoundError('Profile not found');
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Profile deleted successfully'
    });

  } catch (error) {
    throw new CustomError.BadRequestError(`Profile deletion failed: ${error.message}`);
  }
};

// Get All Profiles (Admin)
const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find({})
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    res.status(StatusCodes.OK).json({
      success: true,
      count: profiles.length,
      profiles
    });

  } catch (error) {
    throw new CustomError.BadRequestError(`Failed to fetch profiles: ${error.message}`);
  }
};

module.exports = {
  createProfile,
  getMyProfile,
  updateProfile,
  deleteProfile,
  getAllProfiles
};