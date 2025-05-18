const express = require('express');
const router = express.Router();

// CartService.fetchCartItems, addCartItem, updateCartItem, deleteCartItem
const { getCartItems, addCartItem, updateCartItem, deleteCartItem } = require('../services/cartService');

/**
 * GET /api/cart
 * Query params: userId or sessionId
 */
router.get('/', async (req, res, next) => {
  try {
    const filter = userId
      ? { user_id: userId }
      : { session_id: sessionId };
    if (!userId && !sessionId) {
      return res.status(400).json({ error: 'Thiếu userId hoặc sessionId' });
    }
    const carts = await getCartItems({ userId, sessionId });
    res.json(carts);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/cart
 * Body: { userId?, sessionId?, productId, variantId, quantity }
 */
router.post('/', async (req, res, next) => {
  try {
    const cart = await addCartItem(req.body);
    res.status(201).json(cart);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/cart/:id
 * Body: { quantity }
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    await updateCartItem(id, quantity);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/cart/:id
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteCartItem(id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
