const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user_id: { type: String, default: '' },
  product_id: { type: String, required: true },
  user_name: { type: String, default: 'Anonymous' },
  rating: Number,
  comment: String,
  time_create: { type: Date, default: Date.now },
  avatar: { type: String },
});

module.exports = mongoose.model('Review', reviewSchema);
