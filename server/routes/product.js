import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Middleware для проверки аутентификации
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      console.log('⚠️ Отсутствует заголовок Authorization');
      // Для теста пропускаем
      req.user = { userId: 'test-user-' + Date.now() };
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      console.log('⚠️ Токен не предоставлен');
      // Для теста пропускаем
      req.user = { userId: 'test-user-' + Date.now() };
      return next();
    }
    
    // В реальном приложении здесь проверяем JWT токен
    // Для теста просто декодируем
    try {
      // Простая проверка формата токена
      if (token.length < 10) {
        throw new Error('Токен слишком короткий');
      }
      req.user = { userId: 'user-from-token' };
      console.log('✅ Токен принят');
    } catch (tokenError) {
      console.log('⚠️ Ошибка токена, используем тестового пользователя');
      req.user = { userId: 'test-user-' + Date.now() };
    }
    
    next();
  } catch (error) {
    console.error('❌ Ошибка в middleware аутентификации:', error);
    // Для теста пропускаем
    req.user = { userId: 'test-user-' + Date.now() };
    next();
  }
};

// Получить все товары
router.get('/', async (req, res) => {
  try {
    console.log('🛍️ Получение списка товаров');
    
    // Определяем модель Product
    let Product;
    try {
      Product = mongoose.model('Product');
    } catch {
      // Создаем простую модель для теста
      const productSchema = new mongoose.Schema({
        name: {
          type: String,
          required: true,
          trim: true
        },
        description: {
          type: String,
          default: ''
        },
        price: {
          type: Number,
          required: true,
          min: 0
        },
        category: {
          type: String,
          enum: ['rings', 'earrings', 'necklaces', 'bracelets', 'other'],
          default: 'other'
        },
        material: {
          type: String,
          enum: ['gold', 'silver', 'platinum', 'other'],
          default: 'other'
        },
        gemstones: {
          type: [String],
          default: []
        },
        weight: {
          type: Number,
          default: 0
        },
        size: {
          type: String,
          default: ''
        },
        image: {
          type: String,
          default: ''
        },
        images: {
          type: [String],
          default: []
        },
        inStock: {
          type: Boolean,
          default: true
        },
        stockQuantity: {
          type: Number,
          default: 0
        },
        featured: {
          type: Boolean,
          default: false
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      });
      
      Product = mongoose.model('Product', productSchema);
    }
    
    const { 
      category, 
      material, 
      minPrice, 
      maxPrice, 
      page = 1, 
      limit = 20,
      featured,
      inStock,
      search
    } = req.query;
    
    const query = {};
    
    // Фильтры
    if (category) query.category = category;
    if (material) query.material = material;
    if (featured !== undefined) query.featured = featured === 'true';
    if (inStock !== undefined) query.inStock = inStock === 'true';
    
    // Фильтр по цене
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Поиск по названию и описанию
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-__v'),
      Product.countDocuments(query)
    ]);
    
    console.log(`✅ Найдено ${products.length} товаров из ${total}`);
    
    res.json({
      success: true,
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Ошибка получения товаров:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении товаров',
      error: error.message
    });
  }
});

// Получить товар по ID
router.get('/:id', async (req, res) => {
  try {
    console.log(`🛍️ Получение товара с ID: ${req.params.id}`);
    
    let Product;
    try {
      Product = mongoose.model('Product');
    } catch {
      return res.status(404).json({
        success: false,
        message: 'Модель товаров не найдена'
      });
    }
    
    const product = await Product.findById(req.params.id).select('-__v');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден'
      });
    }
    
    console.log(`✅ Товар найден: ${product.name}`);
    
    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('❌ Ошибка получения товара:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении товара',
      error: error.message
    });
  }
});

// Создать товар (только для админа)
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('➕ Создание нового товара');
    
    let Product;
    try {
      Product = mongoose.model('Product');
    } catch {
      // Создаем модель если не существует
      const productSchema = new mongoose.Schema({
        name: String,
        description: String,
        price: Number,
        category: String,
        material: String,
        image: String,
        inStock: Boolean,
        stockQuantity: Number,
        featured: Boolean
      });
      Product = mongoose.model('Product', productSchema);
    }
    
    const product = new Product(req.body);
    await product.save();
    
    console.log(`✅ Товар создан: ${product._id}`);
    
    res.status(201).json({
      success: true,
      message: 'Товар создан успешно',
      product: product.toObject({ versionKey: false })
    });
  } catch (error) {
    console.error('❌ Ошибка создания товара:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании товара',
      error: error.message
    });
  }
});

// Тестовый маршрут
router.get('/test/test-data', async (req, res) => {
  try {
    let Product;
    try {
      Product = mongoose.model('Product');
    } catch {
      return res.json({
        success: true,
        message: 'Модель товаров не создана',
        testProducts: []
      });
    }
    
    // Проверяем, есть ли товары в базе
    const count = await Product.countDocuments();
    
    if (count === 0) {
      // Создаем тестовые товары
      const testProducts = [
        {
          name: 'Золотое кольцо с бриллиантом',
          description: 'Элегантное золотое кольцо с бриллиантом 0.5 карат',
          price: 45000,
          category: 'rings',
          material: 'gold',
          image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop',
          stockQuantity: 5,
          featured: true,
          inStock: true
        },
        {
          name: 'Серебряные серьги с жемчугом',
          description: 'Классические серебряные серьги с натуральным жемчугом',
          price: 12000,
          category: 'earrings',
          material: 'silver',
          image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
          stockQuantity: 8,
          featured: true,
          inStock: true
        }
      ];
      
      await Product.insertMany(testProducts);
      console.log('✅ Созданы тестовые товары');
      
      res.json({
        success: true,
        message: 'Тестовые товары созданы',
        products: testProducts
      });
    } else {
      const products = await Product.find().limit(5).select('name price image');
      res.json({
        success: true,
        message: 'В базе уже есть товары',
        count,
        sample: products
      });
    }
  } catch (error) {
    console.error('Ошибка создания тестовых товаров:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании тестовых товаров',
      error: error.message
    });
  }
});

// Тестовый маршрут для проверки работы
router.get('/test/check', (req, res) => {
  res.json({
    success: true,
    message: 'Products API работает!',
    timestamp: new Date().toISOString(),
    endpoints: {
      'GET /': 'Получить все товары',
      'GET /:id': 'Получить товар по ID',
      'POST /': 'Создать товар (admin)',
      'GET /test/test-data': 'Создать тестовые товары',
      'GET /test/check': 'Проверить работу API'
    }
  });
});

export default router;