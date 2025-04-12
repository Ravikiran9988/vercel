import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

// ✅ Updated API base URL (with fallback)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://railway-production-0187.up.railway.app/api";

const OTPVerification = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Get email from location state
  const email = location.state?.email;

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!email) {
      alert("Email not found. Please register again.");
      navigate("/register");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
        email,
        otp,
      });

      alert(res.data.message || "Email verified!");
      navigate("/login");
    } catch (err) {
      console.error("OTP verification error:", err);

      if (err.response) {
        alert(err.response.data.message || "Invalid OTP. Please try again.");
      } else if (err.request) {
        alert("Network error. Please check your internet connection.");
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-box">
        <h2>Verify Your Email</h2>
        <p className="subtitle">
          Enter the OTP sent to <strong>{email || "your email"}</strong>
        </p>
        <form onSubmit={handleVerify}>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength="6"
            required
          />
          <button className="verify-button" type="submit">
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
};

export default OTPVerification;

