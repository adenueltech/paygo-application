// routes/serviceRoutes.js
const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/Service');
const auth = require('../middleware/authentication');
const { validateObjectId, validateVendor } = require('../middleware/validation');

// Public routes
router.get('/', serviceController.getAllServices);
router.get('/:id', validateObjectId, serviceController.getServiceById);

// Protected vendor-only routes
router.post('/', auth, validateVendor, serviceController.createService);
router.get('/vendor/my-services', auth, validateVendor, serviceController.getMyServices);
router.put('/:id', auth, validateObjectId, validateVendor, serviceController.updateService);
router.delete('/:id', auth, validateObjectId, validateVendor, serviceController.deleteService);
router.patch('/:id/toggle-status', auth, validateObjectId, validateVendor, serviceController.toggleServiceStatus);

module.exports = router;