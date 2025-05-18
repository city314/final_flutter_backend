const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  variant_id: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1, min: 1 },
}, { _id: false }); // Không tạo _id phụ cho từng item

const cartSchema = new mongoose.Schema({
  user_id: { type: String, default: '' },
  items: { type: [cartItemSchema], default: [] },
  time_create: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cart', cartSchema);
