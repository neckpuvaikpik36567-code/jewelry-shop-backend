// client/src/pages/Cart.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config'; // { apiUrl: 'http://localhost:5000' }

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('userId');

    if (!userId) {
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
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setCart(data.data || { items: [] });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      await fetch(`${config.apiUrl}/api/cart/${productId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId },
      });
      fetchCart(userId); // перезагружаем корзину
    } catch (err) {
      alert('Не удалось удалить товар');
    }
  };

  if (loading) return <div className="cart-loading">Загрузка корзины...</div>;
  if (error) return <div className="cart-error">Ошибка: {error}</div>;

  if (!cart || cart.items.length === 0) {
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
        {cart.items.map((item) => {
          const p = item.productId;
          if (!p) return null;

          return (
            <div key={item._id} className="cart-item">
              <img src={p.imageUrl} alt={p.name} className="item-img" />
              <div className="item-info">
                <h3>{p.name}</h3>
                <p>{p.price} ₽ × {item.quantity}</p>
              </div>
              <div className="item-sum">
                {(p.price * item.quantity).toFixed(0)} ₽
              </div>
              <button className="remove-btn" onClick={() => removeItem(p._id)}>
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