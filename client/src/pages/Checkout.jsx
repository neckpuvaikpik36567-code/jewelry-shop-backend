import React, { useState, useEffect } from 'react';
import config from '../config';

function Checkout() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    address: ''
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const res = await fetch(`${config.apiUrl}/api/cart`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await res.json();
    setCart(data);
  };

  const handleYooKassaPayment = async () => {
    if (!shippingAddress.firstName || !shippingAddress.address) {
      alert('Заполните адрес');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${config.apiUrl}/api/yookassa/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: cart.totalAmount
        })
      });

      const data = await res.json();

      if (data.confirmationUrl) {
        window.location.href = data.confirmationUrl;
      } else {
        alert('Ошибка платежа');
      }
    } catch (e) {
      alert('Ошибка: ' + e.message);
    }

    setLoading(false);
  };

  if (!cart) return <div>Загрузка...</div>;

  return (
    <div className="checkout">
      <h2>Оформление заказа</h2>

      {cart.items.map(item => (
        <div key={item._id}>
          {item.product.name} — {item.quantity} × {item.price} ₽
        </div>
      ))}

      <h3>Итого: {cart.totalAmount} ₽</h3>

      <input
        type="text"
        placeholder="Имя"
        value={shippingAddress.firstName}
        onChange={e => setShippingAddress({ ...shippingAddress, firstName: e.target.value })}
      />

      <input
        type="text"
        placeholder="Адрес"
        value={shippingAddress.address}
        onChange={e => setShippingAddress({ ...shippingAddress, address: e.target.value })}
      />

      <button onClick={handleYooKassaPayment} disabled={loading}>
        {loading ? 'Переход к оплате...' : 'Оплатить через ЮKassa'}
      </button>
    </div>
  );
}

export default Checkout;
