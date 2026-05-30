const mongoose = require('mongoose');
 
const MONGODB_URI = 'mongodb+srv://neckpuvaikpik36567_db_user:O60Xt04fLNHMsr8k@cluster0.fijeusu.mongodb.net/jewelry';
 
// Схема товара
const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  imageUrl: String,
  stock: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true }
});
 
const Product = mongoose.model('Product', ProductSchema);
 
// Список товаров для добавления
const products = [
  // Кольца (rings)
  { name: "Кольцо Сердце", price: 3500, category: "rings", stock: 10 },
  { name: "Кольцо Классика", price: 2800, category: "rings", stock: 15 },
  { name: "Кольцо Вечность", price: 4200, category: "rings", stock: 8 },
  { name: "Кольцо Звезда", price: 3900, category: "rings", stock: 12 },
  { name: "Кольцо Луна", price: 3100, category: "rings", stock: 10 },
  { name: "Кольцо Солнце", price: 3700, category: "rings", stock: 7 },
  { name: "Кольцо Цветок", price: 2900, category: "rings", stock: 14 },
  { name: "Кольцо Элегант", price: 4500, category: "rings", stock: 6 },
  { name: "Кольцо Лебедь", price: 5200, category: "rings", stock: 5 },
  { name: "Кольцо Капля", price: 3400, category: "rings", stock: 9 },
  
  // Серёжки (earrings)
  { name: "Серьга Звезда", price: 3200, category: "earrings", stock: 10 },
  { name: "Серьга Луна", price: 2900, category: "earrings", stock: 12 },
  { name: "Серьга Солнце", price: 3500, category: "earrings", stock: 8 },
  { name: "Серьга Цветок", price: 2700, category: "earrings", stock: 15 },
  { name: "Серьга Сердце", price: 3300, category: "earrings", stock: 11 },
  { name: "Серьга Лебедь", price: 4800, category: "earrings", stock: 6 },
  { name: "Серьга Капля", price: 3100, category: "earrings", stock: 9 },
  { name: "Серьга Элегант", price: 4200, category: "earrings", stock: 7 },
  { name: "Серьга Вечность", price: 3900, category: "earrings", stock: 8 },
  { name: "Серьга Классика", price: 2600, category: "earrings", stock: 13 },
  
  // Браслеты (bracelets)
  { name: "Браслет Звезда", price: 4500, category: "bracelets", stock: 8 },
  { name: "Браслет Луна", price: 4200, category: "bracelets", stock: 10 },
  { name: "Браслет Солнце", price: 4800, category: "bracelets", stock: 7 },
  { name: "Браслет Цветок", price: 3900, category: "bracelets", stock: 12 },
  { name: "Браслет Сердце", price: 4600, category: "bracelets", stock: 9 },
  { name: "Браслет Лебедь", price: 5800, category: "bracelets", stock: 5 },
  { name: "Браслет Капля", price: 4400, category: "bracelets", stock: 8 },
  { name: "Браслет Элегант", price: 5500, category: "bracelets", stock: 6 },
  { name: "Браслет Вечность", price: 5200, category: "bracelets", stock: 7 },
  { name: "Браслет Классика", price: 3800, category: "bracelets", stock: 11 },
  
  // Ожерелья (necklaces)
  { name: "Ожерелье Звезда", price: 6800, category: "necklaces", stock: 6 },
  { name: "Ожерелье Луна", price: 6500, category: "necklaces", stock: 8 },
  { name: "Ожерелье Солнце", price: 7200, category: "necklaces", stock: 5 },
  { name: "Ожерелье Цветок", price: 5900, category: "necklaces", stock: 9 },
  { name: "Ожерелье Сердце", price: 6900, category: "necklaces", stock: 7 },
  { name: "Ожерелье Лебедь", price: 8500, category: "necklaces", stock: 4 },
  { name: "Ожерелье Капля", price: 6400, category: "necklaces", stock: 7 },
  { name: "Ожерелье Элегант", price: 7800, category: "necklaces", stock: 5 },
  { name: "Ожерелье Вечность", price: 7500, category: "necklaces", stock: 6 },
  { name: "Ожерелье Классика", price: 5800, category: "necklaces", stock: 10 }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Подключено к MongoDB');
    
    // Очищаем коллекцию товаров
    await Product.deleteMany({});
    console.log('🗑️ Старые товары удалены');
    
    // Добавляем новые товары
    const result = await Product.insertMany(products);
    console.log(`✅ Добавлено ${result.length} товаров`);
    
    console.log('\n📋 Список добавленных товаров:');
    result.forEach(product => {
      console.log(`   - ${product.name} (${product.category}) - ${product.price} ₽`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}
 
seedDatabase();