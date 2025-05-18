const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true },
  discount_amount: { type: Number, required: true },
  usage_max: { type: Number, required: true },
  usage_times: { type: Number, default: 0 },
  time_create: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Coupon', couponSchema);
