import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Создание заказа
router.post('/', async (req, res) => {
  try {
    console.log('📦 Создание заказа');
    
    const { items, totalAmount, userEmail, shippingAddress } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Корзина пуста'
      });
    }
    
    const db = mongoose.connection.db;
    
    const order = {
      items,
      totalAmount,
      userEmail: userEmail || 'guest@email.com',
      shippingAddress: shippingAddress || {},
      status: 'pending',
      createdAt: new Date(),
      orderNumber: `ORD${Date.now()}`
    };
    
    const result = await db.collection('orders').insertOne(order);
    
    res.json({
      success: true,
      message: 'Заказ создан',
      orderId: result.insertedId,
      orderNumber: order.orderNumber
    });
    
  } catch (error) {
    console.error('Ошибка создания заказа:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании заказа'
    });
  }
});

export default router;