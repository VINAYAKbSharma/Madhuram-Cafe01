import { useState } from "react";
import "./Checkout.css";
import { API_BASE_URL } from "../../config/api";
import { loadRazorpayScript } from "../../utils/loadRazorpay";

function Checkout({ onBack, cartItems, onPlaceOrder, currentUser }) {
  const savedAddr = currentUser?.address || {};

  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || "",
    mobile: currentUser?.mobile || "",
    house: savedAddr.house || "",
    street: savedAddr.street || "",
    landmark: savedAddr.landmark || "",
    city: savedAddr.city || "",
    pincode: savedAddr.pincode || "",
    payment: "COD",
  });

  const [isEditingAddress, setIsEditingAddress] = useState(
    !savedAddr.house && !savedAddr.street
  );
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const MIN_ORDER_AMOUNT = 200;

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );

  const deliveryCharge = subtotal === 0 ? 0 : 20;
  const platformFee = subtotal > 0 ? 20 : 0;
  const total = subtotal + deliveryCharge + platformFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formattedAddressText = [
    formData.house,
    formData.street,
    formData.landmark ? `(Near ${formData.landmark})` : "",
    formData.city,
    formData.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (subtotal < MIN_ORDER_AMOUNT) {
      alert(
        `Minimum order amount is ₹${MIN_ORDER_AMOUNT}. Please add ₹${
          MIN_ORDER_AMOUNT - subtotal
        } more worth of items.`
      );
      return;
    }

    if (!formData.fullName || !formData.mobile || (!formData.house && !formData.street)) {
      alert("Please provide your delivery address details before proceeding.");
      setIsEditingAddress(true);
      return;
    }

    setIsProcessingPayment(true);
    const targetId = Math.floor(100000 + Math.random() * 900000).toString();

    const orderItems = cartItems
      .map(
        (item) =>
          `🍽 ${item.name}\nQty: ${item.qty}\nPrice: ₹${item.price * item.qty}`
      )
      .join("\n\n");

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
Delivery : ₹${deliveryCharge}
Platform & Packaging Fee : ₹${platformFee}

💰 *Grand Total : ₹${total}*

💳 Payment Method : Razorpay Gateway
`;

    const senderNumber = "919713330116";
    const clientNumber = "919691634045";
    const whatsappURL = `https://wa.me/${senderNumber}?text=${encodeURIComponent(
      message
    )}`;
    const whatsappClientURL = `https://wa.me/${clientNumber}?text=${encodeURIComponent(
      message
    )}`;

    // If Cash on Delivery / Test Order is selected, place order immediately without online payment
    if (formData.payment === "COD") {
      const confirmedOrder = {
        id: targetId,
        orderId: targetId,
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
        platformFee,
        total,
        address: formattedAddressText,
        customer: {
          fullName: formData.fullName,
          mobile: formData.mobile,
        },
        userMobile: formData.mobile,
        status: "Pending",
        deliveryMessage: "Pending Admin Confirmation",
        payment: "Cash on Delivery (Test Order)",
        transactionId: `COD_TEST_${targetId}`,
        paymentStatus: "Pending",
      };

      try {
        window.dispatchEvent(
          new CustomEvent("madhuram_new_order", { detail: confirmedOrder })
        );
      } catch (e) {}

      if (onPlaceOrder) {
        await onPlaceOrder(confirmedOrder, whatsappURL, whatsappClientURL);
      } else {
        window.open(whatsappURL, "_blank");
        if (whatsappClientURL) window.open(whatsappClientURL, "_blank");
      }
      setIsProcessingPayment(false);
      return;
    }

    // 1. Load Razorpay SDK script dynamically
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      alert("Failed to load Razorpay SDK. Please check your internet connection.");
      setIsProcessingPayment(false);
      return;
    }

    // 2. Create Razorpay order via backend endpoint
    let rzpOrderData = null;
    try {
      const res = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          receipt: `rcpt_${targetId}`,
        }),
      });

      rzpOrderData = await res.json();
      if (!rzpOrderData.success) {
        throw new Error(rzpOrderData.message || "Could not initialize payment order");
      }
    } catch (err) {
      console.error("Order Creation Error:", err);
      alert(`Payment Initialization Failed: ${err.message}`);
      setIsProcessingPayment(false);
      return;
    }

    // 3. Open Razorpay modal with locked amount & order_id
    const options = {
      key: rzpOrderData.key || "rzp_live_TZZBu3G1koYPd6",
      amount: rzpOrderData.amount, // in paise (e.g. ₹340 -> 34000 paise)
      currency: rzpOrderData.currency || "INR",
      name: "Madhuram Cafe",
      description: `Food Order #${targetId} - ₹${total}`,
      image: "https://cdn-icons-png.flaticon.com/512/3081/3081559.png",
      order_id: rzpOrderData.order_id || rzpOrderData.order?.id,
      handler: async function (response) {
        // Payment successful - verify payment signature on backend
        try {
          const verifyRes = await fetch(`${API_BASE_URL}/api/payment/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();

          if (!verifyData.success) {
            alert("Payment signature verification failed! Order not placed.");
            setIsProcessingPayment(false);
            return;
          }

          // Payment verified successfully! Create and list the order
          const confirmedOrder = {
            id: targetId,
            orderId: targetId,
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
            platformFee,
            total,
            address: formattedAddressText,
            customer: {
              fullName: formData.fullName,
              mobile: formData.mobile,
            },
            userMobile: formData.mobile,
            status: "Pending",
            deliveryMessage: "Pending Admin Confirmation",
            payment: "Razorpay Gateway",
            transactionId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            paymentStatus: "Paid",
          };

          // Dispatch custom event locally
          try {
            window.dispatchEvent(
              new CustomEvent("madhuram_new_order", { detail: confirmedOrder })
            );
          } catch (e) {}

          // Place order and navigate to Orders
          if (onPlaceOrder) {
            await onPlaceOrder(confirmedOrder, whatsappURL, whatsappClientURL);
          } else {
            window.open(whatsappURL, "_blank");
            if (whatsappClientURL) window.open(whatsappClientURL, "_blank");
          }
        } catch (vErr) {
          console.error("Verification Error:", vErr);
          alert("Error verifying payment. Please contact cafe support.");
        } finally {
          setIsProcessingPayment(false);
        }
      },
      prefill: {
        name: formData.fullName,
        contact: formData.mobile,
      },
      theme: {
        color: "#e63946",
      },
      modal: {
        ondismiss: function () {
          setIsProcessingPayment(false);
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        alert(`Payment Failed: ${response.error?.description || "Transaction failed"}`);
        setIsProcessingPayment(false);
      });
      rzp.open();
    } catch (err) {
      console.error("Razorpay Modal Error:", err);
      alert("Failed to open Razorpay checkout modal.");
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-card">
        <h2>Checkout</h2>
        <p>Review delivery address and complete payment</p>

        <form onSubmit={handleSubmit}>
          {/* Customer Summary & Delivery Address Card */}
          <div className="delivery-address-card" style={{ background: "#f8fafc", border: "2px solid #e2e8f0", borderRadius: "12px", padding: "16px", marginBottom: "20px", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", color: "#1e293b" }}>
                📍 Delivery Address
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingAddress(!isEditingAddress)}
                style={{
                  background: "transparent",
                  color: "#e63946",
                  border: "1px solid #e63946",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                {isEditingAddress ? "Done" : "✏️ Change Address"}
              </button>
            </div>

            <div style={{ fontSize: "14px", color: "#475569", lineHeight: "1.6" }}>
              <p style={{ margin: "0 0 4px 0", fontWeight: "700", color: "#0f172a" }}>
                👤 {formData.fullName || "Valued Customer"} ({formData.mobile})
              </p>
              {!isEditingAddress ? (
                <p style={{ margin: 0, color: "#334155" }}>
                  {formattedAddressText || "No saved address. Please click 'Change Address' to enter address."}
                </p>
              ) : null}
            </div>

            {isEditingAddress && (
              <div className="checkout-address-grid">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name *"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
                <input
                  type="tel"
                  name="mobile"
                  placeholder="Mobile Number *"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="house"
                  placeholder="House / Flat No. *"
                  value={formData.house}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="street"
                  placeholder="Street / Area *"
                  value={formData.street}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="landmark"
                  placeholder="Nearby Landmark"
                  value={formData.landmark}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="city"
                  placeholder="City *"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="pincode"
                  placeholder="Pincode *"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  className="full-width-input"
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Payment Method</label>

            <div className="payment-options-wrapper">
              <div className="payment-options" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <label className={`payment-option-label ${formData.payment === "COD" ? "selected" : ""}`} style={{ cursor: "pointer", border: formData.payment === "COD" ? "2px solid #22c55e" : "1px solid #cbd5e1", borderRadius: "10px", padding: "12px", background: formData.payment === "COD" ? "#f0fdf4" : "#fff" }}>
                  <div className="payment-option-content" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <input
                      type="radio"
                      name="payment"
                      value="COD"
                      checked={formData.payment === "COD"}
                      onChange={handleChange}
                    />
                    <div className="payment-title-group">
                      <span className="payment-main-title" style={{ fontWeight: "700", color: "#15803d" }}>💵 Cash on Delivery / Demo Test Order</span>
                      <span className="payment-subtitle" style={{ fontSize: "12px", color: "#4b5563" }}>Place test order instantly without online payment to test Admin Panel, Buzzer & WhatsApp</span>
                    </div>
                  </div>
                  <span className="recommended-tag" style={{ background: "#22c55e", color: "#fff", padding: "3px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700" }}>Instant Test</span>
                </label>

                <label className={`payment-option-label ${formData.payment === "Razorpay Gateway" ? "selected" : ""}`} style={{ cursor: "pointer", border: formData.payment === "Razorpay Gateway" ? "2px solid #e63946" : "1px solid #cbd5e1", borderRadius: "10px", padding: "12px", background: formData.payment === "Razorpay Gateway" ? "#fff5f5" : "#fff" }}>
                  <div className="payment-option-content" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <input
                      type="radio"
                      name="payment"
                      value="Razorpay Gateway"
                      checked={formData.payment === "Razorpay Gateway"}
                      onChange={handleChange}
                    />
                    <div className="payment-title-group">
                      <span className="payment-main-title" style={{ fontWeight: "700", color: "#b91c1c" }}>💳 Pay via Razorpay Gateway</span>
                      <span className="payment-subtitle" style={{ fontSize: "12px", color: "#4b5563" }}>UPI, GPay, PhonePe, Paytm, BHIM, Cards & Netbanking</span>
                    </div>
                  </div>
                  <span className="recommended-tag">Online Gateway</span>
                </label>
              </div>
            </div>
          </div>

          <div className="order-summary-card">
            <h3>Order Summary</h3>

            <div className="order-summary">
              {cartItems.map((item) => (
                <div className="summary-item" key={item.id}>
                  <span>
                    {item.name} × {item.qty}
                  </span>
                  <strong>₹{item.price * item.qty}</strong>
                </div>
              ))}

              <hr />

              <div className="summary-item">
                <span>Subtotal</span>
                <strong>₹{subtotal}</strong>
              </div>

              <div className="summary-item">
                <span>Delivery Fee</span>
                <strong>₹{deliveryCharge}</strong>
              </div>

              <div className="summary-item">
                <span>Platform & Packaging Fee</span>
                <strong>₹{platformFee}</strong>
              </div>

              <hr />

              <div className="summary-item total">
                <span>Total Amount</span>
                <strong>₹{total}</strong>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="confirm-btn"
            disabled={isProcessingPayment}
            style={formData.payment === "COD" ? { background: "linear-gradient(135deg, #22c55e, #16a34a)", border: "none" } : {}}
          >
            {isProcessingPayment
              ? "⚡ Processing Order..."
              : formData.payment === "COD"
              ? `🚀 Place Demo Order (₹${total})`
              : `Pay ₹${total} via Razorpay`}
          </button>

          <button
            type="button"
            className="back-btn-checkout"
            onClick={onBack}
            disabled={isProcessingPayment}
          >
            Back to Cart
          </button>
        </form>
      </div>
    </div>
  );
}

export default Checkout;