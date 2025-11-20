import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Product } from './models/Product.js';
import { User } from './models/User.js';
import { Order } from './models/Order.js';

const db = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) throw new Error('❌ MONGO_URL не задана в переменных окружения!');

    await mongoose.connect(mongoUrl);
    console.log('✅ MongoDB подключен');

    // --- Seed данных ---
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
      // Добавь остальные товары по аналогии
    ];

    const createDefaultUsers = async () => [
      { name: "Алексей Иванов", email: "alex@example.com", password: await bcrypt.hash("password123", 10) },
      { name: "Мария Петрова", email: "maria@example.com", password: await bcrypt.hash("password123", 10) },
    ];

    const seedDatabase = async () => {
      const productCount = await Product.countDocuments();
      const userCount = await User.countDocuments();

      if (productCount === 0 || userCount === 0) {
        console.log('🧹 Очищаем старые данные...');
        await Product.deleteMany({});
        await User.deleteMany({});
        await Order.deleteMany({});

        console.log('📦 Добавляем тестовые товары...');
        const products = await Product.insertMany(defaultProducts);

        console.log('👤 Добавляем пользователей...');
        const users = await User.insertMany(await createDefaultUsers());

        console.log('🧾 Добавляем тестовый заказ...');
        await Order.create({
          user: users[0]._id,
          items: [{
            product: products[0]._id,
            quantity: 1,
            price: products[0].price,
            productName: products[0].name
          }],
          totalAmount: products[0].price,
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

        console.log('✅ База успешно заполнена тестовыми данными!');
        console.log('👤 Тестовые пользователи:');
        console.log('   Email: alex@example.com, Password: password123');
        console.log('   Email: maria@example.com, Password: password123');
      } else {
        console.log('ℹ️ Данные уже есть, seed пропущен');
      }
    };

    await seedDatabase();

  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error.message);
    process.exit(1);
  }
};

export default db;
