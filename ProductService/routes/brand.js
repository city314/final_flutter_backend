const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const Product = require('../models/Product');

// GET all brands
router.get('/', async (req, res) => {
  try {
    const brands = await Brand.find();
    res.json(brands);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Add
router.post('/', async (req, res) => {
  const { name } = req.body;
  const count = await Brand.countDocuments();
  const newId = 'B' + (count + 1);

  const exists = await Brand.findOne({ name });
  if (exists) return res.status(400).json({ message: 'Tên danh mục đã tồn tại' });

  const brand = new Brand({ id: newId, name });
  await brand.save();
  res.json(brand);
});

// Update
router.put('/:id', async (req, res) => {
  const { name } = req.body;
  try {
    const objectId = new mongoose.Types.ObjectId(req.params.id);
    const updated = await Brand.findByIdAndUpdate(objectId, { name }, { new: true });
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

    // Kiểm tra xem có sản phẩm nào đang dùng brand này không
    const used = await Product.findOne({ brandId: req.params.id });
    if (used) {
      return res.status(400).json({ message: 'Không thể xoá: danh mục đã được dùng' });
    }

    // Xoá danh mục theo _id thực tế
    const result = await Brand.findByIdAndDelete(objectId);
    if (!result) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    res.json({ message: 'Đã xoá danh mục thành công' });
  } catch (error) {
    res.status(400).json({ message: 'ID không hợp lệ hoặc lỗi hệ thống', error });
  }
});

module.exports = router;
