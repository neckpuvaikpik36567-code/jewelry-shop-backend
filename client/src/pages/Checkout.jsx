import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config';

function Checkout() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
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

  const calculateTotal = () => {
    let total = 0;
    if (cart?.items) {
      cart.items.forEach((item) => {
        if (item.productId) {
          total += item.productId.price * item.quantity;
        }
      });
    }
    return total;
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    
    if (!shippingAddress.firstName || !shippingAddress.address || !shippingAddress.phone) {
      alert('Заполните все поля');
      return;
    }

    setProcessingPayment(true);
    const userId = localStorage.getItem("userId");
    const total = calculateTotal();

    try {
      // Создаем заказ
      const orderResponse = await fetch(`${config.apiUrl}/api/orders`, {
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

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || !orderData.success) {
        throw new Error(orderData.error || 'Не удалось создать заказ');
      }

      // Создаем платеж в YooKassa (используем config.apiUrl вместо localhost)
      const paymentResponse = await fetch(`${config.apiUrl}/api/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          orderId: orderData.order.id,
          amount: total,
          description: `Заказ ${orderData.order.orderNumber}`,
          returnUrl: `${window.location.origin}/profile`
        })
      });

      const paymentData = await paymentResponse.json();

      if (paymentData.success && paymentData.confirmationUrl) {
        window.location.href = paymentData.confirmationUrl;
      } else {
        throw new Error(paymentData.error || 'Не удалось создать платеж');
      }
      
    } catch (err) {
      console.error('Ошибка:', err);
      alert(err.message || 'Ошибка при оформлении заказа');
      setProcessingPayment(false);
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

  const total = calculateTotal();

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

        <button type="submit" disabled={processingPayment} className="submit-order-btn">
          {processingPayment ? 'Обработка...' : `Оплатить ${total} ₽`}
        </button>
      </form>
    </div>
  );
}

export default Checkout;