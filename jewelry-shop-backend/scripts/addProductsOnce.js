// server/scripts/addProductsOnce.js
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/jewelry_shop';

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  imageUrl: String,
  stock: { type: Number, default: 10 },
  isAvailable: { type: Boolean, default: true }
});

const Product = mongoose.model('Product', ProductSchema);

const products = [
  { name: "Кольцо Сердце", price: 120, category: "rings", imageUrl: "/img/love.jpg" },
  { name: "Кольцо Классика", price: 150, category: "rings", imageUrl: "/img/classika.jpg" },
  { name: "Кольцо Вечность", price: 180, category: "rings", imageUrl: "/img/vechnost.jpg" },
  { name: "Кольцо Звезда", price: 200, category: "rings", imageUrl: "/img/star.jpg" },
  { name: "Кольцо Луна", price: 170, category: "rings", imageUrl: "/img/loon.jpg" },
  { name: "Кольцо Солнце", price: 190, category: "rings", imageUrl: "/img/sun.jpg" },
  { name: "Кольцо Цветок", price: 160, category: "rings", imageUrl: "/img/flover.jpg" },
  { name: "Кольцо Элегант", price: 220, category: "rings", imageUrl: "/img/elegant.jpg" },
  { name: "Кольцо Лебедь", price: 210, category: "rings", imageUrl: "/img/lebed.jpg" },
  { name: "Кольцо Капля", price: 140, category: "rings", imageUrl: "/img/cap.jpg" },
  { name: "Серьга Звезда", price: 90, category: "earrings", imageUrl: "/img/s1.jpg" },
  { name: "Серьга Луна", price: 95, category: "earrings", imageUrl: "/img/s5.jpg" },
  { name: "Серьга Солнце", price: 100, category: "earrings", imageUrl: "/img/s8.jpg" },
  { name: "Серьга Цветок", price: 110, category: "earrings", imageUrl: "/img/s6.jpg" },
  { name: "Серьга Сердце", price: 120, category: "earrings", imageUrl: "/img/s2.jpg" },
  { name: "Серьга Лебедь", price: 130, category: "earrings", imageUrl: "/img/s4.jpg" },
  { name: "Серьга Капля", price: 140, category: "earrings", imageUrl: "/img/s10.jpg" },
  { name: "Серьга Элегант", price: 150, category: "earrings", imageUrl: "/img/s9.jpg" },
  { name: "Серьга Вечность", price: 160, category: "earrings", imageUrl: "/img/s3.jpg" },
  { name: "Серьга Классика", price: 170, category: "earrings", imageUrl: "/img/s1.jpg" },
  { name: "Браслет Звезда", price: 200, category: "bracelets", imageUrl: "/img/starbraslet.jpg" },
  { name: "Браслет Луна", price: 210, category: "bracelets", imageUrl: "/img/loonbraslet.jpg" },
  { name: "Браслет Солнце", price: 220, category: "bracelets", imageUrl: "/img/sunbraslet.jpg" },
  { name: "Браслет Цветок", price: 230, category: "bracelets", imageUrl: "/img/floverbraslet.jpg" },
  { name: "Браслет Сердце", price: 240, category: "bracelets", imageUrl: "/img/lovebraslet.jpg" },
  { name: "Браслет Лебедь", price: 250, category: "bracelets", imageUrl: "/img/lebedbraslet.jpg" },
  { name: "Браслет Капля", price: 260, category: "bracelets", imageUrl: "/img/brasletkapla.jpg" },
  { name: "Браслет Элегант", price: 270, category: "bracelets", imageUrl: "/img/brasletelegat.jpg" },
  { name: "Браслет Вечность", price: 280, category: "bracelets", imageUrl: "/img/brasletvechnost.jpg" },
  { name: "Браслет Классика", price: 290, category: "bracelets", imageUrl: "/img/brasletclassika.jpg" },
  { name: "Ожерелье Звезда", price: 300, category: "necklaces", imageUrl: "/img/ostar.jpg" },
  { name: "Ожерелье Луна", price: 310, category: "necklaces", imageUrl: "/img/oloon.jpg" },
  { name: "Ожерелье Солнце", price: 320, category: "necklaces", imageUrl: "/img/osun.jpg" },
  { name: "Ожерелье Цветок", price: 330, category: "necklaces", imageUrl: "/img/oflover.jpg" },
  { name: "Ожерелье Сердце", price: 340, category: "necklaces", imageUrl: "/img/olove.jpg" },
  { name: "Ожерелье Лебедь", price: 350, category: "necklaces", imageUrl: "/img/olebed.jpg" },
  { name: "Ожерелье Капля", price: 360, category: "necklaces", imageUrl: "/img/ocapl.jpg" },
  { name: "Ожерелье Элегант", price: 370, category: "necklaces", imageUrl: "/img/oeleg.jpg" },
  { name: "Ожерелье Вечность", price: 380, category: "necklaces", imageUrl: "/img/ovech.jpg" },
  { name: "Ожерелье Классика", price: 390, category: "necklaces", imageUrl: "/img/oclass.jpg" }
];

async function addProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Очищаем старые товары
    const deleted = await Product.deleteMany({});
    console.log(`🗑️ Удалено старых товаров: ${deleted.deletedCount}`);
    
    // Добавляем новые
    const result = await Product.insertMany(products);
    console.log(`✅ Добавлено товаров: ${result.length}`);
    
    console.log('\n📊 Статистика:');
    const rings = await Product.countDocuments({ category: 'rings' });
    const earrings = await Product.countDocuments({ category: 'earrings' });
    const bracelets = await Product.countDocuments({ category: 'bracelets' });
    const necklaces = await Product.countDocuments({ category: 'necklaces' });
    console.log(`  Кольца: ${rings}`);
    console.log(`  Серёжки: ${earrings}`);
    console.log(`  Браслеты: ${bracelets}`);
    console.log(`  Ожерелья: ${necklaces}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

addProducts();