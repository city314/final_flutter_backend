const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

// Lấy giỏ hàng theo user_id
router.get('/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user_id: req.params.userId });
    res.json(cart || { user_id: req.params.userId, items: [] });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Thêm hoặc cập nhật item trong giỏ hàng
router.post('/add', async (req, res) => {
  const { user_id, variant_id, quantity } = req.body;
  if (!user_id || !variant_id || !quantity) {
    return res.status(400).json({ error: 'Thiếu dữ liệu' });
  }

  try {
    let cart = await Cart.findOne({ user_id });

    if (!cart) {
      cart = new Cart({
        user_id,
        items: [{ variant_id, quantity }]
      });
    } else {
      const index = cart.items.findIndex(item => item.variant_id === variant_id);
      if (index >= 0) {
        cart.items[index].quantity += quantity;
      } else {
        cart.items.push({ variant_id, quantity });
      }
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Cập nhật số lượng của một item
router.put('/update', async (req, res) => {
  const { user_id, variant_id, quantity } = req.body;
  if (!user_id || !variant_id || quantity == null) {
    return res.status(400).json({ error: 'Thiếu dữ liệu' });
  }

  try {
    const cart = await Cart.findOne({ user_id });
    if (!cart) return res.status(404).json({ error: 'Không tìm thấy giỏ hàng' });

    const index = cart.items.findIndex(item => item.variant_id === variant_id);
    if (index === -1) return res.status(404).json({ error: 'Sản phẩm không có trong giỏ hàng' });

    cart.items[index].quantity = quantity;
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Xóa một item khỏi giỏ
router.delete('/remove', async (req, res) => {
  const { user_id, variant_id } = req.body;
  if (!user_id || !variant_id) {
    return res.status(400).json({ error: 'Thiếu dữ liệu' });
  }

  try {
    const cart = await Cart.findOne({ user_id });
    if (!cart) return res.status(404).json({ error: 'Không tìm thấy giỏ hàng' });

    cart.items = cart.items.filter(item => item.variant_id !== variant_id);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Xóa toàn bộ giỏ hàng
router.delete('/clear/:userId', async (req, res) => {
  try {
    const result = await Cart.deleteOne({ user_id: req.params.userId });
    res.json({ success: result.deletedCount > 0 });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

router.post('/create', async (req, res) => {
  const { user_id, items } = req.body;

  if (!user_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Thiếu user_id hoặc danh sách items' });
  }

  try {
    let cart = await Cart.findOne({ user_id });

    if (cart) {
      // Nếu giỏ hàng đã tồn tại → cập nhật hoặc gộp items
      const variantMap = new Map();

      // Thêm item cũ
      for (const item of cart.items) {
        variantMap.set(item.variant_id.toString(), item.quantity);
      }

      // Gộp item mới
      for (const item of items) {
        const vid = item.variant_id.toString();
        const qty = item.quantity || 1;
        variantMap.set(vid, (variantMap.get(vid) || 0) + qty);
      }

      // Chuyển map lại thành mảng
      cart.items = Array.from(variantMap.entries()).map(([variant_id, quantity]) => ({
        variant_id,
        quantity,
      }));

      await cart.save();
      return res.status(200).json(cart);
    } else {
      // Nếu chưa có → tạo mới
      cart = new Cart({
        user_id,
        items,
        time_add: new Date()
      });

      await cart.save();
      return res.status(201).json(cart);
    }
  } catch (error) {
    console.error('❌ Lỗi tạo/cập nhật giỏ hàng:', error);
    return res.status(500).json({ error: 'Lỗi server' });
  }
});

// API cập nhật user_id cho cart
router.put('/update-user', async (req, res) => {
  const { old_user_id, new_user_id } = req.body;
  if (!old_user_id || !new_user_id) {
    return res.status(400).json({ error: 'Thiếu dữ liệu user_id' });
  }

  try {
    const cart = await Cart.findOne({ user_id: old_user_id });
    if (!cart) return res.status(404).json({ error: 'Không tìm thấy giỏ hàng' });

    cart.user_id = new_user_id;
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Xoá các variant đã mua khỏi giỏ hàng
router.post('/remove-items', async (req, res) => {
  const { variantIds, user_id } = req.body;

  if (!variantIds || !Array.isArray(variantIds) || variantIds.length === 0) {
    return res.status(400).json({ message: 'variantIds không hợp lệ' });
  }

  try {
    // Xoá từng variantId khỏi giỏ hàng của user
    await Cart.updateOne(
      { user_id },
      { $pull: { items: { variant_id: { $in: variantIds } } } }
    );

    const updatedCart = await Cart.findOne({ user_id });
    res.json({ message: 'Đã xoá các sản phẩm khỏi giỏ hàng' });
  } catch (error) {
    console.error('❌ Lỗi khi xoá sản phẩm trong giỏ hàng:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;
