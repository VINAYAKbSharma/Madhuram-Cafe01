import { useState, useEffect } from "react";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaCreditCard,
  FaUndo,
  FaTicketAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaShoppingBag,
  FaQuestionCircle,
  FaSignOutAlt,
  FaCheckCircle,
  FaGift,
  FaChevronRight,
  FaCopy,
} from "react-icons/fa";
import { API_BASE_URL } from "../../config/api";
import "./profile.css";

function Profile({ user, orders = [], onLogout, onBackHome, onUpdateUser, onNavigateOrders }) {
  const [activeModal, setActiveModal] = useState(null); // null | 'address' | 'payment' | 'refunds' | 'vouchers'
  const [isSaving, setIsSaving] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState("");
  const [vouchersList, setVouchersList] = useState([]);
  const [vouchersLoading, setVouchersLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    house: user?.address?.house || "",
    street: user?.address?.street || "",
    landmark: user?.address?.landmark || "",
    city: user?.address?.city || "",
    pincode: user?.address?.pincode || "",
  });

  // Dynamically load coupons for this user from backend API / localStorage backup
  useEffect(() => {
    const fetchVouchers = async () => {
      setVouchersLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/coupons?mobile=${user?.mobile || ""}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.coupons)) {
            setVouchersList(data.coupons);
          }
        }
      } catch (err) {
        console.warn("Error fetching vouchers:", err);
        try {
          const raw = localStorage.getItem("madhuram_coupons");
          const all = raw ? JSON.parse(raw) : [];
          setVouchersList(
            all.filter((c) => c.active !== false && (c.targetUser === "ALL" || c.targetUser === user?.mobile))
          );
        } catch {}
      } finally {
        setVouchersLoading(false);
      }
    };

    fetchVouchers();
  }, [user, activeModal]);

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user?.mobile) return;

    setIsSaving(true);

    const addressObj = {
      house: editForm.house,
      street: editForm.street,
      landmark: editForm.landmark,
      city: editForm.city,
      pincode: editForm.pincode,
    };

    const updatedUser = {
      ...user,
      fullName: editForm.fullName,
      email: editForm.email,
      address: addressObj,
    };

    try {
      await fetch(`${API_BASE_URL}/api/auth/user/${user.mobile}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: editForm.fullName,
          email: editForm.email,
          address: addressObj,
        }),
      });
    } catch (err) {
      console.warn("Backend profile update warning:", err);
    }

    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }

    setIsSaving(false);
    setActiveModal(null);
    alert("Profile and Delivery Address updated successfully!");
  };

  const formatAddress = (addr) => {
    if (!addr || typeof addr !== "object") return "No saved address yet. Click to add your address.";
    const parts = [
      addr.house,
      addr.street,
      addr.landmark ? `(Near ${addr.landmark})` : "",
      addr.city,
      addr.pincode,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "No saved address yet. Click to add your address.";
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(""), 3000);
  };

  const recentOrders = Array.isArray(orders) ? orders.slice(0, 3) : [];

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        {/* Top Curved Header Banner (Black & Gold Theme) */}
        <div className="profile-header-card">
          <div className="profile-nav-bar">
            <button className="icon-nav-btn" onClick={onBackHome} title="Back to Home">
              <FaArrowLeft />
            </button>

            <div className="top-right-actions">
              <button
                className="help-pill-btn"
                onClick={() =>
                  window.open(
                    "https://wa.me/919691634045?text=Hi%20Madhuram%20Cafe%20Support,%20I%20need%20help%20with%20my%20account",
                    "_blank"
                  )
                }
              >
                <FaQuestionCircle /> Help
              </button>

              <button className="logout-icon-btn" onClick={onLogout} title="Logout">
                <FaSignOutAlt />
              </button>
            </div>
          </div>

          <div className="user-hero-info">
            <h1 className="user-display-name">{user?.fullName || "Valued Customer"}</h1>
            <p className="user-phone-number">+91 - {user?.mobile || "7000623626"}</p>
            {user?.email && <p className="user-email-text">{user.email}</p>}
          </div>
        </div>

        {/* Content Body */}
        <div className="profile-content-body">
          {/* Promo / Rewards Banner Card */}
          <div className="referral-promo-card">
            <div className="promo-left-details">
              <div className="promo-title-row">
                <FaGift className="promo-gift-icon" />
                <span className="promo-main-title">Special Offers</span>
                <span className="promo-new-tag">OFFERS</span>
              </div>
              <p className="promo-subtext">View active coupons & discount vouchers created for you!</p>
            </div>
            <button
              className="promo-action-btn"
              onClick={() => setActiveModal("vouchers")}
            >
              View Vouchers ({vouchersList.length})
            </button>
          </div>

          {/* 4 Quick Action Grid Buttons */}
          <div className="quick-actions-grid">
            <div
              className="action-grid-card"
              onClick={() => setActiveModal("address")}
            >
              <div className="action-card-icon">
                <FaMapMarkerAlt />
              </div>
              <span className="action-card-label">Saved Address</span>
            </div>

            <div
              className="action-grid-card"
              onClick={() => setActiveModal("payment")}
            >
              <div className="action-card-icon">
                <FaCreditCard />
              </div>
              <span className="action-card-label">Payment Modes</span>
            </div>

            <div
              className="action-grid-card"
              onClick={() => setActiveModal("refunds")}
            >
              <div className="action-card-icon">
                <FaUndo />
              </div>
              <span className="action-card-label">My Refunds</span>
            </div>

            <div
              className="action-grid-card"
              onClick={() => setActiveModal("vouchers")}
            >
              <div className="action-card-icon">
                <FaTicketAlt />
              </div>
              <span className="action-card-label">My Vouchers</span>
            </div>
          </div>

          {/* PAST ORDERS SECTION */}
          <div className="past-orders-section">
            <div className="section-header-row">
              <h2 className="section-title">PAST ORDERS</h2>
              {recentOrders.length > 0 && onNavigateOrders && (
                <button className="view-all-link-btn" onClick={onNavigateOrders}>
                  View All ({orders.length}) <FaChevronRight />
                </button>
              )}
            </div>

            {recentOrders.length === 0 ? (
              <div className="no-past-orders-box">
                <FaShoppingBag className="empty-bag-icon" />
                <p className="empty-text">No past orders placed yet</p>
                <button className="browse-menu-gold-btn" onClick={onBackHome}>
                  Browse Menu & Order Now
                </button>
              </div>
            ) : (
              <div className="past-orders-list">
                {recentOrders.map((ord) => (
                  <div className="past-order-item-card" key={ord.id || ord.orderId}>
                    <div className="order-item-top">
                      <div>
                        <strong className="order-id-tag">Order #{ord.id || ord.orderId}</strong>
                        <span className="order-date-text">{ord.date}</span>
                      </div>
                      <span className={`status-badge-pill ${ord.status?.toLowerCase() === "confirmed" ? "confirmed" : ""}`}>
                        {ord.status || "Confirmed"}
                      </span>
                    </div>

                    <div className="order-item-body">
                      <p className="order-items-snippet">
                        {Array.isArray(ord.items)
                          ? ord.items.map((i) => `${i.name} (${i.qty})`).join(", ")
                          : "Delicious Meals"}
                      </p>
                      <strong className="order-total-price">₹{ord.total}</strong>
                    </div>

                    <div className="order-item-actions">
                      <button
                        className="track-order-btn"
                        onClick={onNavigateOrders || onBackHome}
                      >
                        Track / View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* App Version Info */}
          <div className="app-version-footer">
            <p>Madhuram Cafe App • Version 4.116.0 (2026)</p>
            <p className="footer-tagline">100% Fresh & Authentic Culinary Delights</p>
          </div>
        </div>

        {/* =========================================
            MODALS FOR QUICK ACTIONS
           ========================================= */}

        {/* 1. SAVED ADDRESS MODAL */}
        {activeModal === "address" && (
          <div className="modal-backdrop-overlay" onClick={() => setActiveModal(null)}>
            <div className="modal-dialog-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-row">
                <h3><FaMapMarkerAlt className="gold-icon" /> Saved Delivery Address</h3>
                <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
                  <FaTimes />
                </button>
              </div>

              <div className="modal-body-content">
                <p className="current-saved-preview">
                  <strong>Current Address:</strong> {formatAddress(user?.address)}
                </p>

                <form onSubmit={handleSaveProfile} className="address-edit-form">
                  <div className="form-field-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={editForm.fullName}
                      onChange={handleChange}
                      placeholder="Enter Full Name"
                      required
                    />
                  </div>

                  <div className="form-field-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={editForm.email}
                      onChange={handleChange}
                      placeholder="Enter Email"
                    />
                  </div>

                  <div className="form-field-group">
                    <label>House / Flat / Building No.</label>
                    <input
                      type="text"
                      name="house"
                      value={editForm.house}
                      onChange={handleChange}
                      placeholder="e.g. Flat 402, Royal Enclave"
                      required
                    />
                  </div>

                  <div className="form-field-group">
                    <label>Street / Area / Sector</label>
                    <input
                      type="text"
                      name="street"
                      value={editForm.street}
                      onChange={handleChange}
                      placeholder="e.g. Main Street, Scheme 54"
                      required
                    />
                  </div>

                  <div className="form-field-group">
                    <label>Nearby Landmark</label>
                    <input
                      type="text"
                      name="landmark"
                      value={editForm.landmark}
                      onChange={handleChange}
                      placeholder="e.g. Opposite City Park"
                    />
                  </div>

                  <div className="form-row-2col">
                    <div className="form-field-group">
                      <label>City</label>
                      <input
                        type="text"
                        name="city"
                        value={editForm.city}
                        onChange={handleChange}
                        placeholder="City"
                        required
                      />
                    </div>
                    <div className="form-field-group">
                      <label>Pincode</label>
                      <input
                        type="text"
                        name="pincode"
                        value={editForm.pincode}
                        onChange={handleChange}
                        placeholder="Pincode"
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="save-address-btn" disabled={isSaving}>
                    <FaSave /> {isSaving ? "Saving Address..." : "Save Delivery Address"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 2. PAYMENT MODES MODAL */}
        {activeModal === "payment" && (
          <div className="modal-backdrop-overlay" onClick={() => setActiveModal(null)}>
            <div className="modal-dialog-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-row">
                <h3><FaCreditCard className="gold-icon" /> Payment Modes</h3>
                <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
                  <FaTimes />
                </button>
              </div>

              <div className="modal-body-content">
                <div className="info-payment-card">
                  <div className="payment-status-header">
                    <FaCheckCircle className="green-check" />
                    <div>
                      <strong>Razorpay Payment Gateway Active</strong>
                      <p>Instant UPI, Google Pay, PhonePe, Paytm & Cards</p>
                    </div>
                  </div>
                  <hr className="gold-divider" />
                  <p className="payment-note-text">
                    All transactions are 256-bit encrypted and verified directly via Razorpay Merchant Gateway with instant order confirmation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. MY REFUNDS MODAL */}
        {activeModal === "refunds" && (
          <div className="modal-backdrop-overlay" onClick={() => setActiveModal(null)}>
            <div className="modal-dialog-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-row">
                <h3><FaUndo className="gold-icon" /> My Refunds & Returns</h3>
                <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
                  <FaTimes />
                </button>
              </div>

              <div className="modal-body-content">
                <div className="info-refund-box">
                  <p>
                    In case of order cancellation or failed payment, refunds are automatically processed back to your original payment source (UPI/Bank) within <strong>24-48 business hours</strong>.
                  </p>
                  <p className="support-link-text">
                    Need instant refund support? Contact our desk at <strong>+91 9691634045</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. MY VOUCHERS MODAL (DYNAMIC FROM BACKEND / ADMIN) */}
        {activeModal === "vouchers" && (
          <div className="modal-backdrop-overlay" onClick={() => setActiveModal(null)}>
            <div className="modal-dialog-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-row">
                <h3><FaTicketAlt className="gold-icon" /> My Vouchers & Coupons</h3>
                <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
                  <FaTimes />
                </button>
              </div>

              <div className="modal-body-content">
                {vouchersLoading ? (
                  <p style={{ color: "#a1a1aa", padding: "10px" }}>Loading your available vouchers...</p>
                ) : vouchersList.length === 0 ? (
                  <div className="no-past-orders-box" style={{ padding: "24px 16px" }}>
                    <FaTicketAlt style={{ fontSize: "36px", color: "#3f3f46", marginBottom: "8px" }} />
                    <p style={{ color: "#a1a1aa", fontSize: "14px", margin: 0 }}>
                      No active vouchers or coupons available currently.
                    </p>
                    <p style={{ color: "#71717a", fontSize: "12px", marginTop: "4px" }}>
                      Admin can issue custom vouchers & coupons for you anytime!
                    </p>
                  </div>
                ) : (
                  <div className="vouchers-list">
                    {vouchersList.map((v) => (
                      <div className="voucher-card" key={v.id || v.code}>
                        <div className="voucher-info">
                          <span className="voucher-title">{v.description || `${v.code} Voucher`}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", margin: "4px 0" }}>
                            <code className="voucher-code-badge">{v.code}</code>
                            <span style={{ fontSize: "10px", background: "rgba(34, 197, 94, 0.2)", color: "#4ade80", padding: "2px 6px", borderRadius: "4px", fontWeight: "700" }}>
                              {v.discountType === "fixed" ? `₹${v.discountValue} OFF` : `${v.discountValue}% OFF`}
                            </span>
                          </div>
                          <p className="voucher-desc">
                            {v.minOrderAmount > 0 ? `Min Order: ₹${v.minOrderAmount}` : "No minimum order limit"}
                            {v.targetUser !== "ALL" ? ` • Exclusive for your account` : ""}
                          </p>
                        </div>
                        <button
                          className="copy-coupon-btn"
                          onClick={() => handleCopyCode(v.code)}
                        >
                          <FaCopy /> {copiedCoupon === v.code ? "Copied!" : "Copy Code"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
