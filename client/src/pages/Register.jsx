import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../style/register.css"; // Добавьте эту строку

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Успех:", data);
      alert("Регистрация прошла успешно!");
      // После успешной регистрации переходим на страницу входа
      navigate("/login");
    } catch (error) {
      console.error("Ошибка:", error);
      alert("Ошибка регистрации: " + error.message);
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
        />

        <label>Email:</label>
        <input
          type="email"
          name="email"
          placeholder="Ваш email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label>Пароль:</label>
        <input
          type="password"
          name="password"
          placeholder="Ваш пароль"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit" className="btn-primary">
          Зарегистрироваться
        </button>

        <div className="auth-link">
          <p>Уже есть аккаунт? <Link to="/login">Войти</Link></p>
        </div>
      </form>
    </div>
  );
};

export default Register;