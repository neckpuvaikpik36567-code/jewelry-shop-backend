import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const router = express.Router();

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone, address } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, пароль и имя обязательны'
      });
    }

    const db = mongoose.connection.db;
    
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Пользователь с таким email уже существует'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      email,
      password: hashedPassword,
      name,
      phone: phone || '',
      address: address || '',
      createdAt: new Date(),
      role: 'user'
    };

    const result = await db.collection('users').insertOne(user);
    
    const token = jwt.sign(
      { userId: result.insertedId.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET || 'jwt-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Регистрация успешна',
      token,
      userId: result.insertedId,
      user: {
        _id: result.insertedId,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
});

// Вход
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email и пароль обязательны'
      });
    }

    const db = mongoose.connection.db;
    
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Неверный email или пароль'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Неверный email или пароль'
      });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role || 'user' },
      process.env.JWT_SECRET || 'jwt-secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Вход выполнен',
      token,
      userId: user._id,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
});

export default router;