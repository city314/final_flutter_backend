const mongoose = require('mongoose');

// Định nghĩa schema ảnh nhúng trực tiếp
const variantImageSchema = new mongoose.Schema({
  name: String,
  base64: { type: String, required: true }
}, { _id: false });

const variantSchema = new mongoose.Schema({
  product_id: { type: String, required: true },
  variant_name: { type: String, required: true },
  color: { type: String, default: 'black' },
  attributes: { type: String, required: true }, // cho nhập tay như description
  import_price: { type: Number, required: true },
  selling_price: { type: Number, required: true },
  stock: { type: Number, required: true },
  images: [variantImageSchema],
}, { timestamps: true });

module.exports = mongoose.model('Variant', variantSchema);
