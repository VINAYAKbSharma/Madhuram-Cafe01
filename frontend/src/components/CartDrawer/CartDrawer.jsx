import "./CartDrawer.css";
import { FaTimes, FaTrash, FaPlus, FaMinus } from "react-icons/fa";

function CartDrawer({
  onClose,
  cartItems,
  onQuantityChange,
  onDelete,
  couponCode,
  setCouponCode,
  onApplyCoupon,
  couponApplied,
  couponMessage,
  onCheckout,
  onBookTable,
  onHomeDelivery
}) {
  const subtotal = cartItems.reduce((total, item) => total + item.price * item.qty, 0);
  const discount = couponApplied ? Math.round(subtotal * 0.2) : 0;
  const discountedSubtotal = subtotal - discount;
  const gst = Math.round(discountedSubtotal * 0.05);
  const delivery = subtotal > 499 ? 0 : 49;
  const total = discountedSubtotal + gst + delivery;

  return (
    <div className="cart-overlay cart-overlay--visible" onClick={onClose}>
      <div className="cart-drawer cart-drawer--open" onClick={(e) => e.stopPropagation()}>
        <div className="cart-drawer__header">
          <h2>Your Cart</h2>
          <button type="button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="cart-drawer__body">
          {cartItems.length === 0 ? (
            <p className="empty-cart">Your cart is empty.</p>
          ) : (
            cartItems.map((item) => (
              <div className="cart-drawer__item" key={item.id}>
                <img src={item.image} alt={item.name} />
                <div className="cart-drawer__info">
                  <h4>{item.name}</h4>
                  <p>₹{item.price}</p>
                  <div className="qty">
                    <button type="button" onClick={() => onQuantityChange(item.id, -1)}>
                      <FaMinus />
                    </button>
                    <span>{item.qty}</span>
                    <button type="button" onClick={() => onQuantityChange(item.id, 1)}>
                      <FaPlus />
                    </button>
                  </div>
                </div>
                <button className="cart-drawer__delete" type="button" onClick={() => onDelete(item.id)}>
                  <FaTrash />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="cart-drawer__coupon-box">
          <input
            type="text"
            placeholder="Coupon Code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
          <button type="button" onClick={onApplyCoupon}>
            Apply
          </button>
        </div>

        {couponMessage && <p className="coupon-message">{couponMessage}</p>}

        <div className="cart-drawer__summary">
          <div>
            <span>Subtotal</span>
            <b>₹{subtotal}</b>
          </div>
          {couponApplied && (
            <div>
              <span>Discount</span>
              <b>-₹{discount}</b>
            </div>
          )}
          <div>
            <span>GST</span>
            <b>₹{gst}</b>
          </div>
          <div>
            <span>Delivery</span>
            <b>₹{delivery}</b>
          </div>
          <hr />
          <div className="cart-drawer__grand">
            <span>Total</span>
            <b>₹{total}</b>
          </div>
          <div className="cart-drawer__actions">
            <button className="cart-drawer__checkout cart-drawer__button--primary" type="button" onClick={onBookTable}>
              Book a Table
            </button>
            <button className="cart-drawer__checkout cart-drawer__button--secondary" type="button" onClick={onCheckout}>
              Home Delivery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;
