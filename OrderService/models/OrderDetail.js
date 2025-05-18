const mongoose = require('mongoose');

const orderDetailSchema = new mongoose.Schema({
  order_id: { type: String, required: true },
  variant_id: { type: String, required: true },
  quantity: Number,
  price: Number,
});

module.exports = mongoose.model('OrderDetail', orderDetailSchema);
