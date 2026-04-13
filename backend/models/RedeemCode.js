const mongoose = require('mongoose');

const redeemCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  reward: { type: Number, required: true },
  usedBy: [String],
  maxUses: Number,
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date,
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('RedeemCode', redeemCodeSchema);
