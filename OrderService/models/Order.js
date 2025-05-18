const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  total_price: Number,
  loyalty_point_used: Number,
  discount: Number,
  coupon: Number,
  tax: Number,
  shipping_fee: Number,
  final_price: Number,
  status: { type: String, enum: ['pending', 'complete', 'canceled', 'shipped', 'paid'], default: 'pending' },
  time_create: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Order', orderSchema);
