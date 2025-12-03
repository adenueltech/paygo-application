// controllers/uploadsController.js
const path = require('path');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Remove the local upload function if not needed, or keep it
const uploadProductImageLocal = async (req, res) => {
  // This can be removed if you're only using Cloudinary
};

const uploadProductImage = async (req, res) => {
  try {
    // Check if file exists (multer will handle most validation)
    if (!req.file) {
      throw new CustomError.BadRequestError('No image file uploaded');
    }

    // Additional validation (redundant but safe)
    if (!req.file.mimetype.startsWith('image')) {
      // Clean up the uploaded file
      fs.unlinkSync(req.file.path);
      throw new CustomError.BadRequestError('Please upload a valid image file');
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      use_filename: true,
      folder: 'file-upload',
      resource_type: 'image'
    });

    // Clean up temporary file
    fs.unlinkSync(req.file.path);

    return res.status(StatusCodes.OK).json({ 
      image: { 
        src: result.secure_url,
        public_id: result.public_id,
        filename: req.file.originalname
      } 
    });

  } catch (error) {
    // Clean up temp file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    // Handle different error types
    if (error instanceof CustomError) {
      throw error;
    }
    
    throw new CustomError.InternalServerError('Error uploading image: ' + error.message);
  }
};

// New function for user-specific uploads
const uploadUserProductImage = async (req, res) => {
  try {
    if (!req.file) {
      throw new CustomError.BadRequestError('No image file uploaded');
    }

    const userId = req.user.userId; // From authentication middleware
    
    const result = await cloudinary.uploader.upload(req.file.path, {
      use_filename: true,
      folder: `user-uploads/${userId}`, // User-specific folder
      resource_type: 'image'
    });

    // Clean up temporary file
    fs.unlinkSync(req.file.path);

    return res.status(StatusCodes.OK).json({ 
      image: { 
        src: result.secure_url,
        public_id: result.public_id,
        user_id: userId,
        uploaded_at: new Date().toISOString()
      } 
    });

  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    if (error instanceof CustomError) {
      throw error;
    }
    
    throw new CustomError.InternalServerError('Error uploading image');
  }
};

module.exports = {
  uploadProductImage,
  uploadUserProductImage
};