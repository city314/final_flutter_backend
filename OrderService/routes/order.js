const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const nodemailer = require('nodemailer');

// Tạo đơn hàng
router.post('/', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();
    res.status(200).json({ _id: savedOrder._id, message: 'Order created successfully' });
  } catch (err) {
    console.error('❌ Error creating order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

router.post('/send-confirmation', async (req, res) => {
  const { email, name, orderId, items, finalAmount } = req.body;

  try {
    const itemDetails = items.map((item, i) =>
      `${i + 1}. ${item.variantName} x${item.quantity} - ${item.price.toLocaleString()}đ`
    ).join('\n');

    const htmlBody = `
      <p>Xin chào <strong>${name}</strong>,</p>
      <p>Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi!</p>
      <p><strong>Mã đơn hàng:</strong> ${orderId}</p>
      <p><strong>Chi tiết đơn hàng:</strong></p>
      <pre>${itemDetails}</pre>
      <p><strong>Tổng thanh toán:</strong> ${finalAmount.toLocaleString()}đ</p>
      <br/>
      <p>Chúng tôi sẽ xử lý đơn hàng và liên hệ bạn sớm nhất.</p>
      <p>Trân trọng,<br/>Đội ngũ hỗ trợ</p>
    `;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'nhomcnpm1@gmail.com',
        pass: 'abfk znlx ggfn ycpk',
      },
    });

    await transporter.sendMail({
      from: 'Flutter@gmail.com',
      to: email,
      subject: 'Xác nhận đơn hàng',
      html: htmlBody,
    });

    res.json({ message: 'Email đã được gửi' });
  } catch (err) {
    console.error('❌ Lỗi gửi email xác nhận:', err);
    res.status(500).json({ message: 'Gửi email thất bại', error: err.message });
  }
});

// Lấy tất cả đơn hàng
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ time_create: -1 });
    res.json(orders);
  } catch (err) {
    console.error('❌ Error fetching orders:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error('❌ Error updating order status:', err);
    res.status(500).json({ message: 'Update failed' });
  }
});

module.exports = router;
