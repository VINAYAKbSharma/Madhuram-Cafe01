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
  const MIN_ORDER_AMOUNT = 200;
  const subtotal = cartItems.reduce((total, item) => total + item.price * item.qty, 0);
  const discount = couponApplied ? Math.round(subtotal * 0.2) : 0;
  const discountedSubtotal = subtotal - discount;
  const delivery = subtotal === 0 ? 0 : (subtotal > 499 ? 0 : 20);
  const packagingFee = subtotal > 0 ? 10 : 0;
  const total = discountedSubtotal + delivery + packagingFee;
  const isMinOrderMet = subtotal >= MIN_ORDER_AMOUNT || subtotal === 0;
  const minOrderDifference = MIN_ORDER_AMOUNT - subtotal;

  const handleCheckoutClick = () => {
    if (cartItems.length > 0 && subtotal < MIN_ORDER_AMOUNT) {
      alert(`Minimum order amount is ₹${MIN_ORDER_AMOUNT}. Please add ₹${minOrderDifference} more worth of items.`);
      return;
    }
    onCheckout();
  };

  const handleBookTableClick = () => {
    if (cartItems.length > 0 && subtotal < MIN_ORDER_AMOUNT) {
      alert(`Minimum order amount is ₹${MIN_ORDER_AMOUNT}. Please add ₹${minOrderDifference} more worth of items.`);
      return;
    }
    onBookTable();
  };

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
            <span>Delivery Fee</span>
            <b>{delivery === 0 ? "FREE" : `₹${delivery}`}</b>
          </div>
          <div>
            <span>Packaging Fee</span>
            <b>₹{packagingFee}</b>
          </div>
          <hr />
          <div className="cart-drawer__grand">
            <span>Total</span>
            <b>₹{total}</b>
          </div>

          {!isMinOrderMet && cartItems.length > 0 && (
            <div
              className="min-order-warning"
              style={{
                color: "#ff4d4d",
                fontSize: "13px",
                marginTop: "10px",
                textAlign: "center",
                fontWeight: "500",
              }}
            >
              ⚠️ Minimum order amount is ₹{MIN_ORDER_AMOUNT} (Add ₹{minOrderDifference} more)
            </div>
          )}

          <div className="cart-drawer__actions">
            <button className="cart-drawer__checkout cart-drawer__button--primary" type="button" onClick={handleBookTableClick}>
              Book a Table
            </button>
            <button className="cart-drawer__checkout cart-drawer__button--secondary" type="button" onClick={handleCheckoutClick}>
              Home Delivery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;
