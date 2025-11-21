import { useEffect, useState } from "react";
import "../style/cart.css";
import config from "../config";

function Cart() {
  const [cart, setCart] = useState([]);
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = [...cart];
    updatedCart[index].quantity = newQuantity;
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeItem = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!fullName || !address || !phone || cart.length === 0) {
      alert("Заполните все поля и добавьте товары в корзину!");
      setLoading(false);
      return;
    }

    try {
      console.log("📱 Создание заказа...");
      
      const orderData = {
        fullName,
        address,
        phone,
        items: cart.map((item) => ({ 
          id: item.id, 
          name: item.name, 
          price: item.price, 
          quantity: item.quantity || 1 
        })),
        total,
        userId: localStorage.getItem("userId") || "68f10b0e1cd3b39074630ad9",
      };

      const response = await fetch(`${config.apiUrl}/api/orders/simple`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      console.log("📊 Статус заказа:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        const currentUser = localStorage.getItem("currentUser");
        if (currentUser) {
          const existingOrders = JSON.parse(localStorage.getItem("orders")) || {};
          const userOrders = existingOrders[currentUser] || [];
          
          userOrders.unshift({
            id: result.order._id,
            orderNumber: result.order.orderNumber,
            date: new Date().toLocaleDateString('ru-RU'),
            fullName,
            address,
            phone,
            total,
            items: cart.map(item => ({
              name: item.name,
              price: item.price,
              quantity: item.quantity || 1,
              image: item.image
            })),
            status: 'pending',
            paymentStatus: 'paid'
          });
          
          existingOrders[currentUser] = userOrders;
          localStorage.setItem("orders", JSON.stringify(existingOrders));
        }

        setCart([]);
        localStorage.removeItem("cart");
        setFullName("");
        setAddress("");
        setPhone("");
        
        alert(`🎉 Заказ успешно оформлен! Номер заказа: ${result.order?.orderNumber}`);
      } else {
        throw new Error(result.message || "Неизвестная ошибка");
      }
    } catch (err) {
      console.error("❌ Ошибка подключения:", err);
      
      if (err.message.includes("Failed to fetch")) {
        alert("📡 Не удалось подключиться к серверу. Проверьте интернет-соединение.");
      } else {
        alert("❌ Ошибка оформления заказа: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-container">
        <h1 className="cart-title">🛒 Ваша корзина</h1>
        <p className="empty-cart">Ваша корзина пуста</p>
        <div className="go-shopping">
          <a href="/catalog" className="btn btn-primary">Перейти к покупкам</a>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1 className="cart-title">🛒 Ваша корзина</h1>
      
      <div className="cart-items">
        {cart.map((item, index) => (
          <div key={index} className="cart-item">
            <img src={item.image || item.img} alt={item.name} className="cart-item-image" />
            <div className="cart-item-info">
              <h3>{item.name}</h3>
              <p className="cart-item-price">${item.price}</p>
              
              <div className="quantity-controls">
                <button 
                  onClick={() => updateQuantity(index, (item.quantity || 1) - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span>{item.quantity || 1}</span>
                <button 
                  onClick={() => updateQuantity(index, (item.quantity || 1) + 1)}
                >
                  +
                </button>
              </div>
              
              <p className="cart-item-total">
                Итого: ${(item.price * (item.quantity || 1)).toFixed(2)}
              </p>
              
              <button 
                onClick={() => removeItem(index)}
                className="remove-btn"
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="cart-total">
        <h2>Общая сумма: ${total.toFixed(2)}</h2>
      </div>
      
      <form onSubmit={handleCheckout} className="checkout-form">
        <h3>Данные для доставки</h3>
        
        <input 
          type="text" 
          placeholder="ФИО" 
          value={fullName} 
          onChange={(e) => setFullName(e.target.value)} 
          required 
          disabled={loading}
        />
        
        <input 
          type="text" 
          placeholder="Адрес доставки" 
          value={address} 
          onChange={(e) => setAddress(e.target.value)} 
          required 
          disabled={loading}
        />
        
        <input 
          type="tel" 
          placeholder="Телефон" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
          required 
          disabled={loading}
        />
        
        <button 
          type="submit" 
          className="checkout-btn"
          disabled={loading}
        >
          {loading ? "⏳ Оформление..." : `💳 Оплатить $${total.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
}

export default Cart;