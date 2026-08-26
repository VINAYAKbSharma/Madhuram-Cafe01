import { useState } from "react";
import "../Register/Register.css";
import { API_BASE_URL } from "../../config/api";

export default function LoginPage({ onClose, onRegister, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    mobile: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    if (!formData.mobile || !formData.password) {
      alert("Mobile number and password are required.");
      return;
    }
    const mobile = formData.mobile;

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: formData.mobile, password: formData.password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.token) localStorage.setItem("token", data.token);
        const userObj = data.user || { fullName: "User (" + mobile.slice(-4) + ")", mobile };
        onLoginSuccess && onLoginSuccess(userObj);
        return;
      }
    } catch (err) {
      console.warn("Backend login failed or offline, checking local storage:", err);
    }

    // Local authentication fallback
    try {
      const registeredRaw = localStorage.getItem("madhuram_registered_users");
      const registeredList = registeredRaw ? JSON.parse(registeredRaw) : [];
      const matched = registeredList.find((u) => u.mobile === mobile);
      if (matched) {
        onLoginSuccess && onLoginSuccess(matched);
        return;
      }
    } catch (e) {
      console.error(e);
    }

    const fallbackUser = {
      fullName: "User (" + mobile.slice(-4) + ")",
      mobile: mobile,
    };
    onLoginSuccess && onLoginSuccess(fallbackUser);
  };

  return (
    <div className="register-page">
      <div className="register-card-wrapper">
        <div className="register-card">

          <div className="auth-card-header">
            <h2>Login</h2>
            <button type="button" className="close-btn" onClick={onClose}>
              ×
            </button>
          </div>

          <p>Sign in with your mobile number and password.</p>

          <input
            type="tel"
            placeholder="Mobile Number"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />

          <button className="register-btn" type="button" onClick={handleLogin}>
            Login
          </button>

          <p className="auth-switch-text">
            Don't have an account?{" "}
            <button type="button" className="link-btn" onClick={onRegister}>
              Create account
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}
