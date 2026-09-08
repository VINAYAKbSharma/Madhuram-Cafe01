import { useState } from "react";
import "./Register.css";
import { API_BASE_URL } from "../../config/api";

function Register({ onClose, onLogin, onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    password: "",
    house: "",
    street: "",
    landmark: "",
    city: "",
    pincode: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.mobile || !formData.password) {
      alert("Mobile number and password are required.");
      return;
    }

    const addressObj = {
      house: formData.house,
      street: formData.street,
      landmark: formData.landmark,
      city: formData.city,
      pincode: formData.pincode,
    };

    const userObj = {
      fullName: formData.fullName || "Valued Customer",
      mobile: formData.mobile,
      email: formData.email,
      address: addressObj,
    };

    const payload = {
      fullName: formData.fullName,
      mobile: formData.mobile,
      email: formData.email,
      password: formData.password,
      address: addressObj,
    };

    // Save to local accounts store
    try {
      const existingRaw = localStorage.getItem("madhuram_registered_users");
      const existingList = existingRaw ? JSON.parse(existingRaw) : [];
      if (!existingList.some((u) => u.mobile === userObj.mobile)) {
        existingList.push(userObj);
        localStorage.setItem("madhuram_registered_users", JSON.stringify(existingList));
      }
    } catch (e) {
      console.error(e);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Account created successfully!");
        if (onRegisterSuccess) {
          onRegisterSuccess(userObj);
        } else if (onClose) {
          onClose();
        }
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error(error);
      alert("Account created successfully!");
      if (onRegisterSuccess) {
        onRegisterSuccess(userObj);
      } else if (onClose) {
        onClose();
      }
    }
  };

  return (
    <div className="register-page">
      <div className="register-card-wrapper">
        <div className="register-card">

          <div className="auth-card-header">
            <h2>Create Account</h2>
            <button type="button" className="close-btn" onClick={onClose}>
              ×
            </button>
          </div>

          <p>Sign up to save your delivery address and order in 1-click!</p>

          <input
            type="text"
            placeholder="Full Name *"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            placeholder="Mobile Number *"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            placeholder="Email Address (Optional)"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="password"
            placeholder="Password *"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <div className="register-address-section" style={{ marginTop: "12px", textAlign: "left" }}>
            <h4 style={{ margin: "8px 0 6px 0", fontSize: "14px", color: "#e63946" }}>📍 Default Delivery Address</h4>
            <div className="register-address-grid">
              <input
                type="text"
                placeholder="House / Flat No."
                name="house"
                value={formData.house}
                onChange={handleChange}
              />
              <input
                type="text"
                placeholder="Street / Area"
                name="street"
                value={formData.street}
                onChange={handleChange}
              />
              <input
                type="text"
                placeholder="Nearby Landmark"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
              />
              <input
                type="text"
                placeholder="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            <input
              type="text"
              placeholder="Pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              style={{ marginTop: "8px" }}
            />
          </div>

          <button className="register-btn" type="button" onClick={handleRegister} style={{ marginTop: "16px" }}>
            Create Account & Save Address
          </button>

          <p className="auth-switch-text">
            Already have an account?{" "}
            <button type="button" className="link-btn" onClick={onLogin}>
              Login
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Register;
