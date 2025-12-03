// controllers/billingController.js
/*const { RateCard, Invoice, Subscription } = require('../models/Billing');
const StreamingSession = require('../models/StreamingSession'); // optional if you store sessions
const Wallet = require('../models/Wallet');
const Service = require('../models/Service');

// 📊 GET current usage (queries streaming sessions)
exports.getCurrentUsage = async (req, res) => {
  try {
    const vendorId = req.query.vendorId;

    // Example: sum usage from sessions
    const sessions = await StreamingSession.aggregate([
      { $match: { vendorId } },
      {
        $group: {
          _id: null,
          totalDuration: { $sum: '$duration' },
          totalCost: { $sum: '$cost' }
        }
      }
    ]);

    res.json(sessions[0] || { totalDuration: 0, totalCost: 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📜 GET invoices (with pagination and month filter)
exports.getInvoices = async (req, res) => {
  try {
    const { month, page = 1, limit = 20 } = req.query;
    const query = month ? { period: month } : {};

    const invoices = await Invoice.find(query)
      .populate('vendorId')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📄 GET single invoice by ID
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.invoiceId).populate('vendorId');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 💰 GET rate cards
exports.getRateCards = async (req, res) => {
  try {
    const rateCards = await RateCard.find();
    res.json(rateCards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🪙 POST subscribe to a plan
exports.subscribeToPlan = async (req, res) => {
  try {
    const { vendorId, planId, paymentMethod } = req.body;

    const subscription = await Subscription.create({
      vendorId,
      planId,
      paymentMethod,
      startDate: new Date(),
      isActive: true
    });

    res.status(201).json(subscription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
*/