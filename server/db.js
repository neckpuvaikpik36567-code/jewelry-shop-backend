import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Product } from './models/Product.js';
import { User } from './models/User.js';
import { Order } from './models/Order.js';

const db = async () => {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error('MONGO_URL не задан в .env');
    }

    await mongoose.connect(process.env.MONGO_URL);
    console.log('✅ MongoDB подключена');

    // Seed данных
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
      // … продолжи все товары так же
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
        } else {
          console.log(`ℹ️ Данные уже есть, seed пропущен`);
        }
      } catch (err) {
        console.error(`❌ Ошибка при заполнении базы:`, err.message);
      }
    };

    await seedDatabase();

  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error.message);
    process.exit(1);
  }
};

export default db;
