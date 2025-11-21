import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { Product } from './models/Product.js';
import { User } from './models/User.js';
import { Order } from './models/Order.js';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();
const app = express();

// CORS (важно для телефона!)
app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization"
}));

app.use(express.json());

// Подключение к MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    console.log(
      `✅ MongoDB подключена в ${new Date().toLocaleString("ru-RU", {
        timeZone: "Europe/Moscow",
      })}`
    )
  )
  .catch((err) => console.error(`❌ Ошибка подключения MongoDB:`, err.message));

// --- Твои тестовые данные, ничего не трогаю ---
const defaultProducts = [/* весь массив как у тебя */];

const createDefaultUsers = async () => [
  { name: "Алексей Иванов", email: "alex@example.com", password: await bcrypt.hash("password123", 10) },
  { name: "Мария Петрова", email: "maria@example.com", password: await bcrypt.hash("password123", 10) },
];

const seedDatabase = async () => {
  try {
    const productCount = await Product.countDocuments();
    const userCount = await User.countDocuments();

    if (productCount === 0 || userCount === 0) {
      console.log(`🧹 Очищаем старые данные...`);
      await Product.deleteMany({});
      await User.deleteMany({});
      await Order.deleteMany({});

      console.log(`📦 Добавляем тестовые товары...`);
      const products = await Product.insertMany(defaultProducts);

      console.log(`👤 Добавляем пользователей...`);
      const defaultUsers = await createDefaultUsers();
      const users = await User.insertMany(defaultUsers);

      console.log(`🧾 Добавляем тестовый заказ...`);
      await Order.create({
        user: users[0]._id,
        items: [{
          product: products.find(p => p.id === 1)._id,
          quantity: 1,
          price: products.find(p => p.id === 1).price,
          productName: products.find(p => p.id === 1).name
        }],
        totalAmount: products.find(p => p.id === 1).price,
        status: "pending",
        paymentStatus: "paid",
        shippingAddress: {
          firstName: "Алексей",
          lastName: "Иванов",
          address: "г. Москва, ул. Примерная, д. 10",
          city: "Москва",
          postalCode: "123456",
          country: "Россия",
          phone: "+79991234567"
        }
      });

      console.log(`✅ База успешно заполнена тестовыми данными!`);
    } else {
      console.log(`ℹ️ Данные уже есть, seed пропущен`);
    }
  } catch (err) {
    console.error(`❌ Ошибка seed:`, err.message);
  }
};

mongoose.connection.once("open", seedDatabase);

// Основные маршруты
app.get("/", (req, res) => res.send("🚀 Сервер работает и подключён к базе данных!"));
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Ошибка при получении товаров" });
  }
});
app.get("/users", async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Ошибка при получении пользователей" });
  }
});
app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().populate("user").populate("items.product");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Ошибка при получении заказов" });
  }
});

// API маршруты
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

// --- ВАЖНО ДЛЯ RENDER!!! ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Сервер запущен на порту ${PORT}`)
);
