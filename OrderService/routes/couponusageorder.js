const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const CouponUsageOrder = require('../models/CouponUsageOrder');

router.post('/', async (req, res) => {
  const { order_id, coupon_code } = req.body;
  console.log(coupon_code);
  try {
    const coupon = await Coupon.findOne({ code: coupon_code });
    if (!coupon) return res.status(404).json({ message: 'Coupon không tồn tại' });

    const usage = new CouponUsageOrder({
      order_id,
      coupon_id: coupon._id,
    });

    await usage.save();
    res.status(201).json({ message: 'Đã lưu thông tin sử dụng coupon' });
  } catch (err) {
    console.error('❌ Lỗi khi lưu coupon usage:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

module.exports = router;
