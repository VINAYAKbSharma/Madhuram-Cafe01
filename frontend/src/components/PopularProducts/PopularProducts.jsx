import "./PopularProducts.css";
import products from "./ProductData";

import {
  FaStar,
  FaHeart,
  FaShoppingCart,
  FaClock
} from "react-icons/fa";

function PopularProducts({ onAddToCart }) {
  return (
    <section id="offers" className="popular">

      <div className="popular-header">

        <div>
          <h5>Fresh & Delicious</h5>
          <h2>Popular Dishes</h2>
        </div>

        

      </div>

      <div className="product-grid">

        {products.map((item) => (

          <div className="product-card" key={item.id}>
<span className="product-offer">{item.offer}</span>
         

            <button className="wishlist">
              <FaHeart />
            </button>

            <img
              src={item.image}
              alt={item.name}
            />

            <div className="product-info">

              <div className="rating">

                <span>
                  <FaStar />
                  {item.rating}
                </span>

                <span>
                  <FaClock />
                  {item.time}
                </span>

              </div>

              <h3>{item.name}</h3>

              <div className="bottom">

                <h2>₹{item.price}</h2>

                <button type="button" onClick={() => onAddToCart(item)}>

                  <FaShoppingCart />

                  Add

                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}

export default PopularProducts;