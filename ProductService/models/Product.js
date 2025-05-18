const mongoose = require('mongoose');

// Định nghĩa schema ảnh nhúng trực tiếp
const productImageSchema = new mongoose.Schema({
  name: String,
  base64: { type: String, required: true }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category_id: { type: String, required: true },
  brand_id: { type: String, required: true },
  description: { type: String, required: true },
  stock: { type: Number, required: true },
  discount_percent: { type: Number, default: 0 },
  lowest_price: { type: Number, default: 0 },
  soldCount: { type: Number, default: 0 },
  images: [productImageSchema],
  time_create: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', productSchema);