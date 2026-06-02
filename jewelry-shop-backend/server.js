require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const crypto = require('crypto');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ========== НАСТРОЙКИ YOOKASSA ==========
const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID || 'ваш_shop_id';
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY || 'test_ваш_секретный_ключ';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Функция для создания базовой аутентификации
const getBasicAuthHeader = () => {
    const authString = `${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`;
    const encodedAuth = Buffer.from(authString).toString('base64');
    return `Basic ${encodedAuth}`;
};

// Функция создания платежа через YooKassa API
async function createYooKassaPayment(amount, orderId, description, returnUrl, userId) {
    const idempotenceKey = crypto.randomUUID();
    
    const paymentData = {
        amount: {
            value: amount.toString(),
            currency: 'RUB'
        },
        payment_method_data: {
            type: 'bank_card'
        },
        confirmation: {
            type: 'redirect',
            return_url: returnUrl || `${FRONTEND_URL}/profile`
        },
        description: description || `Заказ #${orderId} в Jewelry Shop`,
        metadata: {
            orderId: orderId,
            userId: userId
        }
    };
    
    const response = await fetch('https://api.yookassa.ru/v3/payments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Idempotence-Key': idempotenceKey,
            'Authorization': getBasicAuthHeader()
        },
        body: JSON.stringify(paymentData)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.description || 'Ошибка создания платежа');
    }
    
    return await response.json();
}

// ПОДКЛЮЧЕНИЕ К MONGODB
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
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
  paymentStatus: { type: String, default: 'pending' },
  paymentId: String,
  address: String,
  phone: String,
  fullName: String
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

// ДОБАВИТЬ В КОРЗИНУ
app.post('/api/cart/add', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { productId, quantity } = req.body;
    
    if (!productId) {
      return res.status(400).json({ error: 'productId не указан' });
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }
    
    const existingItem = cart.items.find(item => item.productId && item.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }
    
    await cart.save();
    await cart.populate('items.productId');
    
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

// ========== YOOKASSA: СОЗДАНИЕ ПЛАТЕЖА ==========
app.post('/api/create-payment', async (req, res) => {
  const { orderId, amount, description, returnUrl } = req.body;
  const userId = req.headers['x-user-id'];

  console.log('💰 Создание платежа:', { orderId, amount, userId });

  try {
    const payment = await createYooKassaPayment(
      amount, 
      orderId, 
      description, 
      returnUrl,
      userId
    );
    
    await Order.findByIdAndUpdate(orderId, { 
      paymentId: payment.id,
      paymentStatus: 'pending'
    });

    console.log('✅ Платеж создан:', payment.id);
    
    res.json({
      success: true,
      confirmationUrl: payment.confirmation.confirmation_url,
      paymentId: payment.id
    });
  } catch (error) {
    console.error('❌ Ошибка создания платежа:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ========== YOOKASSA: WEBHOOK ==========
app.post('/api/yookassa-webhook', async (req, res) => {
  const event = req.body;
  
  console.log('📨 Получен webhook:', event);
  
  try {
    if (event.object && event.object.status === 'succeeded') {
      const { orderId } = event.object.metadata;
      
      await Order.findByIdAndUpdate(orderId, { 
        paymentStatus: 'paid',
        status: 'paid'
      });
      
      console.log(`✅ Заказ ${orderId} успешно оплачен!`);
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ Ошибка обработки webhook:', error);
    res.status(500).send('Error');
  }
});

// СОЗДАНИЕ ЗАКАЗА
app.post('/api/orders', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { address, phone, fullName } = req.body;
    
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
      phone,
      fullName: fullName || '',
      paymentStatus: 'pending',
      status: 'pending'
    });
    
    await order.save();
    
    cart.items = [];
    await cart.save();
    
    res.json({ 
      success: true, 
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        total: order.total
      }
    });
  } catch (err) {
    console.error('❌ Ошибка создания заказа:', err);
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


const ADMIN_KEY = 'super-secret-admin-key-2026';

app.get('/api/admin/products', async (req, res) => {
  const key = req.headers['x-admin-key'];
  if (key !== ADMIN_KEY) {
    return res.status(403).json({ error: 'Доступ запрещен. Только для администратора.' });
  }
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
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

app.get('/api/admin/users', async (req, res) => {
  const key = req.headers['x-admin-key'];
  if (key !== ADMIN_KEY) return res.status(403).json({ error: 'Доступ запрещен' });
  
  const users = await User.find().select('-password');
  res.json(users);
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
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 СЕРВЕР ЗАПУЩЕН!`);
  console.log(`📍 Порт: ${PORT}`);
  console.log(`✅ MongoDB: ${mongoose.connection.readyState === 1 ? 'подключена' : 'не подключена'}`);
  console.log(`💳 YooKassa: ${YOOKASSA_SHOP_ID !== 'ваш_shop_id' ? 'настроена' : 'не настроена'}\n`);
});
