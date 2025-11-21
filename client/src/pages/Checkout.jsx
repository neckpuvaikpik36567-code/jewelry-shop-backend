import React, { useState, useEffect } from "react";

const SERVER_URL = "https://curs-8bsq.onrender.com";

function Checkout() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [shippingAddress, setShippingAddress] = useState({
    firstName: "", lastName: "", address: "", city: "", postalCode: "", country: "", phone: ""
  });

  useEffect(() => {
    fetchCart();
    fetchOrders();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/cart`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const cartData = await response.json();
      setCart(cartData);
    } catch (error) { console.error('Ошибка загрузки корзины:', error); }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/checkout/orders`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const ordersData = await response.json();
      setOrders(ordersData);
    } catch (error) { console.error('Ошибка загрузки заказов:', error); }
  };

  const handleTestPayment = async () => {
    if (!shippingAddress.firstName || !shippingAddress.address) {
      alert('Пожалуйста, заполните адрес доставки');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/checkout/test-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ shippingAddress })
      });
      const result = await response.json();
      if (result.success) {
        alert('Заказ успешно создан! Номер заказа: ' + result.order.orderNumber);
        setCart({ items: [], totalAmount: 0 });
        fetchOrders();
      } else {
        alert('Ошибка: ' + result.message);
      }
    } catch (error) {
      alert('Ошибка при создании заказа: ' + error.message);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  if (!cart) return <div>Загрузка...</div>;

  return (
    <div className="checkout">
      <h2>Оформление заказа</h2>
      {cart.items.length === 0 ? (
        <div>
          <p>Корзина пуста</p>
          {orders.length > 0 && (
            <div>
              <h3>История заказов</h3>
              {orders.map(order => (
                <div key={order._id} className="order-item">
                  <p><strong>Заказ #{order.orderNumber}</strong></p>
                  <p>Сумма: {order.totalAmount} руб.</p>
                  <p>Статус: {order.status}</p>
                  <p>Дата: {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="checkout-content">
          <div className="cart-items">
            <h3>Товары в заказе</h3>
            {cart.items.map(item => (
              <div key={item._id} className="checkout-item">
                <span>{item.product.name}</span>
                <span>{item.quantity} × {item.price} руб.</span>
                <span>{(item.quantity * item.price).toFixed(2)} руб.</span>
              </div>
            ))}
            <div className="checkout-total">
              <strong>Итого: {cart.totalAmount} руб.</strong>
            </div>
          </div>
          <div className="shipping-form">
            <h3>Адрес доставки</h3>
            <input type="text" name="firstName" placeholder="Имя" value={shippingAddress.firstName} onChange={handleInputChange} required />
            <input type="text" name="lastName" placeholder="Фамилия" value={shippingAddress.lastName} onChange={handleInputChange} />
            <input type="text" name="address" placeholder="Адрес" value={shippingAddress.address} onChange={handleInputChange} required />
            <input type="text" name="city" placeholder="Город" value={shippingAddress.city} onChange={handleInputChange} required />
            <input type="text" name="postalCode" placeholder="Почтовый индекс" value={shippingAddress.postalCode} onChange={handleInputChange} />
            <input type="text" name="country" placeholder="Страна" value={shippingAddress.country} onChange={handleInputChange} />
            <input type="tel" name="phone" placeholder="Телефон" value={shippingAddress.phone} onChange={handleInputChange} />
          </div>
          <div className="payment-section">
            <h3>Тестовая оплата</h3>
            <p>Это тестовый платеж. Заказ будет создан сразу без реальной оплаты.</p>
            <button onClick={handleTestPayment} disabled={loading} className="payment-button">
              {loading ? 'Создание заказа...' : 'Завершить тестовый заказ'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;
