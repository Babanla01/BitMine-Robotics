import express from 'express';

const router = express.Router();

// Mock cart storage (in production, use database)
const carts = {};

// Add to cart
router.post('/add', (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!carts[userId]) {
      carts[userId] = [];
    }

    const existingItem = carts[userId].find(item => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      carts[userId].push({ productId, quantity });
    }

    res.json({ message: 'Item added to cart', cart: carts[userId] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get cart
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    res.json(carts[userId] || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update cart item
router.put('/update/:userId/:productId', (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    if (!carts[userId]) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const item = carts[userId].find(i => i.productId === parseInt(productId));
    if (!item) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    item.quantity = quantity;
    res.json({ message: 'Cart updated', cart: carts[userId] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove from cart
router.delete('/remove/:userId/:productId', (req, res) => {
  try {
    const { userId, productId } = req.params;

    if (!carts[userId]) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    carts[userId] = carts[userId].filter(i => i.productId !== parseInt(productId));
    res.json({ message: 'Item removed from cart', cart: carts[userId] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear cart
router.delete('/clear/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    carts[userId] = [];
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
