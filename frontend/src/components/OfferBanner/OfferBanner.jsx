import "./OfferBanner.css";
import {
  FaMotorcycle,
  FaGift
} from "react-icons/fa";

function OfferBanner() {

  return (

    <section className="offer-banner">

      <div className="offer-overlay"></div>

      <div className="offer-content">

        <span className="offer-tag">

          <FaGift />

          Limited Time Offer

        </span>

        <h2>

          Get Flat

          <span>20% OFF</span>

        </h2>

        <h3>

          On Orders Above ₹499

        </h3>

        <div className="coupon">
          Coupon Code: <strong>SAME</strong>
        </div>

        <div className="offer-features">

          <div>

            <FaMotorcycle />

            Free Home Delivery

          </div>

          <div>

            Freshly Prepared

          </div>

          <div>

            Fast Delivery

          </div>

        </div>

        <div className="offer-buttons">

          <button>

            Order Now

          </button>

          <button className="outline">

            View Menu

          </button>

        </div>

      </div>

    </section>

  );
}

export default OfferBanner;