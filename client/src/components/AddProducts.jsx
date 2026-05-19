const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/jewelry_shop';

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  imageUrl: String,
  stock: Number,
  isAvailable: Boolean
});

const Product = mongoose.model('Product', ProductSchema);

const products = [
  { name: "Кольцо Сердце", price: 120, category: "rings", imageUrl: "/img/love.jpg", stock: 10, isAvailable: true },
  { name: "Кольцо Классика", price: 150, category: "rings", imageUrl: "/img/classika.jpg", stock: 10, isAvailable: true },
  { name: "Кольцо Вечность", price: 180, category: "rings", imageUrl: "/img/vechnost.jpg", stock: 10, isAvailable: true },
  { name: "Кольцо Звезда", price: 200, category: "rings", imageUrl: "/img/star.jpg", stock: 10, isAvailable: true },
  { name: "Кольцо Луна", price: 170, category: "rings", imageUrl: "/img/loon.jpg", stock: 10, isAvailable: true },
  { name: "Кольцо Солнце", price: 190, category: "rings", imageUrl: "/img/sun.jpg", stock: 10, isAvailable: true },
  { name: "Кольцо Цветок", price: 160, category: "rings", imageUrl: "/img/flover.jpg", stock: 10, isAvailable: true },
  { name: "Кольцо Элегант", price: 220, category: "rings", imageUrl: "/img/elegant.jpg", stock: 10, isAvailable: true },
  { name: "Кольцо Лебедь", price: 210, category: "rings", imageUrl: "/img/lebed.jpg", stock: 10, isAvailable: true },
  { name: "Кольцо Капля", price: 140, category: "rings", imageUrl: "/img/cap.jpg", stock: 10, isAvailable: true },
  { name: "Серьга Звезда", price: 90, category: "earrings", imageUrl: "/img/s1.jpg", stock: 10, isAvailable: true },
  { name: "Серьга Луна", price: 95, category: "earrings", imageUrl: "/img/s5.jpg", stock: 10, isAvailable: true },
  { name: "Серьга Солнце", price: 100, category: "earrings", imageUrl: "/img/s8.jpg", stock: 10, isAvailable: true },
  { name: "Серьга Цветок", price: 110, category: "earrings", imageUrl: "/img/s6.jpg", stock: 10, isAvailable: true },
  { name: "Серьга Сердце", price: 120, category: "earrings", imageUrl: "/img/s2.jpg", stock: 10, isAvailable: true },
  { name: "Серьга Лебедь", price: 130, category: "earrings", imageUrl: "/img/s4.jpg", stock: 10, isAvailable: true },
  { name: "Серьга Капля", price: 140, category: "earrings", imageUrl: "/img/s10.jpg", stock: 10, isAvailable: true },
  { name: "Серьга Элегант", price: 150, category: "earrings", imageUrl: "/img/s9.jpg", stock: 10, isAvailable: true },
  { name: "Серьга Вечность", price: 160, category: "earrings", imageUrl: "/img/s3.jpg", stock: 10, isAvailable: true },
  { name: "Серьга Классика", price: 170, category: "earrings", imageUrl: "/img/s1.jpg", stock: 10, isAvailable: true },
  { name: "Браслет Звезда", price: 200, category: "bracelets", imageUrl: "/img/starbraslet.jpg", stock: 10, isAvailable: true },
  { name: "Браслет Луна", price: 210, category: "bracelets", imageUrl: "/img/loonbraslet.jpg", stock: 10, isAvailable: true },
  { name: "Браслет Солнце", price: 220, category: "bracelets", imageUrl: "/img/sunbraslet.jpg", stock: 10, isAvailable: true },
  { name: "Браслет Цветок", price: 230, category: "bracelets", imageUrl: "/img/floverbraslet.jpg", stock: 10, isAvailable: true },
  { name: "Браслет Сердце", price: 240, category: "bracelets", imageUrl: "/img/lovebraslet.jpg", stock: 10, isAvailable: true },
  { name: "Браслет Лебедь", price: 250, category: "bracelets", imageUrl: "/img/lebedbraslet.jpg", stock: 10, isAvailable: true },
  { name: "Браслет Капля", price: 260, category: "bracelets", imageUrl: "/img/brasletkapla.jpg", stock: 10, isAvailable: true },
  { name: "Браслет Элегант", price: 270, category: "bracelets", imageUrl: "/img/brasletelegat.jpg", stock: 10, isAvailable: true },
  { name: "Браслет Вечность", price: 280, category: "bracelets", imageUrl: "/img/brasletvechnost.jpg", stock: 10, isAvailable: true },
  { name: "Браслет Классика", price: 290, category: "bracelets", imageUrl: "/img/brasletclassika.jpg", stock: 10, isAvailable: true },
  { name: "Ожерелье Звезда", price: 300, category: "necklaces", imageUrl: "/img/ostar.jpg", stock: 10, isAvailable: true },
  { name: "Ожерелье Луна", price: 310, category: "necklaces", imageUrl: "/img/oloon.jpg", stock: 10, isAvailable: true },
  { name: "Ожерелье Солнце", price: 320, category: "necklaces", imageUrl: "/img/osun.jpg", stock: 10, isAvailable: true },
  { name: "Ожерелье Цветок", price: 330, category: "necklaces", imageUrl: "/img/oflover.jpg", stock: 10, isAvailable: true },
  { name: "Ожерелье Сердце", price: 340, category: "necklaces", imageUrl: "/img/olove.jpg", stock: 10, isAvailable: true },
  { name: "Ожерелье Лебедь", price: 350, category: "necklaces", imageUrl: "/img/olebed.jpg", stock: 10, isAvailable: true },
  { name: "Ожерелье Капля", price: 360, category: "necklaces", imageUrl: "/img/ocapl.jpg", stock: 10, isAvailable: true },
  { name: "Ожерелье Элегант", price: 370, category: "necklaces", imageUrl: "/img/oeleg.jpg", stock: 10, isAvailable: true },
  { name: "Ожерелье Вечность", price: 380, category: "necklaces", imageUrl: "/img/ovech.jpg", stock: 10, isAvailable: true },
  { name: "Ожерелье Классика", price: 390, category: "necklaces", imageUrl: "/img/oclass.jpg", stock: 10, isAvailable: true }
];

async function addProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    await Product.deleteMany({});
    console.log('🗑️ Cleared old products');
    
    const result = await Product.insertMany(products);
    console.log(`✅ Added ${result.length} products`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addProducts();