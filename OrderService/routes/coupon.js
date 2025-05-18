const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const CouponUsageOrder = require('../models/CouponUsageOrder');
const Order = require('../models/Order');
// GET all coupons
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ timeCreate: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err });
  }
});

// POST: Create new coupon
router.post('/', async (req, res) => {
  try {
    const { code, discount_amount, usage_max } = req.body;
    const exists = await Coupon.findOne({ code });
    if (exists) {
      return res.status(400).json({ message: 'Mã coupon đã tồn tại' });
    }
    const newCoupon = new Coupon({
      code,
      discount_amount,
      usage_max,
      usage_times: 0,
      time_create: new Date(),
    });
    await newCoupon.save();
    res.status(201).json(newCoupon);
  }
  catch (err) {
    console.error('CREATE ERROR:', err); // ✅ in log rõ hơn
    res.status(500).json({ message: 'Không thể tạo coupon', error: err.message || err });
  }
});

// PUT: Update existing coupon
router.put('/:id', async (req, res) => {
  try {
    const { code, discount_amount, usage_max } = req.body;
    const updated = await Coupon.findByIdAndUpdate(
      req.params.id,
      { code, discount_amount, usage_max },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy coupon' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Không thể cập nhật coupon', error: err });
  }
});

// DELETE: Remove coupon
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Coupon.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy coupon' });
    res.json({ message: 'Đã xoá coupon', deleted });
  } catch (err) {
    res.status(500).json({ message: 'Không thể xoá coupon', error: err });
  }
});

router.get('/check', async (req, res) => {
  const { code } = req.query;
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) return res.status(404).json({ message: 'Không tìm thấy mã' });
  res.json({
    code: coupon.code,
    discount_amount: coupon.discount_amount,
    usage_max: coupon.usage_max,
    usage_times: coupon.usage_times,
    time_create: coupon.time_create,
  });
});

router.patch('/use/:code', async (req, res) => {
  const coupon = await Coupon.findOne({ code: req.params.code });
  console.log(req.params.code);
  if (!coupon) return res.status(404).json({ message: 'Không tìm thấy mã' });
  if (coupon.usageTimes >= coupon.usageMax)
    return res.status(400).json({ message: 'Đã vượt quá số lượt dùng' });

  coupon.usage_times += 1;
  await coupon.save();
  res.json({ message: 'Cập nhật mã thành công' });
});

// GET: lấy danh sách đơn hàng đã dùng mã coupon
router.get('/by-coupon/:code', async (req, res) => {
  try {
    const code = req.params.code;
    const coupon = await Coupon.findOne({ code });
    if (!coupon) return res.status(404).json({ message: 'Không tìm thấy coupon' });

    const usages = await CouponUsageOrder.find({ coupon_id: coupon._id });
    res.json(usages); // hoặc populate thêm order nếu cần chi tiết
  } catch (err) {
    console.error('❌ Lỗi khi lấy usage:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});

router.get('/:code/orders', async (req, res) => {
  try {
    const code = req.params.code;

    // Lấy đơn hàng có sử dụng coupon
    const orders = await Order.find({ couponCode: code }).sort({ timeCreate: -1 });

    // Lấy thông tin người dùng tương ứng
    const userMap = {};
    for (const order of orders) {
      if (order.userId && !userMap[order.userId]) {
        const user = await User.findById(order.userId).select('name');
        userMap[order.userId] = user?.name || 'Không rõ';
      }
    }

    // Trả về danh sách order với thông tin người dùng
    const result = orders.map(o => ({
      id: o._id,
      totalPrice: o.finalPrice || o.totalPrice,
      timeCreate: o.timeCreate,
      userName: userMap[o.userId] || 'Khách',
    }));

    res.json(result);
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách đơn hàng theo coupon:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});


module.exports = router;
