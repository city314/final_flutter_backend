const mongoose = require('mongoose');

const couponUsageOrderSchema = new mongoose.Schema({
  order_id: { type: String, required: true },
  coupon_id: { type: String, required: true },
  time_used: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CouponUsageOrder', couponUsageOrderSchema);
