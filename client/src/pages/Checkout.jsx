import React, { useState, useEffect } from "react";
import "../style/checkout.css";

const SERVER_URL = "https://curs-8bsq.onrender.com";

function Checkout() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: ""
  });

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${SERVER_URL}/api/checkout/orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Ошибка загрузки заказов:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleTestPayment = async () => {
    if (!shippingAddress.firstName || !shippingAddress.address) {
      alert("Пожалуйста, заполните адрес доставки");
      return;
    }

    if (!cart.length) {
      alert("Корзина пуста!");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${SERVER_URL}/api/checkout/test-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          shippingAddress,
          items: cart.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1
          })),
          totalAmount: cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0),
          userId: "68f10b0e1cd3b39074630ad9"
        })
      });

      const result = await response.json();

      if (response.ok) {
        alert(`✅ Заказ успешно создан! Номер заказа: ${result.order.orderNumber}`);
        setCart([]);
        localStorage.removeItem("cart");
        fetchOrders();
      } else {
        alert(`❌ Ошибка: ${result.message || "Неизвестная ошибка"}`);
      }
    } catch (error) {
      console.error("Ошибка при создании заказа:", error);
      alert("Ошибка при создании заказа: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!cart) return <div>Загрузка...</div>;

  return (
    <div className="checkout">
      <h2>Оформление заказа</h2>

      {cart.length === 0 ? (
        <div>
          <p>Корзина пуста</p>
          {orders.length > 0 && (
            <div>
              <h3>История заказов</h3>
              {orders.map((order) => (
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
            {cart.map((item) => (
              <div key={item.id} className="checkout-item">
                <span>{item.name}</span>
                <span>{item.quantity || 1} × {item.price} руб.</span>
                <span>{((item.quantity || 1) * item.price).toFixed(2)} руб.</span>
              </div>
            ))}
            <div className="checkout-total">
              <strong>Итого: {cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)} руб.</strong>
            </div>
          </div>

          <div className="shipping-form">
            <h3>Адрес доставки</h3>
            <input type="text" name="firstName" placeholder="Имя" value={shippingAddress.firstName} onChange={handleInputChange} required />
            <input type="text" name="lastName" placeholder="Фамилия" value={shippingAddress.lastName} onChange={handleInputChange} />
            <input type="text" name="address" placeholder="Адрес" value={shippingAddress.address} onChange={handleInputChange} required />
            <input type="text" name="city" placeholder="Город" value={shippingAddress.city} onChange={handleInputChange} />
            <input type="text" name="postalCode" placeholder="Почтовый индекс" value={shippingAddress.postalCode} onChange={handleInputChange} />
            <input type="text" name="country" placeholder="Страна" value={shippingAddress.country} onChange={handleInputChange} />
            <input type="tel" name="phone" placeholder="Телефон" value={shippingAddress.phone} onChange={handleInputChange} />
          </div>

          <div className="payment-section">
            <h3>Тестовая оплата</h3>
            <p>Это тестовый платеж. Заказ будет создан сразу без реальной оплаты.</p>
            <button onClick={handleTestPayment} disabled={loading} className="payment-button">
              {loading ? "Создание заказа..." : "Завершить тестовый заказ"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;
