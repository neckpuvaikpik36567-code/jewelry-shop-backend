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

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("📱 Отправка регистрации...");
      
      const response = await fetch(`${config.apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      console.log("📊 Статус регистрации:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Ответ регистрации:", data);

      if (data.success) {
        alert("🎉 Регистрация прошла успешно!");
        navigate("/login");
      } else {
        throw new Error(data.message || "Ошибка регистрации");
      }
    } catch (error) {
      console.error("❌ Ошибка:", error);
      
      if (error.message.includes("Failed to fetch")) {
        alert("📡 Не удалось подключиться к серверу. Проверьте интернет-соединение.");
      } else {
        alert("❌ Ошибка регистрации: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleRegister} className="register-form">
        <h1>Регистрация</h1>
        
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
          placeholder="Ваш пароль"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={loading}
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