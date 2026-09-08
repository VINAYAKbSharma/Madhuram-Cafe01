import { useState } from "react";
import "./Checkout.css";
import { API_BASE_URL } from "../../config/api";
import { loadRazorpayScript } from "../../utils/loadRazorpay";
import upiQrImg from "../../assets/upi_qr.jpg";

function Checkout({ onBack, cartItems, onPlaceOrder, currentUser }) {
  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || "",
    mobile: currentUser?.mobile || "",
    house: "",
    street: "",
    landmark: "",
    city: "",
    pincode: "",
    payment: "Razorpay Gateway", // Default to Razorpay Gateway like food delivery apps
    upiUtr: "",
  });

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  const MIN_ORDER_AMOUNT = 200;
  const CAFE_UPI_ID = "9691634045@ybl";

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

  const copyUpiId = () => {
    navigator.clipboard.writeText(CAFE_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

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
Platform Fee : ₹${platformFee}

💰 *Grand Total : ₹${total}*

💳 Payment Method : ${formData.payment}
${formData.upiUtr ? `🔢 UTR / Txn Ref : ${formData.upiUtr}` : ""}
`;

    const cafeNumber = "919691634045";
    const whatsappURL = `https://wa.me/${cafeNumber}?text=${encodeURIComponent(
      message
    )}`;

    const newOrderBase = {
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
      address: `${formData.house}, ${formData.street}, ${
        formData.landmark ? formData.landmark + ", " : ""
      }${formData.city} - ${formData.pincode}`,
      customer: {
        fullName: formData.fullName,
        mobile: formData.mobile,
      },
      userMobile: formData.mobile,
      status: "Pending",
      deliveryMessage: "Pending Admin Confirmation",
    };

    // 1. CASH ON DELIVERY
    if (formData.payment === "Cash on Delivery") {
      const codOrder = {
        ...newOrderBase,
        payment: "Cash on Delivery",
        transactionId: null,
      };

      try {
        window.dispatchEvent(
          new CustomEvent("madhuram_new_order", { detail: codOrder })
        );
      } catch (err) {}

      if (onPlaceOrder) {
        onPlaceOrder(codOrder, whatsappURL);
      } else {
        window.open(whatsappURL, "_blank");
      }
      return;
    }

    // 2. DIRECT UPI QR PAYMENT
    if (formData.payment === "Direct UPI QR") {
      const upiOrder = {
        ...newOrderBase,
        payment: "Direct UPI QR Code",
        transactionId: formData.upiUtr || `UPI_${Date.now()}`,
        paymentStatus: "Paid / Pending Verification",
      };

      try {
        window.dispatchEvent(
          new CustomEvent("madhuram_new_order", { detail: upiOrder })
        );
      } catch (err) {}

      if (onPlaceOrder) {
        onPlaceOrder(upiOrder, whatsappURL);
      } else {
        window.open(whatsappURL, "_blank");
      }
      return;
    }

    // 3. RAZORPAY PAYMENT GATEWAY (UPI / GPAY / PHONEPE / CARDS / NETBANKING)
    setIsProcessingPayment(true);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert("Failed to load Razorpay Payment Gateway. Check internet connection.");
        setIsProcessingPayment(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          receipt: targetId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.order) {
        alert(`Failed to initialize payment: ${data.message || "Server Error"}`);
        setIsProcessingPayment(false);
        return;
      }

      const { order, key } = data;

      const options = {
        key: key || "rzp_test_TZV0qidx0ebyke",
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Madhuram Cafe",
        description: `Food Order #${targetId}`,
        order_id: order.id,
        prefill: {
          name: formData.fullName || "Customer",
          contact: formData.mobile || "",
          email: currentUser?.email || `${formData.mobile || "customer"}@madhuramcafe.com`,
        },
        theme: {
          color: "#ff6b00",
        },
        handler: async function (response) {
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

            if (verifyData.success) {
              const paidOrder = {
                ...newOrderBase,
                payment: "Razorpay Gateway (Online / UPI)",
                transactionId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                paymentStatus: "Paid",
              };

              try {
                window.dispatchEvent(
                  new CustomEvent("madhuram_new_order", { detail: paidOrder })
                );
              } catch (e) {}

              if (onPlaceOrder) {
                onPlaceOrder(paidOrder, whatsappURL);
              } else {
                window.open(whatsappURL, "_blank");
              }
            } else {
              alert(`Payment Verification Failed: ${verifyData.message}`);
            }
          } catch (verifyErr) {
            console.error("Verification error:", verifyErr);
            alert("Error verifying payment signature. Please try again.");
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        alert(`Payment Failed: ${response.error.description}`);
        setIsProcessingPayment(false);
      });
      rzp.open();
    } catch (err) {
      console.error("Razorpay payment initialization error:", err);
      alert("Payment gateway error. Please try again or choose Direct UPI QR.");
      setIsProcessingPayment(false);
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

            <div className="payment-options-wrapper">
              <div className="payment-options">
                {/* 1. RAZORPAY PAYMENT GATEWAY (PRIMARY) */}
                <label
                  className={`payment-option-label ${
                    formData.payment === "Razorpay Gateway" ? "selected" : ""
                  }`}
                >
                  <div className="payment-option-content">
                    <input
                      type="radio"
                      name="payment"
                      value="Razorpay Gateway"
                      checked={formData.payment === "Razorpay Gateway"}
                      onChange={handleChange}
                    />
                    <div className="payment-title-group">
                      <span className="payment-main-title">💳 Razorpay Gateway (UPI / GPay / PhonePe / Cards)</span>
                      <span className="payment-subtitle">Pay via UPI Apps, GPay, PhonePe, Cards, Netbanking</span>
                    </div>
                  </div>
                  <span className="recommended-tag">Recommended</span>
                </label>

                {formData.payment === "Razorpay Gateway" && (
                  <div className="razorpay-hint-box">
                    💡 <strong>Razorpay Test Mode:</strong> Opens secure payment gateway popup. On desktop test mode, use test UPI ID <code>success@razorpay</code> or Cards.
                  </div>
                )}

                {/* 2. DIRECT CAFE UPI QR OPTION */}
                <label
                  className={`payment-option-label ${
                    formData.payment === "Direct UPI QR" ? "selected" : ""
                  }`}
                >
                  <div className="payment-option-content">
                    <input
                      type="radio"
                      name="payment"
                      value="Direct UPI QR"
                      checked={formData.payment === "Direct UPI QR"}
                      onChange={handleChange}
                    />
                    <div className="payment-title-group">
                      <span className="payment-main-title">📱 Pay via Direct Cafe UPI QR Code</span>
                      <span className="payment-subtitle">Scan Cafe QR code or pay directly to UPI ID</span>
                    </div>
                  </div>
                </label>

                {/* Direct UPI Box details when selected */}
                {formData.payment === "Direct UPI QR" && (
                  <div className="direct-upi-box">
                    <div className="qr-container">
                      <img src={upiQrImg} alt="Madhuram Cafe UPI QR" className="upi-qr-image" />
                      <p className="qr-hint">Scan with GPay, PhonePe, Paytm, BHIM</p>
                    </div>

                    <div className="upi-details">
                      <div className="upi-id-row">
                        <span>UPI ID: <strong>{CAFE_UPI_ID}</strong></span>
                        <button type="button" className="copy-btn" onClick={copyUpiId}>
                          {copiedUpi ? "✓ Copied!" : "📋 Copy"}
                        </button>
                      </div>

                      <div className="utr-input-group">
                        <label>Transaction UTR / Reference No. (Optional):</label>
                        <input
                          type="text"
                          name="upiUtr"
                          placeholder="e.g. 425102938475"
                          value={formData.upiUtr}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. CASH ON DELIVERY OPTION */}
                <label
                  className={`payment-option-label ${
                    formData.payment === "Cash on Delivery" ? "selected" : ""
                  }`}
                >
                  <div className="payment-option-content">
                    <input
                      type="radio"
                      name="payment"
                      value="Cash on Delivery"
                      checked={formData.payment === "Cash on Delivery"}
                      onChange={handleChange}
                    />
                    <div className="payment-title-group">
                      <span className="payment-main-title">💵 Cash on Delivery (COD)</span>
                      <span className="payment-subtitle">Pay with cash when food arrives</span>
                    </div>
                  </div>
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
                <span>Platform Fee</span>
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
          >
            {isProcessingPayment
              ? "⚡ Opening Razorpay Gateway..."
              : formData.payment === "Razorpay Gateway"
              ? `Pay ₹${total} via Razorpay Gateway`
              : formData.payment === "Direct UPI QR"
              ? `Place Order & Pay ₹${total} via UPI QR`
              : "Continue with Cash on Delivery"}
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