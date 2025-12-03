const path = require('path');
const fs = require('fs');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const Image = require('../models/Image');

// Upload Profile Image - SIMPLIFIED
const uploadProfileImage = async (req, res) => {
  try {
    console.log('=== UPLOAD DEBUG ===');
    console.log('req.file:', req.file);
    
    if (!req.file) {
      throw new CustomError.BadRequestError('No image file uploaded');
    }

    const userId = req.user.userId;
    
    // Validate basic file properties
    if (!req.file.mimetype.startsWith('image')) {
      // Delete the uploaded file
      fs.unlinkSync(req.file.path);
      throw new CustomError.BadRequestError('Please upload an image file');
    }

    // Create image URL
    const imageUrl = `/uploads/profiles/${req.file.filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${imageUrl}`;

    // Save to Image collection
    const image = await Image.create({
      userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      url: fullUrl,
      size: req.file.size,
      mimetype: req.file.mimetype,
      isProfileImage: true
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Profile image uploaded successfully',
      image: {
        id: image._id,
        filename: image.filename,
        url: image.url,
        size: image.size,
        mimetype: image.mimetype,
        uploadedAt: image.createdAt
      }
    });

  } catch (error) {
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.log('Upload error:', error.message);
    throw new CustomError.BadRequestError(`Image upload failed: ${error.message}`);
  }
};

// Get User's Profile Image
const getProfileImage = async (req, res) => {
  try {
    const userId = req.user.userId;

    const image = await Image.findOne({ 
      userId, 
      isProfileImage: true 
    }).sort({ createdAt: -1 });

    if (!image) {
      throw new CustomError.NotFoundError('Profile image not found');
    }

    res.status(StatusCodes.OK).json({
      success: true,
      image: {
        id: image._id,
        url: image.url,
        filename: image.filename,
        uploadedAt: image.createdAt
      }
    });

  } catch (error) {
    throw new CustomError.BadRequestError(`Failed to fetch profile image: ${error.message}`);
  }
};

// Delete Profile Image
const deleteProfileImage = async (req, res) => {
  try {
    const userId = req.user.userId;

    const image = await Image.findOne({ 
      userId, 
      isProfileImage: true 
    });

    if (!image) {
      throw new CustomError.NotFoundError('Profile image not found');
    }

    // Delete file from filesystem
    if (fs.existsSync(image.path)) {
      fs.unlinkSync(image.path);
    }

    // Delete from database
    await Image.findByIdAndDelete(image._id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Profile image deleted successfully'
    });

  } catch (error) {
    throw new CustomError.BadRequestError(`Failed to delete profile image: ${error.message}`);
  }
};

module.exports = {
  uploadProfileImage,
  getProfileImage,
  deleteProfileImage
};