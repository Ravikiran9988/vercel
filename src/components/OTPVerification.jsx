import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ✅ Use .env variable
const API_BASE_URL = import.meta.env.VITE_API_URL;

const OTPVerification = ({ email }) => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/verify-otp`, {
        email,
        otp,
      });

      alert(res.data.message || "Email verified!");
      navigate("/login");
    } catch (err) {
      console.error("OTP verification error:", err);

      // More detailed fallback message
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
          Enter the OTP sent to <strong>{email}</strong>
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
