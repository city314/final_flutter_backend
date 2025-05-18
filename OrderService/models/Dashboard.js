const mongoose = require('mongoose');

const dashboardSchema = new mongoose.Schema({
  metric_type: String,
  value: Number,
  period: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
  time_recorded: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Dashboard', dashboardSchema);
