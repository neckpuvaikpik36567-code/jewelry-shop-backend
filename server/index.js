import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import db from './db.js';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orderRoutes.js';
import { Product } from './models/Product.js';
import { User } from './models/User.js';
import { Order } from './models/Order.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// --- Подключение к MongoDB и seed ---
db();

// --- Основные маршруты ---
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

// --- API маршруты ---
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));
