import { useState } from "react";
import { Link } from "react-router-dom";
import "../style/login.css";
import config from "../config";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("📱 Отправка запроса на вход...");
      
      const response = await fetch(`${config.apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      console.log("📊 Статус ответа:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Ответ сервера:", data);

      if (data.success) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("currentUser", email);
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.user.id);
        
        alert("🎉 Вход выполнен успешно!");
        window.location.href = "/";
      } else {
        alert(data.message || "Неверный email или пароль");
      }
    } catch (error) {
      console.error("❌ Ошибка подключения:", error);
      
      if (error.message.includes("Failed to fetch")) {
        alert("📡 Не удалось подключиться к серверу. Проверьте интернет-соединение.");
      } else if (error.message.includes("HTTP error")) {
        alert("⚡ Ошибка сервера. Попробуйте позже.");
      } else {
        alert("❌ Ошибка: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Вход</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "⏳ Вход..." : "Войти"}
          </button>
        </form>
        <p>
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;