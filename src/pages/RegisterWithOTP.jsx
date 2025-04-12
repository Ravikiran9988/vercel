import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles.css";

// ✅ API base URL (adjust for your deployment)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://railway-production-0187.up.railway.app/api";

const RegisterWithOTP = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendOTP = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/send-otp`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      alert(res.data.message || "OTP sent to your email!");
      navigate("/verify-otp", { state: formData });
    } catch (err) {
      console.error("❌ OTP Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Error sending OTP. Please try again.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Create Your Radiant Skincare Account</h2>
        <p className="subtitle">
          Sign up and get started with AI-powered skincare ✨
        </p>
        <form onSubmit={sendOTP}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <label className="show-password">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(!showPassword)}
              />
              Show Password
            </label>
          </div>
          <button className="otp-button" type="submit">
            Send OTP
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterWithOTP;

