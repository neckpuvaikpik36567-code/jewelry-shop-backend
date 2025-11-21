import { useState } from "react";
import "../style/catalog.css";

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

// Пример картинок для браслетов
import img11 from "../img/starbraslet.jpg";
import img12 from "../img/loonbraslet.jpg";
import img13 from "../img/sunbraslet.jpg";

function Catalog() {
  const [selectedCategory, setSelectedCategory] = useState("Кольца");

  const categories = {
    "Кольца": [
      { id: 1, name: "Кольцо Сердце", price: 120, img: img1 },
      { id: 2, name: "Кольцо Классика", price: 150, img: img2 },
      { id: 3, name: "Кольцо Вечность", price: 180, img: img3 },
      { id: 4, name: "Кольцо Звезда", price: 200, img: img4 },
      { id: 5, name: "Кольцо Луна", price: 170, img: img5 },
    ],
    "Браслеты": [
      { id: 21, name: "Браслет Звезда", price: 200, img: img11 },
      { id: 22, name: "Браслет Луна", price: 210, img: img12 },
      { id: 23, name: "Браслет Солнце", price: 220, img: img13 },
    ],
  };

  const handleAddToCart = (item) => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      alert("Чтобы добавить товары в корзину, нужно войти или зарегистрироваться!");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find((c) => c.id === item.id);
    if (existingItem) existingItem.quantity += 1;
    else cart.push({ ...item, quantity: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${item.name} добавлено в корзину!`);
  };

  return (
    <div className="catalog-container">
      <h1 className="catalog-title">Каталог украшений</h1>
      <div className="category-buttons">
        {Object.keys(categories).map((cat) => (
          <button key={cat} onClick={() => setSelectedCategory(cat)} className={`category-btn ${selectedCategory === cat ? "active" : ""}`}>
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
            <button className="add-to-cart" onClick={() => handleAddToCart(item)}>Добавить в корзину</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Catalog;
