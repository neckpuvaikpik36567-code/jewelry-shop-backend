// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../style/Footer.css'; // Note: "style" is singular, matching your import

const Footer = () => {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-section">
            <h2>Jewelry</h2>
            <p> Мы создаем красоту.</p>
          </div>
          <div className="footer-section">
            <h3>Навигация</h3>
            <ul>
              <li><Link to="/">Главная</Link></li>
              <li><Link to="/catalog">Каталог</Link></li>
              <li><Link to="/contact">Контакты</Link></li> {/* Fixed typo: /contackt → /contact */}
            </ul>
          </div>
          <div className="footer-section">
            <h3>Контакты</h3>
            <ul>
              <li>Телефон: <a href="tel:+79991234567">+7 (999) 123-45-67</a></li>
              <li>Email: <a href="mailto:info@vashsite.ru">neckpuvaikpik36567@gmail.com</a></li>
              <li>Адрес: г. Москва, ул. Примерная, д. 123</li>
            </ul>
          </div>
        </div>
        <div className="copyright">
          <p>&copy; {new Date().getFullYear()} Jewelry. Все права защищены.</p> {/* Updated to match branding */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;