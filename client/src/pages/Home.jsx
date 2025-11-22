import { Link } from "react-router-dom";
import "../style/home.css";
import heroImg from "../img/girl.png"; 

function Home() {
  return (
    <div className="home">
      <div className="home-container">
        {/* Текст слева */}
        <div className="home-text">
          <h1>Добро пожаловать в <span>JewelryShop</span></h1>
          <p>
            У нас вы найдёте изысканные кольца, браслеты и ожерелья,
            созданные для того, чтобы подчеркнуть вашу индивидуальность.
          </p>
                

          <Link to="/catalog" className="catalog-btn">
            Перейти в каталог
          </Link>
        </div>


        <div className="home-image">
          <img src={heroImg} alt="Девушка с украшениями" />
        </div>
      </div>
    </div>
  );
}

export default Home;
