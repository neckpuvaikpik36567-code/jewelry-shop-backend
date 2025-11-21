import { useState } from "react";
import "../style/catalog.css"

import img1 from "../img/love.jpg";
// ... остальные импорты изображений как у тебя были

function Catalog() {
  const [selectedCategory, setSelectedCategory] = useState("Кольца");

  const categories = {
    "Кольца": [
      { id: 1, name: "Кольцо Сердце", price: 120, img: img1 },
      // ... остальные товары
    ],
    // ... остальные категории
  };

  const handleAddToCart = (item) => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      alert("Чтобы добавить товары в корзину, нужно войти или зарегистрироваться!");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find((c) => c.id === item.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${item.name} добавлено в корзину!`);
  };

  return (
    <div className="catalog-container">
      <h1 className="catalog-title">Каталог украшений</h1>

      <div className="category-buttons">
        {Object.keys(categories).map((cat) => (
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
        {categories[selectedCategory].map((item) => (
          <div key={item.id} className="product-card">
            <img src={item.img} alt={item.name} className="product-img" />
            <p className="product-name">{item.name}</p>
            <p className="product-price">${item.price}</p>
            <button
              className="add-to-cart"
              onClick={() => handleAddToCart(item)}
            >
              Добавить в корзину
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Catalog;
