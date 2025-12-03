const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer-config');
const {
  uploadProfileImage,
  getProfileImage,
  deleteProfileImage
} = require('../controllers/imageController');
const authenticateUser = require('../middleware/authentication');

router.post('/upload', authenticateUser, upload.single('image'), uploadProfileImage);
router.get('/my-profile-image', authenticateUser, getProfileImage);
router.delete('/my-profile-image', authenticateUser, deleteProfileImage);

module.exports = router;