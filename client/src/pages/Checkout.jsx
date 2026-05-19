import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config';

function Checkout() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    address: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (!isLoggedIn || !userId) {
      alert("Для оформления заказа нужно войти в аккаунт!");
      navigate('/login');
      return;
    }

    fetchCart();
  }, []);

  const fetchCart = async () => {
    const userId = localStorage.getItem("userId");
    
    try {
      const response = await fetch(`${config.apiUrl}/api/cart`, {
        headers: {
          'x-user-id': userId
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('Корзина:', data);
      setCart(data.data || { items: [] });
    } catch (err) {
      console.error('Ошибка загрузки корзины:', err);
      setError('Не удалось загрузить корзину');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    
    if (!shippingAddress.firstName || !shippingAddress.address || !shippingAddress.phone) {
      alert('Заполните все поля');
      return;
    }

    const userId = localStorage.getItem("userId");
    setLoading(true);

    try {
      const response = await fetch(`${config.apiUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          address: shippingAddress.address,
          phone: shippingAddress.phone,
          fullName: shippingAddress.firstName
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Заказ успешно оформлен!');
        navigate('/profile');
      } else {
        alert('Ошибка: ' + (data.error || 'Не удалось оформить заказ'));
      }
    } catch (err) {
      console.error('Ошибка:', err);
      alert('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="checkout-loading">Загрузка...</div>;
  }

  if (error) {
    return <div className="checkout-error">{error}</div>;
  }

  if (!cart || (cart.items && cart.items.length === 0)) {
    return (
      <div className="empty-cart">
        <h2>Корзина пуста</h2>
        <button onClick={() => navigate('/catalog')}>Перейти в каталог</button>
      </div>
    );
  }

  let total = 0;
  if (cart.items) {
    cart.items.forEach((item) => {
      if (item.productId) {
        const product = item.productId;
        total += product.price * item.quantity;
      }
    });
  }

  return (
    <div className="checkout-container">
      <h2>Оформление заказа</h2>

      <div className="checkout-items">
        <h3>Ваши товары:</h3>
        {cart.items.map((item, index) => {
          const product = item.productId;
          if (!product) return null;
          return (
            <div key={index} className="checkout-item">
              <span>{product.name}</span>
              <span>{item.quantity} × {product.price} ₽</span>
              <span>{product.price * item.quantity} ₽</span>
            </div>
          );
        })}
        <div className="checkout-total">
          <strong>Итого: {total} ₽</strong>
        </div>
      </div>

      <form onSubmit={handleOrderSubmit} className="checkout-form">
        <h3>Данные для доставки:</h3>
        
        <div className="form-group">
          <label>Имя и фамилия:</label>
          <input
            type="text"
            value={shippingAddress.firstName}
            onChange={e => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Телефон:</label>
          <input
            type="tel"
            value={shippingAddress.phone}
            onChange={e => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Адрес доставки:</label>
          <textarea
            value={shippingAddress.address}
            onChange={e => setShippingAddress({ ...shippingAddress, address: e.target.value })}
            required
          />
        </div>

        <button type="submit" disabled={loading} className="submit-order-btn">
          {loading ? 'Оформление...' : 'Подтвердить заказ'}
        </button>
      </form>
    </div>
  );
}

export default Checkout;