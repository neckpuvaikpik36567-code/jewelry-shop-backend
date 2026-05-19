const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const router = express.Router();

// Создать заказ из корзины
router.post('/create', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { shippingAddress, paymentMethod } = req.body;
    
    // Получаем корзину
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Корзина пуста' });
    }
    
    // Формируем items для заказа
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      productName: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      total: item.product.price * item.quantity
    }));
    
    const totalAmount = orderItems.reduce((sum, item) => sum + item.total, 0);
    
    // Создаем заказ
    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod
    });
    
    // Очищаем корзину
    cart.items = [];
    await cart.save();
    
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить заказы пользователя
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;