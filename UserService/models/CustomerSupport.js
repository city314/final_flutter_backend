const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  text: String,
  isUser: Boolean,
  image: String,
  isSeen: { type: Boolean, default: false },
  time: { type: Date, default: Date.now }
});

const supportSchema = new mongoose.Schema({
  customer_email: { type: String, required: true },
  messages: [MessageSchema],
  time_create: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CustomerSupport', supportSchema);
