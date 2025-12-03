// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const userDashboardController = require('../controllers/userDashboardController');
const vendorDashboardController = require('../controllers/vendorDashboardController');
const auth = require('../middleware/authentication');

// User Dashboard Routes
router.get('/user/overview', auth, userDashboardController.getUserDashboard);
router.get('/user/sessions', auth, userDashboardController.getUserSessionHistory);
router.get('/user/sessions/:sessionId', auth, userDashboardController.getSessionDetails);

// Vendor Dashboard Routes
router.get('/vendor/overview', auth, vendorDashboardController.getVendorDashboard);
router.get('/vendor/earnings', auth, vendorDashboardController.getVendorEarningsReport);

module.exports = router;