// Admin.jsx - с возможностью добавлять товары
import React, { useState, useEffect } from 'react';
import config from '../config';
import "../style/admin.css"

const ADMIN_KEY = 'super-secret-admin-key-2026';

function Admin() {
  const [isAuth, setIsAuth] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [activeTab, setActiveTab] = useState('users');

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Состояние для формы добавления товара
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: 'rings',
    imageUrl: '',
    stock: 10
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('adminAuthKey');
    if (savedKey === ADMIN_KEY) {
      setIsAuth(true);
      loadData();
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    const headers = { 'x-admin-key': ADMIN_KEY };

    try {
      const [prodRes, orderRes, userRes] = await Promise.all([
        fetch(`${config.apiUrl}/api/admin/products`, { headers }),
        fetch(`${config.apiUrl}/api/admin/orders`, { headers }),
        fetch(`${config.apiUrl}/api/admin/users`, { headers })
      ]);

      const prodData = await prodRes.json();
      const orderData = await orderRes.json();
      const userData = await userRes.json();

      setProducts(prodData.data || prodData || []);
      setOrders(orderData.data || orderData || []);
      setUsers(userData.data || userData || []);
    } catch (err) {
      console.error('Ошибка загрузки:', err);
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = () => {
    if (loginEmail === 'admin@shop.ru' && loginPassword === 'AdminStrong2026!') {
      localStorage.setItem('adminAuthKey', ADMIN_KEY);
      setIsAuth(true);
      loadData();
    } else {
      alert('Неверный логин или пароль');
    }
  };

  // ➕ ДОБАВЛЕНИЕ ТОВАРА
  const addProduct = async (e) => {
    e.preventDefault();
    
    if (!newProduct.name || !newProduct.price) {
      alert('Заполните название и цену');
      return;
    }

    try {
      const response = await fetch(`${config.apiUrl}/api/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': ADMIN_KEY
        },
        body: JSON.stringify({
          name: newProduct.name,
          price: Number(newProduct.price),
          category: newProduct.category,
          imageUrl: newProduct.imageUrl || '/img/placeholder.jpg',
          stock: Number(newProduct.stock),
          isAvailable: true
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        alert(`Товар "${newProduct.name}" добавлен!`);
        setNewProduct({ name: '', price: '', category: 'rings', imageUrl: '', stock: 10 });
        setShowAddForm(false);
        loadData(); // Обновляем список
      } else {
        alert('Ошибка: ' + (data.error || 'Не удалось добавить товар'));
      }
    } catch (err) {
      console.error('Ошибка:', err);
      alert('Ошибка подключения к серверу');
    }
  };

  // 🗑️ УДАЛЕНИЕ ТОВАРА
  const deleteProduct = async (productId, productName) => {
    if (!window.confirm(`Удалить товар "${productName}"?`)) return;

    try {
      const response = await fetch(`${config.apiUrl}/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': ADMIN_KEY }
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Товар "${productName}" удален`);
        loadData();
      } else {
        alert('Ошибка удаления');
      }
    } catch (err) {
      console.error('Ошибка:', err);
      alert('Ошибка подключения к серверу');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Удалить пользователя навсегда?')) return;

    try {
      const res = await fetch(`${config.apiUrl}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': ADMIN_KEY }
      });

      const data = await res.json();

      if (data.success) {
        setUsers(prev => prev.filter(u => u._id !== userId));
        alert('Пользователь удалён');
      } else {
        alert(data.error || 'Ошибка удаления');
      }
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  // Рендер товаров с формой добавления
  const renderProducts = () => (
    <div className="products-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Товары ({products.length})</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          {showAddForm ? 'Отмена' : '+ Добавить товар'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={addProduct} className="add-product-form" style={{ margin: '20px 0', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Новый товар</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input
              type="text"
              placeholder="Название товара"
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
              required
              style={{ padding: '8px' }}
            />
            <input
              type="number"
              placeholder="Цена"
              value={newProduct.price}
              onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
              required
              style={{ padding: '8px' }}
            />
            <select
              value={newProduct.category}
              onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
              style={{ padding: '8px' }}
            >
              <option value="rings">Кольца</option>
              <option value="earrings">Серёжки</option>
              <option value="bracelets">Браслеты</option>
              <option value="necklaces">Ожерелья</option>
            </select>
            <input
              type="text"
              placeholder="URL картинки (например: /img/love.jpg)"
              value={newProduct.imageUrl}
              onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
              style={{ padding: '8px' }}
            />
            <input
              type="number"
              placeholder="Количество"
              value={newProduct.stock}
              onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
              style={{ padding: '8px' }}
            />
          </div>
          <button type="submit" style={{ marginTop: '10px', padding: '8px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Сохранить товар
          </button>
        </form>
      )}
      
      {products.length === 0 ? (
        <p>Нет товаров</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>Цена</th>
              <th>Категория</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td>{product.name}</td>
                <td>{product.price} ₽</td>
                <td>{product.category}</td>
                <td>
                  <button
                    className="btn-delete"
                    onClick={() => deleteProduct(product._id, product.name)}
                    style={{ background: '#ff4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // Остальные рендеры...
  const renderOrders = () => (
    <div className="orders-section">
      <h2>Заказы ({orders.length})</h2>
      {orders.length === 0 ? (
        <p>Нет заказов</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID заказа</th>
              <th>Пользователь</th>
              <th>Сумма</th>
              <th>Статус</th>
              <th>Дата</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td>{order.orderNumber || order._id?.slice(-8)}</td>
                <td>{order.userId?.email || order.email || '—'}</td>
                <td>{order.total?.toLocaleString()} ₽</td>
                <td>{order.status || 'pending'}</td>
                <td>{new Date(order.createdAt).toLocaleString('ru-RU')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="users-section">
      <h2>Пользователи ({users.length})</h2>
      {users.length === 0 ? (
        <p>Пользователей пока нет</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Имя</th>
              <th>Дата регистрации</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.email}</td>
                <td>{user.name || '—'}</td>
                <td>{user.createdAt ? new Date(user.createdAt).toLocaleString('ru-RU') : '—'}</td>
                <td>
                  <button
                    className="btn-delete"
                    onClick={() => deleteUser(user._id)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  if (!isAuth) {
    return (
      <div className="admin-login-page">
        <div className="login-card">
          <h2>Админ-панель</h2>
          <input
            type="email"
            placeholder="Email"
            value={loginEmail}
            onChange={e => setLoginEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={loginPassword}
            onChange={e => setLoginPassword(e.target.value)}
          />
          <button onClick={handleAdminLogin}>Войти</button>
          <p className="hint">admin@shop.ru / AdminStrong2026!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header>
        <h1>Админ-панель · Jewelry Shop</h1>
        <button className="logout-btn" onClick={() => {
          localStorage.removeItem('adminAuthKey');
          setIsAuth(false);
        }}>
          Выйти
        </button>
      </header>

      <div className="admin-tabs">
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
          👥 Пользователи
        </button>
        <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>
          💍 Товары
        </button>
        <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
          📦 Заказы
        </button>
      </div>

      {loading && <div className="loading">Загрузка...</div>}
      {error && <div className="error-message">{error}</div>}

      {activeTab === 'users' && renderUsers()}
      {activeTab === 'products' && renderProducts()}
      {activeTab === 'orders' && renderOrders()}
    </div>
  );
}

export default Admin;