// server/index.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs'; // npm install bcryptjs

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: '*' })); // в продакшене лучше указать конкретный домен
app.use(express.json());

// Подключение к MongoDB
const mongoUrl = process.env.MONGO_URL || 'mongodb+srv://neckpuvaikpik36567_db_user:Pssw0rd123@cluster0.fijeusu.mongodb.net/jewelry?retryWrites=true&w=majority';

mongoose.connect(mongoUrl)
  .then(() => console.log('✅ MongoDB подключена'))
  .catch(err => {
    console.error('❌ MongoDB ошибка:', err.message);
    process.exit(1);
  });

// ────────────────────────────────────────────────
// Модели
// ────────────────────────────────────────────────

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: String,
  imageUrl: String,
  stock: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String,
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  products: [{ name: String, price: Number, quantity: Number }],
  total: Number,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1, min: 1 }
  }],
  updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);
const Cart = mongoose.model('Cart', cartSchema);

// ────────────────────────────────────────────────
// Проверка админа
// ────────────────────────────────────────────────

const checkAdmin = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).json({ success: false, error: 'Доступ запрещён' });
  }
  next();
};

// ────────────────────────────────────────────────
// Регистрация
// ────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Имя, email и пароль обязательны' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Пароль минимум 6 символов' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email уже занят' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashed });

    res.status(201).json({
      success: true,
      message: 'Регистрация успешна',
      user: { id: user._id.toString(), name, email }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ────────────────────────────────────────────────
// Вход
// ────────────────────────────────────────────────

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email и пароль обязательны' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Неверный email или пароль' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Неверный email или пароль' });
    }

    res.json({
      success: true,
      message: 'Вход выполнен',
      user: { id: user._id.toString(), name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ────────────────────────────────────────────────
// Тестовый роут
// ────────────────────────────────────────────────

app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Сервер работает', time: new Date().toISOString() });
});

// ────────────────────────────────────────────────
// Продукты (публичные)
// ────────────────────────────────────────────────

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ────────────────────────────────────────────────
// Корзина (серверная)
// ────────────────────────────────────────────────

app.get('/api/cart', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ success: false, error: 'Не авторизован' });

  let cart = await Cart.findOne({ userId }).populate('items.productId');
  if (!cart) cart = await Cart.create({ userId, items: [] });

  res.json({ success: true, data: cart });
});

app.post('/api/cart/add', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ success: false, error: 'Не авторизован' });

  const { productId, quantity = 1 } = req.body;

  let cart = await Cart.findOne({ userId });
  if (!cart) cart = await Cart.create({ userId, items: [] });

  const existing = cart.items.find(i => i.productId.toString() === productId);
  if (existing) {
    existing.quantity += Number(quantity);
  } else {
    cart.items.push({ productId, quantity: Number(quantity) });
  }

  await cart.save();
  const updated = await Cart.findById(cart._id).populate('items.productId');

  res.json({ success: true, data: updated });
});

app.delete('/api/cart/:productId', async (req, res) => {
  const userId = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ success: false, error: 'Не авторизован' });

  await Cart.updateOne(
    { userId },
    { $pull: { items: { productId: req.params.productId } } }
  );

  res.json({ success: true });
});

// ────────────────────────────────────────────────
// Заказы
// ────────────────────────────────────────────────

app.post('/api/orders', async (req, res) => {
  const { userId, products, total } = req.body;
  if (!userId || !products?.length || !total) {
    return res.status(400).json({ success: false, error: 'Недостаточно данных' });
  }

  const order = await Order.create({ userId, products, total });

  await Cart.updateOne({ userId }, { items: [] });

  res.status(201).json({ success: true, data: order });
});

// ────────────────────────────────────────────────
// Админ-роуты (пример)
// ────────────────────────────────────────────────

app.get('/api/admin/users', checkAdmin, async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ success: true, data: users });
});

app.delete('/api/admin/users/:id', checkAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ────────────────────────────────────────────────
// Запуск
// ────────────────────────────────────────────────

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущен → http://localhost:${PORT}`);
  console.log('Админ-ключ: x-admin-key из .env');
});