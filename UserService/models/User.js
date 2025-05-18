const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  id: { type: String },
  receiver_name: { type: String },
  phone: { type: String },
  address: { type: String },
  default: { type: Boolean, default: false },
}, { _id: false });

const userSchema = new mongoose.Schema({
  avatar: { type: String, default: '' },
  email: { type: String, required: true },
  name: { type: String, required: true },
  gender: { type: String, enum: ['Female', 'Male', ''], default: ''},
  birthday: { type: String },
  phone: { type: String },
  password: { type: String, required: true },
  loyalty_point: { type: Number, default: 0},
  address: [addressSchema], // <== đổi từ String sang mảng đối tượng address
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active'},
  isActive: { type: Boolean, default: false },
  time_create: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
