// routes/webhooks.js
const express = require('express');
const router = express.Router();
const { Invoice } = require('../models/Billing');

router.post('/usage', async (req, res) => {
  try {
    const { vendorId, period, usageSummary, totalCost } = req.body;

    await Invoice.create({
      vendorId,
      period,
      usageSummary,
      totalCost,
      status: 'pending'
    });

    res.status(200).json({ message: 'Usage recorded successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
