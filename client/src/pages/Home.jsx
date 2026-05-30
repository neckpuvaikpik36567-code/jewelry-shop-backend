import { Link } from "react-router-dom";
import { useState } from "react";

import "../style/home.css";

import heroImg from "../img/girl.png";

import bracelet1 from "../img/brasletclassika.jpg";
import bracelet2 from "../img/brasletelegat.jpg";
import bracelet3 from "../img/brasletkapla.jpg";

import elegant from "../img/elegant.jpg";
import flower from "../img/flower.jpg";
import love from "../img/love.jpg";

function Home() {
  const products = [
    {
      id: 1,
      name: "Классический браслет",
      price: "12 500 ₽",
      image: bracelet1,
    },
    {
      id: 2,
      name: "Элегантный браслет",
      price: "8 900 ₽",
      image: bracelet2,
    },
    {
      id: 3,
      name: "Браслет Капля",
      price: "15 300 ₽",
      image: bracelet3,
    },
    {
      id: 4,
      name: "Элегантное кольцо",
      price: "18 200 ₽",
      image: elegant,
    },
    {
      id: 5,
      name: "Цветочное украшение",
      price: "10 700 ₽",
      image: flower,
    },
    {
      id: 6,
      name: "Love Collection",
      price: "21 400 ₽",
      image: love,
    },
  ];

  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    if (current < products.length - 3) {
      setCurrent(current + 1);
    }
  };

  const prevSlide = () => {
    if (current > 0) {
      setCurrent(current - 1);
    }
  };

  return (
    <div className="home">

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="home-container">

          <div className="home-text">
            <h1>
              Добро пожаловать в <span>Феерия украшений</span>
            </h1>

            <p>
              Откройте для себя коллекции украшений,
              созданные для того, чтобы подчеркнуть
              красоту, стиль и индивидуальность.
            </p>

            <div className="hero-buttons">
              <Link to="/catalog" className="catalog-btn">
                Перейти в каталог
              </Link>

              <Link to="/contact" className="about-btn">
                Связаться с нами
              </Link>
            </div>
          </div>

          <div className="home-image">
            <img src={heroImg} alt="Украшения" />
          </div>

        </div>
      </section>

      {/* ПРЕИМУЩЕСТВА */}
      <section className="advantages">

        <div className="adv-card">
          <h3>✨ Уникальный дизайн</h3>
          <p>
            Каждое украшение создано с вниманием
            к деталям и современным тенденциям.
          </p>
        </div>

        <div className="adv-card">
          <h3>💎 Премиальные материалы</h3>
          <p>
            Используем только качественные металлы
            и драгоценные камни.
          </p>
        </div>

        <div className="adv-card">
          <h3>🎁 Идеальный подарок</h3>
          <p>
            Украшения для особенных моментов
            и незабываемых эмоций.
          </p>
        </div>

      </section>

      {/* КАРУСЕЛЬ */}
      <section className="carousel">
        <div className="section-top">
          <h2>Популярные товары</h2>

          <div className="carousel-controls">
            <button onClick={prevSlide}>◀</button>
            <button onClick={nextSlide}>▶</button>
          </div>
        </div>

        <div className="carousel-wrapper">

          {products.slice(current, current + 3).map((product) => (
            <div className="carousel-card" key={product.id}>

              <img
                src={product.image}
                alt={product.name}
              />

              <h3>{product.name}</h3>

              <p>{product.price}</p>

              <Link
                to="/catalog"
                className="catalog-btn"
              >
                Купить
              </Link>

            </div>
          ))}

        </div>
      </section>

      {/* БАННЕР */}
      <section className="banner">
        <div className="banner-content">
          <h2>Новая коллекция 2026</h2>

          <p>
            Современные украшения, вдохновлённые
            минимализмом и элегантностью.
          </p>

          <Link to="/catalog" className="catalog-btn">
            Смотреть коллекцию
          </Link>
        </div>
      </section>

    </div>
  );
}

export default Home;