import { useState, useEffect } from "react";
import config from '../config';
import "../style/catalog.css";

// ВАШИ ИМПОРТЫ КАРТИНОК
import img1 from "../img/love.jpg";
import img2 from "../img/classika.jpg";
import img3 from "../img/vechnost.jpg";
import img4 from "../img/star.jpg";
import img5 from "../img/loon.jpg";
import img6 from "../img/sun.jpg";
import img7 from "../img/flover.jpg";
import img8 from "../img/elegant.jpg";
import img9 from "../img/lebed.jpg";
import img10 from "../img/cap.jpg";

import img11 from "../img/starbraslet.jpg";
import img12 from "../img/loonbraslet.jpg";
import img13 from "../img/sunbraslet.jpg";
import img14 from "../img/floverbraslet.jpg";
import img15 from "../img/lovebraslet.jpg";
import img16 from "../img/lebedbraslet.jpg";
import img17 from "../img/brasletkapla.jpg";
import img18 from "../img/brasletelegat.jpg";
import img19 from "../img/brasletvechnost.jpg";
import img20 from "../img/brasletclassika.jpg";

import img21 from "../img/s1.jpg";
import img22 from "../img/s5.jpg";
import img23 from "../img/s8.jpg";
import img24 from "../img/s6.jpg";
import img25 from "../img/s2.jpg";
import img26 from "../img/s4.jpg";
import img27 from "../img/s10.jpg";
import img28 from "../img/s9.jpg";
import img29 from "../img/s3.jpg";
import img30 from "../img/s1.jpg";

import img31 from "../img/ostar.jpg";
import img32 from "../img/oloon.jpg";
import img33 from "../img/osun.jpg";
import img34 from "../img/oflover.jpg";
import img35 from "../img/olove.jpg";
import img36 from "../img/olebed.jpg";
import img37 from "../img/ocapl.jpg";
import img38 from "../img/oeleg.jpg";
import img39 from "../img/ovech.jpg";
import img40 from "../img/oclass.jpg";

function Catalog() {
  const [selectedCategory, setSelectedCategory] = useState("Кольца");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ["Кольца", "Серёжки", "Браслеты", "Ожерелья"];
  
  const categoryMap = {
    "Кольца": "rings",
    "Серёжки": "earrings",
    "Браслеты": "bracelets",
    "Ожерелья": "necklaces"
  };

  // МАППИНГ: имя товара -> импортированная картинка
  const imageMap = {
    "Кольцо Сердце": img1,
    "Кольцо Классика": img2,
    "Кольцо Вечность": img3,
    "Кольцо Звезда": img4,
    "Кольцо Луна": img5,
    "Кольцо Солнце": img6,
    "Кольцо Цветок": img7,
    "Кольцо Элегант": img8,
    "Кольцо Лебедь": img9,
    "Кольцо Капля": img10,
    "Серьга Звезда": img21,
    "Серьга Луна": img22,
    "Серьга Солнце": img23,
    "Серьга Цветок": img24,
    "Серьга Сердце": img25,
    "Серьга Лебедь": img26,
    "Серьга Капля": img27,
    "Серьга Элегант": img28,
    "Серьга Вечность": img29,
    "Серьга Классика": img30,
    "Браслет Звезда": img11,
    "Браслет Луна": img12,
    "Браслет Солнце": img13,
    "Браслет Цветок": img14,
    "Браслет Сердце": img15,
    "Браслет Лебедь": img16,
    "Браслет Капля": img17,
    "Браслет Элегант": img18,
    "Браслет Вечность": img19,
    "Браслет Классика": img20,
    "Ожерелье Звезда": img31,
    "Ожерелье Луна": img32,
    "Ожерелье Солнце": img33,
    "Ожерелье Цветок": img34,
    "Ожерелье Сердце": img35,
    "Ожерелье Лебедь": img36,
    "Ожерелье Капля": img37,
    "Ожерелье Элегант": img38,
    "Ожерелье Вечность": img39,
    "Ожерелье Классика": img40,
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/products`);
      const data = await response.json();
      console.log('✅ Загружено товаров:', data.length);
      setProducts(data);
    } catch (error) {
      console.error('❌ Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (item) => {
    const userId = localStorage.getItem("userId");
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    // Отладка
    console.log('=== ДОБАВЛЕНИЕ В КОРЗИНУ ===');
    console.log('userId:', userId);
    console.log('isLoggedIn:', isLoggedIn);
    console.log('Товар:', item.name);
    console.log('productId:', item._id);

    if (!isLoggedIn || !userId) {
      alert("Чтобы добавить товары в корзину, нужно войти в аккаунт!");
      return;
    }

    try {
      const response = await fetch(`${config.apiUrl}/api/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          productId: item._id,
          quantity: 1
        })
      });

      const data = await response.json();
      console.log('Ответ сервера:', data);
      
      if (response.ok && data.success) {
        alert(`${item.name} добавлено в корзину!`);
      } else {
        alert('Ошибка: ' + (data.error || 'Не удалось добавить товар'));
      }
    } catch (error) {
      console.error('Ошибка при добавлении в корзину:', error);
      alert('Ошибка подключения к серверу. Убедитесь, что сервер запущен.');
    }
  };

  const getFilteredProducts = () => {
    const englishCategory = categoryMap[selectedCategory];
    return products.filter(product => product.category === englishCategory);
  };

  if (loading) {
    return <div className="loading">Загрузка товаров...</div>;
  }

  return (
    <div className="catalog-container">
      <h1 className="catalog-title">Каталог украшений</h1>

      <div className="category-buttons">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`category-btn ${selectedCategory === cat ? "active" : ""}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="product-grid">
        {getFilteredProducts().map((item) => (
          <div key={item._id} className="product-card">
            <img 
              src={imageMap[item.name]} 
              alt={item.name} 
              className="product-img" 
            />
            <p className="product-name">{item.name}</p>
            <p className="product-price">{item.price} ₽</p>
            <button
              className="add-to-cart"
              onClick={() => handleAddToCart(item)}
            >
              Добавить в корзину
            </button>
          </div>
        ))}
      </div>

      {getFilteredProducts().length === 0 && (
        <p className="no-products">Нет товаров в этой категории</p>
      )}
    </div>
  );
}

export default Catalog;