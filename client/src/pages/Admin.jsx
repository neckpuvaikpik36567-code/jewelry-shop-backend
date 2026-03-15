import React, { useState, useEffect } from 'react';
import config from '../config'; // { apiUrl: 'http://localhost:5000' или ваш адрес }


function Admin() {
  const [isAuth, setIsAuth] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [activeTab, setActiveTab] = useState('products');

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const ADMIN_KEY = 'super-secret-admin-key-2026'; // поменяйте на свой

  // Проверка авторизации при загрузке
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

    const headers = {
      'x-admin-key': ADMIN_KEY
    };

    try {
      const [prodRes, orderRes, userRes] = await Promise.all([
        fetch(`${config.apiUrl}/api/admin/products`,   { headers }),
        fetch(`${config.apiUrl}/api/admin/orders`,     { headers }),
        fetch(`${config.apiUrl}/api/admin/users`,      { headers })
      ]);

      const prodData = await prodRes.json();
      const orderData = await orderRes.json();
      const userData = await userRes.json();

      if (prodData.success)  setProducts(prodData.data || []);
      if (orderData.success) setOrders(orderData.data || []);
      if (userData.success)  setUsers(userData.data || []);

    } catch (err) {
      setError('Ошибка загрузки данных: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = () => {
    // Простая проверка (в продакшене → JWT + bcrypt)
    if (loginEmail === 'admin@shop.ru' && loginPassword === 'AdminStrong2026!') {
      localStorage.setItem('adminAuthKey', ADMIN_KEY);
      setIsAuth(true);
      loadData();
    } else {
      alert('Неверный логин или пароль');
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

  // ────────────────────────────────────────────────
  // Рендер
  // ────────────────────────────────────────────────

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
        <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>
          Товары
        </button>
        <button className={activeTab === 'orders'   ? 'active' : ''} onClick={() => setActiveTab('orders')}>
          Заказы
        </button>
        <button className={activeTab === 'users'    ? 'active' : ''} onClick={() => setActiveTab('users')}>
          Пользователи
        </button>
      </div>

      {loading && <div className="loading">Загрузка...</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Вкладка Пользователи */}
      {activeTab === 'users' && (
        <div className="users-section">
          <h2>Пользователи ({users.length})</h2>

          {users.length === 0 ? (
            <p>Пользователей пока нет</p>
          ) : (
            <table className="admin-table users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Имя</th>
                  <th>Дата регистрации</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user._id.slice(-8)}</td>
                    <td>{user.email}</td>
                    <td>{user.name || '—'}</td>
                    <td>{new Date(user.createdAt).toLocaleString('ru-RU')}</td>
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
      )}

      {/* Вкладка Товары и Заказы — добавьте свои текущие реализации */}
      {activeTab === 'products' && <div>Ваша текущая реализация товаров...</div>}
      {activeTab === 'orders'   && <div>Ваша текущая реализация заказов...</div>}

    </div>
  );
}

export default Admin;