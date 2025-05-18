const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Variant = require('../models/Variant');
const router = express.Router();

// GET all products
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
  try {
    const products = await Product.find();

    const result = await Promise.all(products.map(async (p) => {
      const brand = await Brand.findById(p.brand_id);
      const category = await Category.findById(p.category_id);
      const variants = await Variant.find({ product_id: p._id });

      return {
        ...p.toObject(),
        brandName: brand?.name || '',
        categoryName: category?.name || '',
        variantCount: variants.length,
      };
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh sách sản phẩm', error: err });
  }
});

// POST create product
router.post('/', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (e) {
    res.status(400).json({ message: 'Tạo sản phẩm thất bại', error: e });
  }
});

// PUT update product
router.put('/:id', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: 'Cập nhật thất bại', error: e });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    // Xóa các biến thể trước
    await Variant.deleteMany({ productId });

    // Sau đó xóa sản phẩm
    await Product.findByIdAndDelete(productId);

    res.json({ message: 'Xóa sản phẩm và biến thể thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xóa sản phẩm', error: err });
  }
});

// PUT: Cập nhật discount_percent cho danh sách sản phẩm
router.put('/discounts/update', async (req, res) => {
  try {
    const { discounts } = req.body; // [{ productId: 'p001', discountPercent: 20 }, ...]

    if (!Array.isArray(discounts)) {
      return res.status(400).json({ message: 'Invalid data format' });
    }

    const updatePromises = discounts.map(item =>
      Product.updateOne(
        { _id: item.productId },
        { $set: { discount_percent: item.discountPercent } }
      )
    );

    await Promise.all(updatePromises);
    res.json({ message: 'Cập nhật giảm giá thành công' });
  } catch (error) {
    console.error('Update discounts error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const allProducts = await Product.find().sort({ soldCount: -1 }); // sắp để dùng cho best sellers

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const promotions = allProducts.filter(p => p.discount_percent > 0);
    const newProducts = allProducts.filter(p => p.time_create >= sevenDaysAgo);
    const bestSellers = allProducts.slice(0, 20); // top 20 bán chạy nhất

    res.json({
      promotions,
      newProducts,
      bestSellers,
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu tổng hợp', error: err });
  }
});

router.get('/by-category', async (req, res) => {
  try {
    const { categoryId } = req.query;

    const filter = categoryId ? { category_id: categoryId } : {};
    const products = await Product.find(filter).sort({ time_create: -1 });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/pagination', async (req, res) => {
  try {
    const {
      categoryId,
      brandId,
      price,
      rating,
      sort,
      skip = 0,
      limit = 20,
    } = req.query;

    const query = {};

    if (categoryId) {
      const ids = categoryId.split(',');
      query.category_id = { $in: ids };
    }

    if (brandId) {
      const ids = brandId.split(',');
      query.brand_id = { $in: ids };
    }

    if (price) {
      switch (price) {
        case 'Dưới 5 triệu':
          query.lowest_price = { $lt: 5000000 };
          break;
        case '5-10 triệu':
          query.lowest_price = { $gte: 5000000, $lte: 10000000 };
          break;
        case '10-20 triệu':
          query.lowest_price = { $gte: 10000000, $lte: 20000000 };
          break;
        case 'Trên 20 triệu':
          query.lowest_price = { $gt: 20000000 };
          break;
      }
    }

    if (rating) {
      const ratingValue = parseInt(rating[0]);
      query.rating = { $gte: ratingValue };
    }

    const sortOption = {};
    if (sort) {
      switch (sort) {
        case 'Mới nhất':
          sortOption.time_create = -1;
          break;
        case 'Giá tăng dần':
          sortOption.lowestPrice = 1;
          break;
        case 'Giá giảm dần':
          sortOption.lowestPrice = -1;
          break;
        case 'Sắp xếp theo tên từ A-Z':
          sortOption.name = 1;
          break;
        case 'Sắp xếp theo tên từ Z-A':
          sortOption.name = -1;
          break;
      }
    }

    const products = await Product.find(query)
      .sort(sortOption)
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    res.json(products);
  } catch (error) {
    console.error('[Product API] Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

    const brand = await Brand.findById(product.brand_id);
    const category = await Category.findById(product.category_id);
    const variants = await Variant.find({ product_id: product._id });

    res.json({
      ...product.toObject(),
      brandName: brand?.name || '',
      categoryName: category?.name || '',
      variantCount: variants.length,
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err });
  }
});

router.patch('/sold/:id', async (req, res) => {
  const { change } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

  product.soldCount += change;
  await product.save();
  res.json({ message: 'Đã cập nhật soldCount', newCount: product.soldCount });
});

module.exports = router;
