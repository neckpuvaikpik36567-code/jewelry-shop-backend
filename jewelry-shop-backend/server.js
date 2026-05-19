const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ПОДКЛЮЧЕНИЕ К MONGODB (БЕЗ LOCALHOST - РАБОТАЕТ ВЕЗДЕ)
const MONGODB_URI = 'mongodb://127.0.0.1:27017/jewelry_shop';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB подключена успешно'))
.catch(err => console.error('❌ Ошибка подключения MongoDB:', err));

// ========== СХЕМЫ ==========

// Пользователи
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'user' }
}, { timestamps: true });

// Товары
const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  imageUrl: String,
  stock: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

// Корзина
const CartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: Number
});

const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  items: [CartItemSchema]
}, { timestamps: true });

// Заказы
const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: String,
  price: Number,
  quantity: Number
});

const OrderSchema = new mongoose.Schema({
  orderNumber: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [OrderItemSchema],
  total: Number,
  status: { type: String, default: 'pending' },
  address: String,
  phone: String
}, { timestamps: true });

// Модели
const User = mongoose.model('User', UserSchema);
const Product = mongoose.model('Product', ProductSchema);
const Cart = mongoose.model('Cart', CartSchema);
const Order = mongoose.model('Order', OrderSchema);

// ========== API МАРШРУТЫ ==========

// Корневой маршрут
app.get('/', (req, res) => {
  res.json({ message: 'API работает!', status: 'ok' });
});

// РЕГИСТРАЦИЯ
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email уже используется' });
    }
    
    const user = new User({ name, email, password });
    await user.save();
    
    // Создаем корзину
    const cart = new Cart({ userId: user._id, items: [] });
    await cart.save();
    
    res.json({
      success: true,
      user: { id: user._id, name, email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ВХОД
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    
    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ПОЛУЧИТЬ ВСЕ ТОВАРЫ
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ➕ ДОБАВИТЬ НОВЫЙ ТОВАР (с защитой от дублирования)
app.post('/api/products', async (req, res) => {
  try {
    const { name, category } = req.body;
    
    // Проверяем, есть ли уже такой товар
    const existing = await Product.findOne({ name, category });
    if (existing) {
      return res.status(409).json({ error: 'Товар уже существует' });
    }
    
    const product = new Product(req.body);
    await product.save();
    console.log('✅ Добавлен товар:', product.name);
    res.status(201).json(product);
  } catch (err) {
    console.error('❌ Ошибка добавления:', err);
    res.status(500).json({ error: err.message });
  }
});
// ПОЛУЧИТЬ КОРЗИНУ
app.get('/api/cart', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Не авторизован' });
    }
    
    let cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }
    
    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ДОБАВИТЬ В КОРЗИНУ (ИСПРАВЛЕННАЯ ВЕРСИЯ)
app.post('/api/cart/add', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { productId, quantity } = req.body;
    
    console.log('=== ДОБАВЛЕНИЕ В КОРЗИНУ ===');
    console.log('userId:', userId);
    console.log('productId:', productId);
    console.log('quantity:', quantity);
    
    // Проверяем, существует ли товар
    if (!productId) {
      return res.status(400).json({ error: 'productId не указан' });
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      console.log('❌ Товар не найден:', productId);
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    console.log('✅ Товар найден:', product.name);
    
    // Ищем корзину пользователя
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      console.log('🆕 Создаем новую корзину для пользователя:', userId);
      cart = new Cart({ userId, items: [] });
    }
    
    // Проверяем, есть ли уже такой товар в корзине
    const existingItem = cart.items.find(item => item.productId && item.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
      console.log('📦 Обновляем количество:', existingItem.quantity);
    } else {
      cart.items.push({ productId, quantity });
      console.log('➕ Добавляем новый товар:', product.name);
    }
    
    await cart.save();
    await cart.populate('items.productId');
    
    console.log('✅ Товар добавлен в корзину');
    res.json({ success: true, data: cart });
  } catch (err) {
    console.error('❌ Ошибка добавления в корзину:', err);
    res.status(500).json({ error: err.message });
  }
});

