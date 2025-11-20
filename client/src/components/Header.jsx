import { Link , useNavigate } from "react-router-dom";
import "../style/header.css";

function Header() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    navigate("/login");

  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Лого */}
        <div className="logo">
          <Link to="/">✨ Jewelry</Link>
        </div>

        {/* Навигация */}
        <nav className="nav-links">
          <Link to="/">Главная</Link>
          <Link to="/catalog">Каталог</Link>
        </nav>

        {/* Пользователь */}
        <div className="user-actions">
          {!isLoggedIn && (
            <>
              <Link to="/login" className="btn">Войти</Link>
              <Link to="/register" className="btn">Регистрация</Link>
            </>
          )}

          {isLoggedIn && (
            <>
              <Link to="/cart" className="btn">Корзина</Link>
              <Link to="/profile" className="btn">Профиль</Link>
              <button onClick={handleLogout} className="btn logout">
                Выйти
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
