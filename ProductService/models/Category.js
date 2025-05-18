const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  id: String,
  name: String,
});

module.exports = mongoose.model('Category', categorySchema);
