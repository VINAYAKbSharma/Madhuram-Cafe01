import { useState } from "react";
import "./Checkout.css";
import upiQrImage from "../../assets/upi_qr.jpg";

function Checkout({ onBack, cartItems, onPlaceOrder, currentUser }) {
  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || "",
    mobile: currentUser?.mobile || "",
    house: "",
    street: "",
    landmark: "",
    city: "",
    pincode: "",
    payment: "Cash on Delivery",
  });

  const [transactionId, setTransactionId] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);

  const UPI_ID = "9691634045@ptaxis";
  const PAYEE_NAME = "Roopendra Singh Parihar";

  const MIN_ORDER_AMOUNT = 200;

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );

  const deliveryCharge = subtotal > 499 ? 0 : 20;
  const packagingFee = subtotal > 0 ? 10 : 0;

  const total = subtotal + deliveryCharge + packagingFee;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCopyUpi = () => {
    try {
      navigator.clipboard.writeText(UPI_ID);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    } catch {
      alert(`UPI ID: ${UPI_ID}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (subtotal < MIN_ORDER_AMOUNT) {
      alert(`Minimum order amount is ₹${MIN_ORDER_AMOUNT}. Please add ₹${MIN_ORDER_AMOUNT - subtotal} more worth of items.`);
      return;
    }

    const orderItems = cartItems
      .map(
        (item) =>
          `🍽 ${item.name}\nQty: ${item.qty}\nPrice: ₹${item.price * item.qty}`
      )
      .join("\n\n");

    const utrSection = transactionId.trim()
      ? `\n🔖 *Transaction ID / UTR*: ${transactionId.trim()}`
      : "";

    const upiNote = formData.payment.includes("UPI")
      ? `\n\n📌 *Note*: If paid via QR/UPI, please attach your payment screenshot here after sending!`
      : "";

    const message = `
🍽 *NEW FOOD ORDER*

👤 *Customer Details*

Name: ${formData.fullName}
Mobile: ${formData.mobile}

📍 *Delivery Address*

House: ${formData.house}
Street: ${formData.street}
Landmark: ${formData.landmark}
City: ${formData.city}
Pincode: ${formData.pincode}

--------------------------------

🛒 *Order Details*

${orderItems}

--------------------------------

Subtotal : ₹${subtotal}
Delivery : ${deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
Packaging Fee : ₹${packagingFee}

💰 *Grand Total : ₹${total}*

💳 Payment : ${formData.payment}${utrSection}${upiNote}
`;

    const cafeNumber = "919691634045"; // India country code + number

    const whatsappURL = `https://wa.me/${cafeNumber}?text=${encodeURIComponent(message)}`;

    const newOrder = {
      id: Math.floor(100000 + Math.random() * 900000).toString(),
      date: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        image: item.image,
      })),
      subtotal,
      deliveryCharge,
      packagingFee,
      total,
      payment: formData.payment,
      transactionId: transactionId.trim() || null,
      address: `${formData.house}, ${formData.street}, ${formData.landmark ? formData.landmark + ", " : ""}${formData.city} - ${formData.pincode}`,
      customer: {
        fullName: formData.fullName,
        mobile: formData.mobile,
      },
      status: "Pending",
      deliveryMessage: "Pending Admin Confirmation",
    };

    try {
      window.dispatchEvent(new CustomEvent("madhuram_new_order", { detail: newOrder }));
    } catch {
      // ignore
    }

    if (onPlaceOrder) {
      onPlaceOrder(newOrder, whatsappURL);
    } else {
      window.open(whatsappURL, "_blank");
    }
  };
  return (
    <div className="checkout-page">
      <div className="checkout-card">

        <h2>Checkout</h2>
        <p>Please enter your delivery details</p>

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

          <div className="form-group">
            <label>House / Flat No.</label>
            <input
              type="text"
              name="house"
              placeholder="House / Flat No."
              value={formData.house}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Street / Area</label>
            <input
              type="text"
              name="street"
              placeholder="Street / Area"
              value={formData.street}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Landmark</label>
            <input
              type="text"
              name="landmark"
              placeholder="Nearby Landmark"
              value={formData.landmark}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Pincode</label>
            <input
              type="text"
              name="pincode"
              placeholder="Pincode"
              value={formData.pincode}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Payment Method</label>

            <div className="payment-options">

              <label>
                <input
                  type="radio"
                  name="payment"
                  value="Cash on Delivery"
                  checked={formData.payment === "Cash on Delivery"}
                  onChange={handleChange}
                />
                Cash on Delivery
              </label>

              <label>
                <input
                  type="radio"
                  name="payment"
                  value="UPI on Delivery"
                  checked={formData.payment === "UPI on Delivery"}
                  onChange={handleChange}
                />
                UPI on Delivery
              </label>

              <label>
                <input
                  type="radio"
                  name="payment"
                  value="Pay via UPI (Scan & Pay)"
                  checked={formData.payment === "Pay via UPI (Scan & Pay)"}
                  onChange={handleChange}
                />
                Pay via UPI (Scan & Pay)
              </label>

            </div>

            {formData.payment === "Pay via UPI (Scan & Pay)" && (
              <div className="upi-payment-box">
                <div className="upi-header">
                  <h4>Scan & Pay with any UPI App</h4>
                  <p>Payee: <strong>{PAYEE_NAME}</strong></p>
                </div>

                <div className="upi-qr-container">
                  <img src={upiQrImage} alt="Madhuram Cafe UPI QR Code" className="upi-qr-img" />
                </div>

                <div className="upi-id-box">
                  <span className="upi-id-text">UPI ID: <strong>{UPI_ID}</strong></span>
                  <button type="button" className="copy-upi-btn" onClick={handleCopyUpi}>
                    {copiedUpi ? "Copied! ✓" : "Copy"}
                  </button>
                </div>

                <div className="upi-app-link">
                  <a
                    href={`upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${total}&cu=INR&tn=${encodeURIComponent("Madhuram Cafe Order")}`}
                    className="upi-app-btn"
                  >
                    ⚡ Open UPI App (GPay / PhonePe / Paytm)
                  </a>
                </div>

                <div className="form-group transaction-id-group">
                  <label>UPI Transaction ID / UTR <span className="optional">(Optional)</span></label>
                  <input
                    type="text"
                    placeholder="Enter 12-digit UTR / Ref No. after payment"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
<hr />

<h3>Order Summary</h3>

<div className="order-summary">

  {cartItems.map((item) => (
    <div className="summary-item" key={item.id}>
      <span>
        {item.name} × {item.qty}
      </span>

      <span>
        ₹{item.price * item.qty}
      </span>
    </div>
  ))}

  <hr />

  <div className="summary-item">
    <span>Subtotal</span>
    <strong>₹{subtotal}</strong>
  </div>

  <div className="summary-item">
    <span>Delivery Fee</span>
    <strong>
      {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
    </strong>
  </div>

  <div className="summary-item">
    <span>Packaging Fee</span>
    <strong>₹{packagingFee}</strong>
  </div>

  <hr />

  <div className="summary-item total">
    <span>Total</span>
    <strong>₹{total}</strong>
  </div>

</div>
          <button type="submit" className="confirm-btn">
            Continue
          </button>

          <button
            type="button"
            className="confirm-btn"
            style={{ marginTop: "10px", background: "#555" }}
            onClick={onBack}
          >
            Back
          </button>

        </form>

      </div>
    </div>
  );
}

export default Checkout;