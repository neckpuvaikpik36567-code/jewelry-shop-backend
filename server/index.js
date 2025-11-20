import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';

import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Подключаем базу и seed
db();

// Основные маршруты
app.get("/", (req, res) => res.send("🚀 Сервер работает и подключён к базе данных!"));
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));
