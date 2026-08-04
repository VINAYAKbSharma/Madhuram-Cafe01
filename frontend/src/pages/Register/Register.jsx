import { useState } from "react";
import "./Register.css";

function Register({ onClose, onLogin }) {
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
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Account created successfully!");
        onClose && onClose();
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error(error);
      alert("Registration failed");
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
