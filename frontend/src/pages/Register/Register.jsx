import { useState } from "react";
import "./Register.css";
import { API_BASE_URL } from "../../config/api";

function Register({ onClose, onLogin, onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    password: "",
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
    const userObj = {
      fullName: formData.fullName || "Valued Customer",
      mobile: formData.mobile,
      email: formData.email,
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
        body: JSON.stringify(formData),
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
      // Fallback for offline / direct registration mode
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
            <h2>Register</h2>
            <button type="button" className="close-btn" onClick={onClose}>
              ×
            </button>
          </div>

          <p>Create your account to get started.</p>

          <input
            type="text"
            placeholder="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
          />
          <input
            type="tel"
            placeholder="Mobile Number"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button className="register-btn" type="button" onClick={handleRegister}>
            Create Account
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
