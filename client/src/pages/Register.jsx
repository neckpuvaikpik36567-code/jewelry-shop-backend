import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../style/register.css";
import config from "../config";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Очищаем ошибку при изменении поля
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Валидация
    if (!formData.name || !formData.email || !formData.password) {
      setError("Все поля обязательны для заполнения");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Пароль должен быть не менее 6 символов");
      setLoading(false);
      return;
    }

    try {
      console.log("📱 Отправка регистрации...", formData);
      
      const response = await fetch(`${config.apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("📊 Статус регистрации:", response.status);

      const data = await response.json();
      console.log("📨 Ответ сервера:", data);

      if (response.ok && data.success) {
        alert("🎉 Регистрация прошла успешно!");
        navigate("/login");
      } else {
        // Показываем сообщение об ошибке от сервера
        setError(data.message || "Ошибка регистрации");
      }
    } catch (error) {
      console.error("❌ Ошибка:", error);
      setError("Ошибка подключения к серверу");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleRegister} className="register-form">
        <h1>Регистрация</h1>
        
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}
        
        <label>Имя:</label>
        <input
          type="text"
          name="name"
          placeholder="Ваше имя"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={loading}
        />

        <label>Email:</label>
        <input
          type="email"
          name="email"
          placeholder="Ваш email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={loading}
        />

        <label>Пароль:</label>
        <input
          type="password"
          name="password"
          placeholder="Ваш пароль (минимум 6 символов)"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={loading}
          minLength="6"
        />

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "⏳ Регистрация..." : "Зарегистрироваться"}
        </button>

        <div className="auth-link">
          <p>Уже есть аккаунт? <Link to="/login">Войти</Link></p>
        </div>
      </form>
    </div>
  );
};

export default Register;