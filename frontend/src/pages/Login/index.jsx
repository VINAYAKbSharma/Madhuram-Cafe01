import { useState } from "react";
import "../Register/Register.css";

export default function LoginPage({ onClose, onRegister, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    mobile: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: formData.mobile, password: formData.password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.token) localStorage.setItem("token", data.token);
        onLoginSuccess && onLoginSuccess(data.user);
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
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
