import { useState } from "react";
import "../style/catalog.css";

// Картинки колец
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

// Картинки браслетов
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

// Картинки серёг
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

// Картинки ожерелий
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

  const categories = {
    "Кольца": [
      { id: 1, name: "Кольцо Сердце", price: 120, img: img1 },
      { id: 2, name: "Кольцо Классика", price: 150, img: img2 },
      { id: 3, name: "Кольцо Вечность", price: 180, img: img3 },
      { id: 4, name: "Кольцо Звезда", price: 200, img: img4 },
      { id: 5, name: "Кольцо Луна", price: 170, img: img5 },
      { id: 6, name: "Кольцо Солнце", price: 190, img: img6 },
      { id: 7, name: "Кольцо Цветок", price: 160, img: img7 },
      { id: 8, name: "Кольцо Элегант", price: 220, img: img8 },
      { id: 9, name: "Кольцо Лебедь", price: 210, img: img9 },
      { id: 10, name: "Кольцо Капля", price: 140, img: img10 },
    ],
    "Серёжки": [
      { id: 11, name: "Серьга Звезда", price: 90, img: img21 },
      { id: 12, name: "Серьга Луна", price: 95, img: img22 },
      { id: 13, name: "Серьга Солнце", price: 100, img: img23 },
      { id: 14, name: "Серьга Цветок", price: 110, img: img24 },
      { id: 15, name: "Серьга Сердце", price: 120, img: img25 },
      { id: 16, name: "Серьга Лебедь", price: 130, img: img26 },
      { id: 17, name: "Серьга Капля", price: 140, img: img27 },
      { id: 18, name: "Серьга Элегант", price: 150, img: img28 },
      { id: 19, name: "Серьга Вечность", price: 160, img: img29 },
      { id: 20, name: "Серьга Классика", price: 170, img: img30 },
    ],
    "Браслеты": [
      { id: 21, name: "Браслет Звезда", price: 200, img: img11 },
      { id: 22, name: "Браслет Луна", price: 210, img: img12 },
      { id: 23, name: "Браслет Солнце", price: 220, img: img13 },
      { id: 24, name: "Браслет Цветок", price: 230, img: img14 },
      { id: 25, name: "Браслет Сердце", price: 240, img: img15 },
      { id: 26, name: "Браслет Лебедь", price: 250, img: img16 },
      { id: 27, name: "Браслет Капля", price: 260, img: img17 },
      { id: 28, name: "Браслет Элегант", price: 270, img: img18 },
      { id: 29, name: "Браслет Вечность", price: 280, img: img19 },
      { id: 30, name: "Браслет Классика", price: 290, img: img20 },
    ],
    "Ожерелья": [
      { id: 31, name: "Ожерелье Звезда", price: 300, img: img31 },
      { id: 32, name: "Ожерелье Луна", price: 310, img: img32 },
      { id: 33, name: "Ожерелье Солнце", price: 320, img: img33 },
      { id: 34, name: "Ожерелье Цветок", price: 330, img: img34 },
      { id: 35, name: "Ожерелье Сердце", price: 340, img: img35 },
      { id: 36, name: "Ожерелье Лебедь", price: 350, img: img36 },
      { id: 37, name: "Ожерелье Капля", price: 360, img: img37 },
      { id: 38, name: "Ожерелье Элегант", price: 370, img: img38 },
      { id: 39, name: "Ожерелье Вечность", price: 380, img: img39 },
      { id: 40, name: "Ожерелье Классика", price: 390, img: img40 },
    ],
  };

  // 🔹 Добавление товара в корзину
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
