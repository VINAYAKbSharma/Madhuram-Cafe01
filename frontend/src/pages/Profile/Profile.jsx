import { useState } from "react";
import { FaUserCircle, FaMapMarkerAlt, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { API_BASE_URL } from "../../config/api";
import "./profile.css";

function Profile({ user, onLogout, onBackHome, onUpdateUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    house: user?.address?.house || "",
    street: user?.address?.street || "",
    landmark: user?.address?.landmark || "",
    city: user?.address?.city || "",
    pincode: user?.address?.pincode || "",
  });

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

    // Update backend API
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
    setIsEditing(false);
    alert("Profile and Delivery Address updated successfully!");
  };

  const formatAddress = (addr) => {
    if (!addr || typeof addr !== "object") return "No saved address yet.";
    const parts = [
      addr.house,
      addr.street,
      addr.landmark ? `(Near ${addr.landmark})` : "",
      addr.city,
      addr.pincode,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "No saved address yet.";
  };

  return (
    <div className="profile-page">
      <div className="profile-card">

        {/* Top bar */}
        <div className="profile-top-bar">
          <button className="back-home-btn" onClick={onBackHome}>
            ← Back to Home
          </button>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>

        {/* Avatar */}
        <div className="profile-image">
          <FaUserCircle />
        </div>

        <h2>Welcome Back!</h2>

        <p className="profile-name">
          {user?.fullName || "Valued Customer"}
        </p>

        {/* Account details */}
        <div className="user-details">
          <div className="detail-row">
            <span className="detail-label">Mobile</span>
            <span className="detail-value">{user?.mobile || "—"}</span>
          </div>
          {user?.email && (
            <div className="detail-row">
              <span className="detail-label">Email</span>
              <span className="detail-value">{user.email}</span>
            </div>
          )}
          <div className="detail-row">
            <span className="detail-label">User ID</span>
            <span className="detail-value">#{user?.id || user?.mobile || "—"}</span>
          </div>
        </div>

        {/* Delivery Address Card */}
        <div className="message-box address-box" style={{ borderLeft: "4px solid #e63946", textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", color: "#e63946" }}>
              <FaMapMarkerAlt /> Saved Delivery Address
            </h3>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              style={{
                background: "#e63946",
                color: "#fff",
                border: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {isEditing ? <FaTimes /> : <FaEdit />} {isEditing ? "Cancel" : "Edit Address"}
            </button>
          </div>

          {!isEditing ? (
            <p style={{ margin: "4px 0 0 0", color: "#334155", fontSize: "14px", lineHeight: "1.5" }}>
              {formatAddress(user?.address)}
            </p>
          ) : (
            <form onSubmit={handleSaveProfile} style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={editForm.fullName}
                onChange={handleChange}
                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={editForm.email}
                onChange={handleChange}
                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
              />
              <input
                type="text"
                name="house"
                placeholder="House / Flat No."
                value={editForm.house}
                onChange={handleChange}
                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
              />
              <input
                type="text"
                name="street"
                placeholder="Street / Area"
                value={editForm.street}
                onChange={handleChange}
                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
              />
              <input
                type="text"
                name="landmark"
                placeholder="Nearby Landmark"
                value={editForm.landmark}
                onChange={handleChange}
                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={editForm.city}
                  onChange={handleChange}
                  style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
                <input
                  type="text"
                  name="pincode"
                  placeholder="Pincode"
                  value={editForm.pincode}
                  onChange={handleChange}
                  style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                style={{
                  background: "#22c55e",
                  color: "#fff",
                  border: "none",
                  padding: "10px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  cursor: "pointer",
                  marginTop: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <FaSave /> {isSaving ? "Saving Address..." : "Save Delivery Address"}
              </button>
            </form>
          )}
        </div>

        {/* Info cards */}
        <div className="message-box">
          <h3>🍽️ Fast 1-Click Checkout Enabled</h3>
          <p>
            Your saved delivery address is automatically prefilled when you place orders. No need to retype forms!
          </p>
        </div>

        <div className="message-box">
          <h3>❤️ Thank You for Choosing Us</h3>
          <p>
            Your happiness is our priority. We hope every order brings
            a smile to your face.
          </p>
        </div>

      </div>
    </div>
  );
}

export default Profile;
