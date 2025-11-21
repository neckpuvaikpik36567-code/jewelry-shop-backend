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

    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log('✅ MongoDB подключена');

    // Seed данных
    const defaultProducts = [
      { id: 1, name: 'Кольцо Сердце', price: 120, image: '/images/love.jpg', description: 'Кольцо в форме сердца', category: 'Кольца' },
      // ... остальные товары
    ];

    const createDefaultUsers = async () => {
      const hashedPassword = await bcrypt.hash('password123', 12);
      return [
        {
          name: 'Алексей Иванов',
          email: 'alex@example.com',
          password: hashedPassword,
          isAdmin: true
        },
        {
          name: 'Мария Петрова',
          email: 'maria@example.com', 
          password: hashedPassword,
          isAdmin: false
        }
      ];
    };

    const seedDatabase = async () => {
      try {
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
      } catch (err) {
        console.error('❌ Ошибка при заполнении базы:', err.message);
      }
    };

    await seedDatabase();

  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error.message);
    process.exit(1);
  }
};

export default db;
