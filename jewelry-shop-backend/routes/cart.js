const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const router = express.Router();

// Получить корзину пользователя
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Не авторизован' });
    }
    
    let cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }
    
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Добавить товар в корзину
router.post('/add', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { productId, quantity = 1 } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }
    
    const existingItem = cart.items.find(
      item => item.product.toString() === productId
    );
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    
    await cart.save();
    await cart.populate('items.product');
    
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить товар из корзины
router.delete('/:productId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { productId } = req.params;
    
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ error: 'Корзина не найдена' });
    }
    
    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );
    
    await cart.save();
    res.json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;