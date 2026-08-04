import "./CategoryCard.css";
import categoryData from "./categoryData";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";

function Categories({ onViewAll, onBackHome, showBackHome }) {
  return (
    <section id="menu" className="categories">

      <div className="section-title">

        <div>

          <h5>Browse Menu</h5>

          <h2>Popular Categories</h2>

        </div>

        <div className="section-actions">
          {showBackHome ? (
            <button className="back-home" onClick={() => onBackHome && onBackHome()}>
              <FaArrowLeft />
              Home
            </button>
          ) : null}

          <button onClick={() => onViewAll && onViewAll()}>
            View All
            <FaArrowRight />
          </button>
        </div>

      </div>

      <div className="category-grid">

        {categoryData.map((item) => (

          <div
            className="category-card"
            key={item.id}
            onClick={() => typeof onViewAll === "function" && onViewAll(item.name)}
            role="button"
          >

            <div className="category-image">

              <img src={item.image} alt={item.name} />

            </div>

            <h3>{item.name}</h3>

            <p>{item.items}</p>

          </div>

        ))}

      </div>

    </section>
  );
}

export default Categories;