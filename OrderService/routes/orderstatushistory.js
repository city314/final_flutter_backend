const express = require('express');
const router = express.Router();
const OrderStatusHistory = require('../models/OrderStatusHistory');

router.post('/', async (req, res) => {
  const { order_id, status } = req.body;
  try {
    const newStatus = new OrderStatusHistory({ order_id, status });
    await newStatus.save();
    res.status(201).json({ message: 'Lưu trạng thái thành công' });
  } catch (err) {
    console.error('❌ Lỗi lưu trạng thái:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