// УДАЛИТЬ ИЗ КОРЗИНЫ
app.delete('/api/cart/:productId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { productId } = req.params;
    
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Корзина не найдена' });
    }
    
    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// СОЗДАТЬ ЗАКАЗ
app.post('/api/orders', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { address, phone } = req.body;
    
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Корзина пуста' });
    }
    
    const orderNumber = `ORD-${Date.now()}`;
    let total = 0;
    
    const items = cart.items.map(item => {
      const product = item.productId;
      const itemTotal = product.price * item.quantity;
      total += itemTotal;
      
      return {
        productId: product._id,
        productName: product.name,
        price: product.price,
        quantity: item.quantity
      };
    });
    
    const order = new Order({
      orderNumber,
      userId,
      items,
      total,
      address,
      phone
    });
    
    await order.save();
    
    // Очищаем корзину
    cart.items = [];
    await cart.save();
    
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ПОЛУЧИТЬ ЗАКАЗЫ ПОЛЬЗОВАТЕЛЯ
app.get('/api/orders/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== АДМИН МАРШРУТЫ ==========
const ADMIN_KEY = 'super-secret-admin-key-2026';

// ➕ АДМИН: ДОБАВИТЬ НОВЫЙ ТОВАР
app.post('/api/admin/products', async (req, res) => {
  const key = req.headers['x-admin-key'];
  if (key !== ADMIN_KEY) {
    return res.status(403).json({ error: 'Доступ запрещен. Только для администратора.' });
  }
  
  try {
    const { name, price, category, imageUrl, stock, isAvailable } = req.body;
    
    const product = new Product({
      name,
      price,
      category,
      imageUrl,
      stock: stock || 10,
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });
    
    await product.save();
    console.log('✅ [ADMIN] Добавлен товар:', product.name);
    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error('❌ Ошибка добавления:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✏️ АДМИН: ОБНОВИТЬ ТОВАР
app.put('/api/admin/products/:id', async (req, res) => {
  const key = req.headers['x-admin-key'];
  if (key !== ADMIN_KEY) {
    return res.status(403).json({ error: 'Доступ запрещен. Только для администратора.' });
  }
  
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🗑️ АДМИН: УДАЛИТЬ ТОВАР
app.delete('/api/admin/products/:id', async (req, res) => {
  const key = req.headers['x-admin-key'];
  if (key !== ADMIN_KEY) {
    return res.status(403).json({ error: 'Доступ запрещен. Только для администратора.' });
  }
  
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    console.log('🗑️ [ADMIN] Удален товар:', product.name);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Остальные админ-маршруты (уже есть)
app.get('/api/admin/users', async (req, res) => {
  const key = req.headers['x-admin-key'];
  if (key !== ADMIN_KEY) return res.status(403).json({ error: 'Доступ запрещен' });
  
  const users = await User.find().select('-password');
  res.json(users);
});

app.get('/api/admin/products', async (req, res) => {
  const key = req.headers['x-admin-key'];
  if (key !== ADMIN_KEY) return res.status(403).json({ error: 'Доступ запрещен' });
  
  const products = await Product.find();
  res.json(products);
});

app.get('/api/admin/orders', async (req, res) => {
  const key = req.headers['x-admin-key'];
  if (key !== ADMIN_KEY) return res.status(403).json({ error: 'Доступ запрещен' });
  
  const orders = await Order.find().populate('userId');
  res.json(orders);
});

app.delete('/api/admin/users/:userId', async (req, res) => {
  const key = req.headers['x-admin-key'];
  if (key !== ADMIN_KEY) return res.status(403).json({ error: 'Доступ запрещен' });
  
  await User.findByIdAndDelete(req.params.userId);
  await Cart.findOneAndDelete({ userId: req.params.userId });
  res.json({ success: true });
});

// ========== ЗАПУСК ==========
const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 СЕРВЕР ЗАПУЩЕН!`);
  console.log(`📍 Порт: ${PORT}`);
  console.log(`📍 Адрес: http://localhost:${PORT}`);
  console.log(`✅ MongoDB: ${mongoose.connection.readyState === 1 ? 'подключена' : 'не подключена'}\n`);
});