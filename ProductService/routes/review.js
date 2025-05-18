const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// Lấy danh sách đánh giá theo product_id
router.get('/:product_id', async (req, res) => {
  try {
    const reviews = await Review.find({ product_id: req.params.product_id }).sort({ time_create: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Thêm bình luận (có thể không cần đăng nhập)
// POST /api/reviews
router.post('/', async (req, res) => {
  try {
    const newReview = new Review(req.body);
    await newReview.save();

    // Gửi qua WebSocket nếu cần
    const io = req.app.get('io');
    io.emit('newReview', newReview);

    res.status(201).json(newReview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
