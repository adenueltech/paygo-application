// models/Billing.js
/*const mongoose = require('mongoose');

const rateCardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  pricePerUnit: { type: Number, required: true },
  unit: { type: String, enum: ['per_hour', 'per_gb', 'per_request'], required: true },
  features: [String],
}, { timestamps: true });

const invoiceSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  totalCost: { type: Number, required: true },
  period: { type: String, required: true }, // e.g., "2025-09"
  usageSummary: { type: Object, default: {} },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
}, { timestamps: true });

const subscriptionSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'RateCard', required: true },
  paymentMethod: { type: String, required: true },
  startDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = {
  RateCard: mongoose.model('RateCard', rateCardSchema),
  Invoice: mongoose.model('Invoice', invoiceSchema),
  Subscription: mongoose.model('Subscription', subscriptionSchema)
};
*/