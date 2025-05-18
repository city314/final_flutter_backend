const express = require('express');
const router = express.Router();
const Variant = require('../models/Variant');
const Product = require('../models/Product');

// helper để cập nhật lowestPrice
async function updateLowestPrice(productId) {
  const variants = await Variant.find({ product_id: productId });
  const lowest = variants.length > 0
    ? Math.min(...variants.map(v => v.selling_price ?? Infinity))
    : 0;
  await Product.findByIdAndUpdate(productId, { lowest_price: lowest });
}

// GET all variants (optional)
router.get('/', async (req, res) => {
  try {
    const variants = await Variant.find();
    res.json(variants);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh sách biến thể', error: err });
  }
});

router.get('/by-product/:productId', async (req, res) => {
  try {
    const variants = await Variant.find({ product_id: req.params.productId });
    res.json(variants);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy biến thể', error: err });
  }
});

// POST: create new variant
router.post('/', async (req, res) => {
  try {
    const variant = new Variant(req.body);
    await variant.save();

    // cập nhật lowestPrice
    const productId = variant.product_id;
    await updateLowestPrice(productId);

    res.status(201).json(variant);
  } catch (err) {
    res.status(400).json({ message: 'Tạo biến thể thất bại', error: err });
  }
});

// PUT: update variant
router.put('/:id', async (req, res) => {
  try {
    const updated = await Variant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy biến thể' });

    await updateLowestPrice(updated.product_id);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Cập nhật thất bại', error: err });
  }
});

// DELETE: delete variant
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Variant.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy biến thể' });

    await updateLowestPrice(deleted.product_id);
    res.json({ message: 'Đã xoá biến thể' });
  } catch (err) {
    res.status(500).json({ message: 'Xoá thất bại', error: err });
  }
});

router.patch('/stock/:id', async (req, res) => {
  const { change } = req.body;
  const variant = await Variant.findById(req.params.id);
  if (!variant) return res.status(404).json({ message: 'Không tìm thấy biến thể' });

  variant.stock += change;
  if (variant.stock < 0) variant.stock = 0;
  await variant.save();
  res.json({ message: 'Đã cập nhật tồn kho', newStock: variant.stock });
});

// GET /api/variants/:id
router.get('/order/:id', async (req, res) => {
  try {
    const variant = await Variant.findById(req.params.id);
    console.log(variant.id);
    if (!variant) {
      return res.status(404).json({ message: 'Variant not found' });
    }
    res.json(variant);
  } catch (err) {
    console.error('❌ Error fetching variant:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;
