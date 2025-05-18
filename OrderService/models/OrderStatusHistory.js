const mongoose = require('mongoose');

const orderStatusHistorySchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  status: String,
  time_update: { type: Date, default: Date.now },
});

module.exports = mongoose.model('OrderStatusHistory', orderStatusHistorySchema);
