const express = require('express');
const router = express.Router();
const {
  createProfile,
  getMyProfile,
  updateProfile,
  deleteProfile,
  getAllProfiles
} = require('../controllers/AdminProfile');
const authenticateUser = require('../middleware/authentication');

router.post('/create', authenticateUser, createProfile);
router.get('/my-profile', authenticateUser, getMyProfile);
router.patch('/update', authenticateUser, updateProfile);
router.delete('/delete', authenticateUser, deleteProfile);
router.get('/all', authenticateUser, getAllProfiles);

module.exports = router;