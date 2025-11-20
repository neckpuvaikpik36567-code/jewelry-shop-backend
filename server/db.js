import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Используем MONGO_URL, если есть, иначе локальный Mongo для разработки
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/jewelry';

    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB подключен');
  } catch (error) {
    console.error('❌ Ошибка подключения к MongoDB:', error.message);
    process.exit(1); // Завершаем процесс, если подключение не удалось
  }
};

export default connectDB;
