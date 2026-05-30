import React from "react";
import { Link } from "react-router-dom";
import "../style/Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-section">
            <h3>Навигация</h3>
            <ul>
              <li><Link to="/">Главная</Link></li>
              <li><Link to="/catalog">Каталог</Link></li>
              <li><Link to="/contact">Контакты</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Контакты</h3>
            <ul>
              <li>Телефон: <a href="tel:+79991234567">+7 (999) 123-45-67</a></li>
              <li>Email: <a href="mailto:neckpuvaikpik36567@gmail.com">neckpuvaikpik36567@gmail.com</a></li>
              <li>Адрес: г. Москва, ул. Примерная, д. 123</li>
            </ul>
          </div>
        </div>
        <div className="copyright">
          <p>© {new Date().getFullYear()} Феерия украшений. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;