import { useState } from "react";
import "./Checkout.css";
import { API_BASE_URL } from "../../config/api";
import { loadRazorpayScript } from "../../utils/loadRazorpay";

function Checkout({ onBack, cartItems, onPlaceOrder, currentUser }) {
  const [paymentMethod, setPaymentMethod] = useState("gateway"); // "gateway" | "razorpay_me"
  const RAZORPAY_ME_URL = "https://razorpay.me/@roopendrasinghparihar";

  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || "",
    mobile: currentUser?.mobile || "",
    house: "",
    street: "",
    landmark: "",
    city: "",
    pincode: "",
    payment: "Razorpay Gateway",
  });

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

  const handleRazorpayMeCheckout = async (targetId, whatsappURL) => {
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
      address: `${formData.house}, ${formData.street}, ${
        formData.landmark ? formData.landmark + ", " : ""
      }${formData.city} - ${formData.pincode}`,
      customer: {
        fullName: formData.fullName,
        mobile: formData.mobile,
      },
      userMobile: formData.mobile,
      status: "Confirmed",
      deliveryMessage: "Deliver in 15 to 20 minute",
      payment: "Razorpay Page (Roopendra Singh Parihar)",
      transactionId: `RZP_ME_${targetId}`,
      paymentStatus: "Paid / Processing",
    };

    // 1. Dispatch custom event locally
    try {
      window.dispatchEvent(
        new CustomEvent("madhuram_new_order", { detail: confirmedOrder })
      );
    } catch (e) {}

    // 2. Open official Razorpay Payment Page URL
    window.open(RAZORPAY_ME_URL, "_blank");

    // 3. Place order and trigger WhatsApp
    if (onPlaceOrder) {
      await onPlaceOrder(confirmedOrder, whatsappURL);
    } else {
      window.open(whatsappURL, "_blank");
    }

    setIsProcessingPayment(false);
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
Platform Fee : ₹${platformFee}

💰 *Grand Total : ₹${total}*

💳 Payment Method : ${paymentMethod === "razorpay_me" ? "Official Razorpay Page (Roopendra Singh Parihar)" : "Razorpay Gateway"}
`;

    const cafeNumber = "919691634045";
    const whatsappURL = `https://wa.me/${cafeNumber}?text=${encodeURIComponent(
      message
    )}`;

    // If user chose direct Razorpay.me link
    if (paymentMethod === "razorpay_me") {
      await handleRazorpayMeCheckout(targetId, whatsappURL);
      return;
    }

    // 1. Load Razorpay SDK script dynamically
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      alert("Failed to load Razorpay SDK. Opening direct Razorpay page...");
      await handleRazorpayMeCheckout(targetId, whatsappURL);
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
      const useDirect = window.confirm(
        `Payment Modal Error: ${err.message}\n\nWould you like to pay using your official Razorpay payment page (https://razorpay.me/@roopendrasinghparihar) instead?`
      );
      if (useDirect) {
        await handleRazorpayMeCheckout(targetId, whatsappURL);
      } else {
        setIsProcessingPayment(false);
      }
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
            address: `${formData.house}, ${formData.street}, ${
              formData.landmark ? formData.landmark + ", " : ""
            }${formData.city} - ${formData.pincode}`,
            customer: {
              fullName: formData.fullName,
              mobile: formData.mobile,
            },
            userMobile: formData.mobile,
            status: "Confirmed",
            deliveryMessage: "Deliver in 15 to 20 minute",
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
            await onPlaceOrder(confirmedOrder, whatsappURL);
          } else {
            window.open(whatsappURL, "_blank");
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
      rzp.on("payment.failed", async function (response) {
        console.error("Razorpay Payment Failed:", response.error);
        const useDirect = window.confirm(
          `Payment Alert: ${response.error?.description || "UPI/Gateway issue"}.\n\nWould you like to pay using your official Razorpay payment page (https://razorpay.me/@roopendrasinghparihar) instead?`
        );
        if (useDirect) {
          await handleRazorpayMeCheckout(targetId, whatsappURL);
        } else {
          setIsProcessingPayment(false);
        }
      });
      rzp.open();
    } catch (err) {
      console.error("Razorpay Modal Error:", err);
      await handleRazorpayMeCheckout(targetId, whatsappURL);
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
              <div className="payment-options" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <label className={`payment-option-label ${paymentMethod === "gateway" ? "selected" : ""}`}>
                  <div className="payment-option-content">
                    <input
                      type="radio"
                      name="paymentMethodChoice"
                      value="gateway"
                      checked={paymentMethod === "gateway"}
                      onChange={() => setPaymentMethod("gateway")}
                    />
                    <div className="payment-title-group">
                      <span className="payment-main-title">💳 Pay via Razorpay Gateway Modal</span>
                      <span className="payment-subtitle">Auto-locked amount ₹{total} (UPI, GPay, PhonePe, Cards)</span>
                    </div>
                  </div>
                  <span className="recommended-tag">Recommended</span>
                </label>

                <label className={`payment-option-label ${paymentMethod === "razorpay_me" ? "selected" : ""}`}>
                  <div className="payment-option-content">
                    <input
                      type="radio"
                      name="paymentMethodChoice"
                      value="razorpay_me"
                      checked={paymentMethod === "razorpay_me"}
                      onChange={() => setPaymentMethod("razorpay_me")}
                    />
                    <div className="payment-title-group">
                      <span className="payment-main-title">🔗 Official Razorpay Page (Roopendra Singh Parihar)</span>
                      <span className="payment-subtitle">100% Guaranteed Working UPI Link (razorpay.me/@roopendrasinghparihar)</span>
                    </div>
                  </div>
                  <span className="recommended-tag" style={{ background: "#2563eb" }}>Verified Page</span>
                </label>

                <div className="razorpay-hint-box" style={{ marginTop: "6px" }}>
                  {paymentMethod === "gateway" ? (
                    <span>🔒 <strong>Razorpay Modal:</strong> ₹{total} pre-filled automatically. Order is listed after signature verification.</span>
                  ) : (
                    <span>✅ <strong>Official Merchant Page:</strong> Direct link to <code>razorpay.me/@roopendrasinghparihar</code> with 100% active UPI banking name.</span>
                  )}
                </div>
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
              ? "⚡ Processing Payment..."
              : paymentMethod === "razorpay_me"
              ? `Pay ₹${total} via Official Razorpay Page (Roopendra Singh Parihar)`
              : `Pay ₹${total} via Razorpay Gateway Modal`}
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