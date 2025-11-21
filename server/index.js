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

app.use(cors());
app.use(express.json());

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

const defaultProducts = [
  { id: 1, name: 'Кольцо Сердце', price: 120, image: '/images/love.jpg', description: 'Кольцо в форме сердца', category: 'Кольца' },
  { id: 2, name: 'Кольцо Классика', price: 150, image: '/images/classika.jpg', description: 'Классическое кольцо', category: 'Кольца' },
  { id: 3, name: 'Кольцо Вечность', price: 200, image: '/images/vechnost.jpg', description: 'Символ вечной любви', category: 'Кольца' },
  { id: 4, name: 'Кольцо Звезда', price: 200, image: '/images/star.jpg', description: 'Сияние звезды', category: 'Кольца' },
  { id: 5, name: 'Кольцо Луна', price: 170, image: '/images/loon.jpg', description: 'Кольцо с лунным дизайном', category: 'Кольца' },
  { id: 6, name: 'Кольцо Солнце', price: 190, image: '/images/sun.jpg', description: 'Яркое солнечное кольцо', category: 'Кольца' },
  { id: 7, name: 'Кольцо Цветок', price: 160, image: '/images/flover.jpg', description: 'Кольцо с цветочным узором', category: 'Кольца' },
  { id: 8, name: 'Кольцо Элегант', price: 220, image: '/images/elegant.jpg', description: 'Элегантное кольцо', category: 'Кольца' },
  { id: 9, name: 'Кольцо Лебедь', price: 210, image: '/images/lebed.jpg', description: 'Кольцо с лебединым дизайном', category: 'Кольца' },
  { id: 10, name: 'Кольцо Капля', price: 140, image: '/images/cap.jpg', description: 'Кольцо в форме капли', category: 'Кольца' },
  { id: 11, name: 'Серьга Звезда', price: 90, image: '/images/s1.jpg', description: 'Серьга в форме звезды', category: 'Серёжки' },
  { id: 12, name: 'Серьга Луна', price: 95, image: '/images/s5.jpg', description: 'Серьга с лунным дизайном', category: 'Серёжки' },
  { id: 13, name: 'Серьга Солнце', price: 100, image: '/images/s8.jpg', description: 'Яркая солнечная серьга', category: 'Серёжки' },
  { id: 14, name: 'Серьга Цветок', price: 110, image: '/images/s6.jpg', description: 'Серьга с цветочным узором', category: 'Серёжки' },
  { id: 15, name: 'Серьга Сердце', price: 120, image: '/images/s2.jpg', description: 'Серьга в форме сердца', category: 'Серёжки' },
  { id: 16, name: 'Серьга Лебедь', price: 130, image: '/images/s4.jpg', description: 'Серьга с лебединым дизайном', category: 'Серёжки' },
  { id: 17, name: 'Серьга Капля', price: 140, image: '/images/s10.jpg', description: 'Серьга в форме капли', category: 'Серёжки' },
  { id: 18, name: 'Серьга Элегант', price: 150, image: '/images/s9.jpg', description: 'Элегантная серьга', category: 'Серёжки' },
  { id: 19, name: 'Серьга Вечность', price: 160, image: '/images/s3.jpg', description: 'Серьга символизирующая вечность', category: 'Серёжки' },
  { id: 20, name: 'Серьга Классика', price: 170, image: '/images/s1.jpg', description: 'Классическая серьга', category: 'Серёжки' },
  { id: 21, name: 'Браслет Звезда', price: 200, image: '/images/starbraslet.jpg', description: 'Браслет с звездным дизайном', category: 'Браслеты' },
  { id: 22, name: 'Браслет Луна', price: 210, image: '/images/loonbraslet.jpg', description: 'Браслет с лунным узором', category: 'Браслеты' },
  { id: 23, name: 'Браслет Солнце', price: 220, image: '/images/sunbraslet.jpg', description: 'Яркий солнечный браслет', category: 'Браслеты' },
  { id: 24, name: 'Браслет Цветок', price: 230, image: '/images/floverbraslet.jpg', description: 'Браслет с цветочным дизайном', category: 'Браслеты' },
  { id: 25, name: 'Браслет Сердце', price: 240, image: '/images/lovebraslet.jpg', description: 'Браслет в форме сердца', category: 'Браслеты' },
  { id: 26, name: 'Браслет Лебедь', price: 250, image: '/images/lebedbraslet.jpg', description: 'Браслет с лебединым узором', category: 'Браслеты' },
  { id: 27, name: 'Браслет Капля', price: 260, image: '/images/brasletkapla.jpg', description: 'Браслет в форме капли', category: 'Браслеты' },
  { id: 28, name: 'Браслет Элегант', price: 270, image: '/images/brasletelegat.jpg', description: 'Элегантный браслет', category: 'Браслеты' },
  { id: 29, name: 'Браслет Вечность', price: 280, image: '/images/brasletvechnost.jpg', description: 'Браслет символизирующий вечность', category: 'Браслеты' },
  { id: 30, name: 'Браслет Классика', price: 290, image: '/images/brasletclassika.jpg', description: 'Классический браслет', category: 'Браслеты' },
  { id: 31, name: 'Ожерелье Звезда', price: 300, image: '/images/ostar.jpg', description: 'Ожерелье с звездой', category: 'Ожерелья' },
  { id: 32, name: 'Ожерелье Луна', price: 310, image: '/images/oloon.jpg', description: 'Ожерелье с лунным дизайном', category: 'Ожерелья' },
  { id: 33, name: 'Ожерелье Солнце', price: 320, image: '/images/osun.jpg', description: 'Яркое солнечное ожерелье', category: 'Ожерелья' },
  { id: 34, name: 'Ожерелье Цветок', price: 330, image: '/images/oflover.jpg', description: 'Ожерелье с цветочным узором', category: 'Ожерелья' },
  { id: 35, name: 'Ожерелье Сердце', price: 340, image: '/images/olove.jpg', description: 'Ожерелье в форме сердца', category: 'Ожерелья' },
  { id: 36, name: 'Ожерелье Лебедь', price: 350, image: '/images/olebed.jpg', description: 'Ожерелье с лебединым дизайном', category: 'Ожерелья' },
  { id: 37, name: 'Ожерелье Капля', price: 360, image: '/images/ocapl.jpg', description: 'Ожерелье в форме капли', category: 'Ожерелья' },
  { id: 38, name: 'Ожерелье Элегант', price: 370, image: '/images/oeleg.jpg', description: 'Элегантное ожерелье', category: 'Ожерелья' },
  { id: 39, name: 'Ожерелье Вечность', price: 380, image: '/images/ovech.jpg', description: 'Ожерелье символизирующее вечность', category: 'Ожерелья' },
  { id: 40, name: 'Ожерелье Классика', price: 390, image: '/images/oclass.jpg', description: 'Классическое ожерелье', category: 'Ожерелья' },
];

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
      console.log(`👤 Тестовые пользователи:`);
      console.log(`   Email: alex@example.com, Password: password123`);
      console.log(`   Email: maria@example.com, Password: password123`);
    } else {
      console.log(`ℹ️ Данные уже есть, seed пропущен`);
    }
  } catch (err) {
    console.error(`❌ Ошибка при заполнении базы:`, err.message);
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));