import { useState } from "react";
import "./BookTable.css";

function BookTable({ onBack, cartItems = [] }) {
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    date: "",
    time: "",
    guests: "2",
    occasion: "",
    specialRequest: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const menuItems = cartItems
      .map((item) => `🍽 ${item.name} × ${item.qty} — ₹${item.price * item.qty}`)
      .join("\n");

    const subtotal = cartItems.reduce((total, item) => total + item.price * item.qty, 0);
    const packagingFee = cartItems.length > 0 ? 10 : 0;
    const total = subtotal + packagingFee;

    const menuSection = cartItems.length > 0
      ? `
🛒 *Pre-decided Menu*

${menuItems}

--------------------------------

Subtotal : ₹${subtotal}
Packaging Fee : ₹${packagingFee}

💰 *Estimated Total : ₹${total}*
`
      : "";

    const message = `
🪑 *TABLE BOOKING REQUEST*

👤 *Customer Details*

Name: ${formData.fullName}
Mobile: ${formData.mobile}

📅 *Booking Details*

Date: ${formData.date}
Time: ${formData.time}
Guests: ${formData.guests}
${formData.occasion ? `Occasion: ${formData.occasion}` : ""}
${formData.specialRequest ? `Special Request: ${formData.specialRequest}` : ""}
${menuSection}
`;

    const cafeNumber = "919691634045";
    const whatsappURL = `https://wa.me/${cafeNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, "_blank");
  };

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.qty, 0);
  const packagingFee = cartItems.length > 0 ? 10 : 0;
  const total = subtotal + packagingFee;

  return (
    <div className="booktable-page">
      <div className="booktable-card">

        <h2>Book a Table</h2>
        <p>Reserve your spot for a memorable dining experience</p>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              placeholder="Enter mobile number"
              value={formData.mobile}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Number of Guests</label>
            <select
              name="guests"
              value={formData.guests}
              onChange={handleChange}
              required
            >
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="3">3 Guests</option>
              <option value="4">4 Guests</option>
              <option value="5">5 Guests</option>
              <option value="6">6 Guests</option>
              <option value="8">8 Guests</option>
              <option value="10">10+ Guests</option>
            </select>
          </div>

          <div className="form-group">
            <label>Occasion <span className="optional">(optional)</span></label>
            <select
              name="occasion"
              value={formData.occasion}
              onChange={handleChange}
            >
              <option value="">Select an occasion</option>
              <option value="Birthday">Birthday</option>
              <option value="Anniversary">Anniversary</option>
              <option value="Date Night">Date Night</option>
              <option value="Business Meeting">Business Meeting</option>
              <option value="Family Gathering">Family Gathering</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Special Requests <span className="optional">(optional)</span></label>
            <textarea
              name="specialRequest"
              placeholder="Any special seating, decor, or food preferences..."
              rows={3}
              value={formData.specialRequest}
              onChange={handleChange}
            />
          </div>

          {/* Pre-decided Menu Summary */}
          {cartItems.length > 0 && (
            <div className="menu-preview">
              <h3>Your Pre-decided Menu</h3>
              {cartItems.map((item) => (
                <div className="menu-preview-item" key={item.id}>
                  <span>{item.name} × {item.qty}</span>
                  <span>₹{item.price * item.qty}</span>
                </div>
              ))}
              <hr />
              <div className="menu-preview-item">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="menu-preview-item">
                <span>Packaging Fee</span>
                <span>₹{packagingFee}</span>
              </div>
              <hr />
              <div className="menu-preview-item menu-preview-total">
                <span>Estimated Total</span>
                <strong>₹{total}</strong>
              </div>
            </div>
          )}

          <button type="submit" className="confirm-btn">
            Book Now
          </button>

          <button
            type="button"
            className="back-btn"
            onClick={onBack}
          >
            Back
          </button>

        </form>

      </div>
    </div>
  );
}

export default BookTable;
