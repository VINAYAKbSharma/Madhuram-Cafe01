import { FaClock, FaWhatsapp, FaMapMarkerAlt, FaShoppingBag, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import "./Orders.css";

function Orders({ orders = [], onBackHome, onBrowseMenu, user }) {
  return (
    <div className="orders-section">
      <div className="orders-container">
        {/* Header */}
        <div className="orders-header">
          <button type="button" className="back-nav-btn" onClick={onBackHome}>
            <FaArrowLeft /> Back
          </button>
          <h2>My Orders</h2>
          {user && (
            <span className="user-badge">
              👤 {user.fullName || user.mobile}
            </span>
          )}
        </div>

        {/* Orders list or empty state */}
        {orders.length === 0 ? (
          <div className="empty-orders-card">
            <div className="empty-icon">
              <FaShoppingBag />
            </div>
            <h3>No Orders Yet!</h3>
            <p>
              You haven't placed any food orders yet. Explore our menu and place
              your order via WhatsApp!
            </p>
            <button
              type="button"
              className="browse-menu-btn"
              onClick={onBrowseMenu}
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div className="order-card" key={order.id}>
                {/* Order Top Bar */}
                <div className="order-card-header">
                  <div>
                    <span className="order-id">Order #{order.id}</span>
                    <span className="order-date">{order.date}</span>
                  </div>
                  <span className={`status-pill ${order.status === "Delivered" ? "status-delivered" : ""}`}>
                    <FaCheckCircle /> {order.status || "Confirmed"}
                  </span>
                </div>

                {/* Delivery Time Estimate Box */}
                {order.status === "Delivered" ? (
                  <div className="delivery-banner delivered-banner">
                    <FaCheckCircle className="clock-icon delivered-icon" />
                    <div className="delivery-text">
                      <span className="delivery-title">Order Status</span>
                      <span className="delivery-time delivered-text">Order Delivered Successfully!</span>
                    </div>
                  </div>
                ) : (
                  <div className="delivery-banner">
                    <FaClock className="clock-icon" />
                    <div className="delivery-text">
                      <span className="delivery-title">Estimated Delivery</span>
                      <span className="delivery-time">Deliver in 15 to 20 minute</span>
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div className="order-items-list">
                  {order.items &&
                    order.items.map((item, idx) => (
                      <div className="order-item-row" key={idx}>
                        <div className="item-info">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="item-thumb"
                            />
                          )}
                          <div>
                            <span className="item-name">{item.name}</span>
                            <span className="item-qty">Qty: {item.qty}</span>
                          </div>
                        </div>
                        <span className="item-price">
                          ₹{item.price * item.qty}
                        </span>
                      </div>
                    ))}
                </div>

                <hr className="order-divider" />

                {/* Address & Payment Info */}
                <div className="order-details-grid">
                  <div className="detail-col">
                    <div className="detail-label">
                      <FaMapMarkerAlt /> Delivery Address
                    </div>
                    <p className="detail-value">{order.address}</p>
                  </div>
                  <div className="detail-col">
                    <div className="detail-label">Payment Method</div>
                    <p className="detail-value">
                      {order.payment || "Cash on Delivery"}
                    </p>
                  </div>
                </div>

                <hr className="order-divider" />

                {/* Footer / Total */}
                <div className="order-card-footer">
                  <div className="total-box">
                    <span>Total Amount</span>
                    <strong>₹{order.total}</strong>
                  </div>
                  <a
                    href={`https://wa.me/919691634045?text=${encodeURIComponent(
                      `Hi Madhuram Cafe, checking status for Order #${order.id}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whatsapp-support-btn"
                  >
                    <FaWhatsapp /> Track on WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
