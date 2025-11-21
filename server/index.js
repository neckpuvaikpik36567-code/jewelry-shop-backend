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
  methods: "GET,POST,PUT,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization,Accept,Origin,X-Requested-With",
  credentials: true,
  optionsSuccessStatus: 200
}));

app.options('*', cors());
app.use(express.json());

// Модели
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

// Подключение к MongoDB
const connectDB = async () => {
  try {
    // Пробуем оба варианта названий переменных
    const mongoUrl = process.env.MONGO_URL || process.env.MONGO_URI;
    
    console.log('🔗 Попытка подключения к MongoDB...');
    console.log('📝 URL:', mongoUrl ? 'установлен' : 'не установлен');
    
    if (!mongoUrl) {
      throw new Error('MONGO_URL или MONGO_URI не настроены в переменных окружения');
    }

    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB успешно подключена');
    console.log('📊 База данных:', mongoose.connection.db.databaseName);
    return true;
    
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error.message);
    console.log('💡 Проверьте:');
    console.log('   1. Правильность строки подключения');
    console.log('   2. Наличие сети у MongoDB Atlas');
    console.log('   3. IP адрес добавлен в whitelist MongoDB Atlas');
    return false;
  }
};

// Health check
app.get('/api/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({ 
    status: 'OK', 
    message: 'Сервер Jewelry Shop работает!',
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Тестовый маршрут для проверки базы
app.get('/api/test-db', async (req, res) => {
  try {
    // Считаем количество пользователей
    const userCount = await User.countDocuments();
    
    res.json({ 
      success: true, 
      message: 'База данных работает корректно!',
      database: 'connected',
      userCount: userCount
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка базы данных: ' + error.message,
      database: 'error'
    });
  }
});

// Регистрация
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('📝 Регистрация:', req.body);
    
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Все поля обязательны для заполнения' 
      });
    }

    // Проверяем подключение к базе
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ 
        success: false, 
        message: 'База данных не подключена' 
      });
    }

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
    console.log('✅ Пользователь сохранен:', user.email);

    res.json({ 
      success: true, 
      message: 'Регистрация успешна!',
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error('❌ Ошибка регистрации:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Пользователь с таким email уже существует' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера при регистрации' 
    });
  }
});

// Вход
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔑 Вход:', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email и пароль обязательны' 
      });
    }

    // Проверяем подключение к базе
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ 
        success: false, 
        message: 'База данных не подключена' 
      });
    }

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

    console.log('✅ Успешный вход:', user.email);

    res.json({ 
      success: true, 
      message: 'Вход успешен!',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error('❌ Ошибка входа:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера при входе' 
    });
  }
});

// Получение всех пользователей (для отладки)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Ошибка получения пользователей'
    });
  }
});

// Создание заказа
app.post('/api/orders/simple', async (req, res) => {
  try {
    console.log('🛒 Создание заказа:', req.body);
    
    const { fullName, address, phone, items, total, userId } = req.body;
    
    if (!fullName || !address || !phone || !items || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Все поля обязательны для заказа' 
      });
    }

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

// Инициализация сервера
const startServer = async () => {
  const dbConnected = await connectDB();
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📍 URL: https://curs-1.onrender.com`);
    console.log(`🗄️  База данных: ${dbConnected ? '✅ Подключена' : '❌ Не подключена'}`);
    
    if (!dbConnected) {
      console.log('💡 Для подключения базы:');
      console.log('   1. Проверьте переменные окружения на Render');
      console.log('   2. Убедитесь что MONGO_URL установлен правильно');
      console.log('   3. Проверьте whitelist IP в MongoDB Atlas');
    }
  });
};

startServer();