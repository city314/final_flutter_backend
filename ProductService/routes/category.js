const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');

// Get all
router.get('/', async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

// Add
router.post('/', async (req, res) => {
  const { name } = req.body;
  const count = await Category.countDocuments();
  const newId = 'C' + (count + 1);

  const exists = await Category.findOne({ name });
  if (exists) return res.status(400).json({ message: 'Tên danh mục đã tồn tại' });

  const category = new Category({ id: newId, name });
  await category.save();
  res.json(category);
});

// Update
router.put('/:id', async (req, res) => {
  const { name } = req.body;
  try {
    const objectId = new mongoose.Types.ObjectId(req.params.id);
    const updated = await Category.findByIdAndUpdate(objectId, { name }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'ID không hợp lệ', error: err });
  }
});

// Delete
const mongoose = require('mongoose');

router.delete('/:id', async (req, res) => {
  try {
    const objectId = new mongoose.Types.ObjectId(req.params.id);

    // Kiểm tra xem có sản phẩm nào đang dùng category này không
    const used = await Product.findOne({ categoryId: req.params.id });
    if (used) {
      return res.status(400).json({ message: 'Không thể xoá: danh mục đã được dùng' });
    }

    // Xoá danh mục theo _id thực tế
    const result = await Category.findByIdAndDelete(objectId);
    if (!result) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    res.json({ message: 'Đã xoá danh mục thành công' });
  } catch (error) {
    res.status(400).json({ message: 'ID không hợp lệ hoặc lỗi hệ thống', error });
  }
});

module.exports = router;
