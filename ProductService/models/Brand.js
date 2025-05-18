const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  id: String,
  name: String,
});

module.exports = mongoose.model('Brand', brandSchema);
