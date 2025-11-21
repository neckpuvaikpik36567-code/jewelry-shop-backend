import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();
const app = express();

// CORS
app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));

app.use(express.json());

// Модели (упрощенные)
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
}, { timestamps: true });

const OrderSchema = new mongoose.Schema({
  userId: String,
  fullName: String,
  address: String,
  phone: String,
  items: Array,
  total: Number,
  orderNumber: String,
  status: { type: String, default: 'pending' },
  paymentStatus: { type: String, default: 'paid' }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Order = mongoose.model('Order', OrderSchema);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Сервер Jewelry Shop работает!',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Регистрация
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Проверяем, существует ли пользователь
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Пользователь с таким email уже существует' 
      });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Создаем пользователя
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.json({ 
      success: true, 
      message: 'Регистрация успешна!',
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера при регистрации' 
    });
  }
});

// Вход
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Ищем пользователя
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Пользователь не найден' 
      });
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Неверный пароль' 
      });
    }

    // Создаем токен
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ 
      success: true, 
      message: 'Вход успешен!',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера при входе' 
    });
  }
});

// Создание заказа
app.post('/api/orders/simple', async (req, res) => {
  try {
    const { fullName, address, phone, items, total, userId } = req.body;
    
    // Генерируем номер заказа
    const orderNumber = 'ORD-' + Date.now();
    
    const order = new Order({
      userId: userId || 'guest',
      fullName,
      address,
      phone,
      items,
      total,
      orderNumber,
      status: 'pending',
      paymentStatus: 'paid'
    });

    await order.save();

    res.json({ 
      success: true, 
      message: 'Заказ успешно создан!',
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status
      }
    });

  } catch (error) {
    console.error('Ошибка создания заказа:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при создании заказа' 
    });
  }
});

// Получение заказов пользователя
app.get('/api/orders/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    
    res.json(orders);
    
  } catch (error) {
    console.error('Ошибка получения заказов:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка при получении заказов' 
    });
  }
});

// Получение всех заказов (для админа)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получении заказов" });
  }
});

// Подключение к MongoDB
const mongoUrl = process.env.MONGO_URL || process.env.MONGO_URI;

if (!mongoUrl) {
  console.log('❌ MONGO_URL не настроен в переменных окружения');
} else {
  mongoose.connect(mongoUrl)
    .then(() => console.log('✅ MongoDB подключена'))
    .catch(err => console.log('❌ Ошибка MongoDB:', err.message));
}

// Корневой маршрут
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Сервер Jewelry Shop работает!', 
    endpoints: {
      health: '/api/health',
      register: '/api/auth/register',
      login: '/api/auth/login',
      createOrder: '/api/orders/simple',
      userOrders: '/api/orders/user/:userId'
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📍 URL: https://curs-1.onrender.com`);
});