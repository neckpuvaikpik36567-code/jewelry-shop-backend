const express = require('express');
const User = require('../models/User');
const Cart = require('../models/Cart');
const router = express.Router();

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Проверка существующего пользователя
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }
    
    // Создание пользователя
    const user = await User.create({ name, email, password });
    
    // Создание корзины для пользователя
    await Cart.create({ user: user._id, items: [] });
    
    res.status(201).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Вход
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    
    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;