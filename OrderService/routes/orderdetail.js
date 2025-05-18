const express = require('express');
const router = express.Router();
const OrderDetail = require('../models/OrderDetail');

// Tạo nhiều chi tiết đơn hàng
router.post('/', async (req, res) => {
  try {
    const details = req.body; // expecting array
    if (!Array.isArray(details)) {
      return res.status(400).json({ error: 'Payload should be an array' });
    }

    const result = await OrderDetail.insertMany(details);
    res.status(200).json({ message: 'Order details created', count: result.length });
  } catch (err) {
    console.error('❌ Error creating order details:', err);
    res.status(500).json({ error: 'Failed to create order details' });
  }
});

// Lấy chi tiết đơn hàng theo orderId
router.get('/:orderId', async (req, res) => {
  try {
    const details = await OrderDetail.find({ order_id: req.params.orderId });
    res.json(details);
  } catch (err) {
    console.error('❌ Error fetching order details:', err);
    res.status(500).json({ message: 'Failed to fetch order details' });
  }
});

module.exports = router;
