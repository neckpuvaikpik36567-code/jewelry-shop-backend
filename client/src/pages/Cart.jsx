import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config';
import "../style/cart.css";

import img1 from "../img/love.jpg";
import img2 from "../img/classika.jpg";
import img3 from "../img/vechnost.jpg";
import img4 from "../img/star.jpg";
import img5 from "../img/loon.jpg";
import img6 from "../img/sun.jpg";
import img7 from "../img/flower.jpg";
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

// Соответствие названия товара и его картинки
const imageMap = {
  // Кольца
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
  
  // Браслеты
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
  
  // Серьги
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
  
  // Ожерелья
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

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (!userId || !isLoggedIn) {
      alert('Для просмотра корзины нужно войти в аккаунт');
      navigate('/login');
      return;
    }

    fetchCart(userId);
  }, []);

  const fetchCart = async (userId) => {
    try {
      const res = await fetch(`${config.apiUrl}/api/cart`, {
        headers: {
          'x-user-id': userId,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log('Корзина загружена:', data);
      setCart(data.data || { items: [] });
    } catch (err) {
      console.error('Ошибка:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      const res = await fetch(`${config.apiUrl}/api/cart/${productId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId },
      });

      if (res.ok) {
        fetchCart(userId);
      } else {
        alert('Не удалось удалить товар');
      }
    } catch (err) {
      console.error('Ошибка:', err);
      alert('Не удалось удалить товар');
    }
  };

  if (loading) return <div className="cart-loading">Загрузка корзины...</div>;
  if (error) return <div className="cart-error">Ошибка: {error}</div>;

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="empty-cart">
        <h2>Корзина пуста</h2>
        <button onClick={() => navigate('/catalog')}>Перейти в каталог</button>
      </div>
    );
  }

  let total = 0;
  cart.items.forEach((item) => {
    if (item.productId) {
      total += item.productId.price * item.quantity;
    }
  });

  return (
    <div className="cart-page">
      <h1>Корзина</h1>

      <div className="cart-items">
        {cart.items.map((item, index) => {
          const product = item.productId;
          if (!product) return null;

          return (
            <div key={index} className="cart-item">
              <img 
                src={imageMap[product.name] || '/img/placeholder.jpg'} 
                alt={product.name} 
                className="item-img"
                onError={(e) => {
                  e.target.src = '/img/placeholder.jpg';
                  console.error('Не загрузилось изображение для:', product.name);
                }}
              />
              <div className="item-info">
                <h3>{product.name}</h3>
                <p>{product.price} ₽ × {item.quantity}</p>
              </div>
              <div className="item-sum">
                {(product.price * item.quantity).toFixed(0)} ₽
              </div>
              <button className="remove-btn" onClick={() => removeItem(product._id)}>
                Удалить
              </button>
            </div>
          );
        })}
      </div>

      <div className="cart-footer">
        <div className="total-sum">
          Итого: <strong>{total.toFixed(0)} ₽</strong>
        </div>
        <button className="checkout-btn" onClick={() => navigate('/checkout')}>
          Оформить заказ
        </button>
      </div>
    </div>
  );
}

export default Cart;