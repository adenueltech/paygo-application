const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authentication');
const {
  createVendorProfile,
  getMyVendorProfile,
  updateVendorProfile,
  deleteVendorProfile,
  getAllVendors
} = require('../controllers/vendorProfileController');

router.post('/create', authenticateUser, createVendorProfile);
router.get('/my-profile', authenticateUser, getMyVendorProfile);
router.patch('/update', authenticateUser, updateVendorProfile);
router.delete('/delete', authenticateUser, deleteVendorProfile);
router.get('/all', authenticateUser, getAllVendors); // optionally protect this with admin middleware

module.exports = router;
