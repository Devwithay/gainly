import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../apiConfig";
import { ArrowLeft, Key, Smartphone, Lock } from "lucide-react";
import "../App.css";
const ForgotPassword = () => {
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("phone", phone);

    const res = await fetch(`${API_BASE_URL}/request-reset.php`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (data.status === "success") {
      setStep(1);
    } else {
      setError(data.message || "User not found");
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("phone", phone);
    formData.append("otp", otp);

    const res = await fetch(`${API_BASE_URL}/verify-otp.php`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (data.status === "success") {
      setStep(2);
    } else {
      setError("Invalid or expired OTP");
    }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("phone", phone);
    formData.append("otp", otp);
    formData.append("new_password", newPassword);

    try {
      const res = await fetch(`${API_BASE_URL}/reset-password.php`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.status === "success") {
        setShowSuccess(true);
      } else {
        setError(data.message || "Something went wrong.");
      }
    } catch (err) {
      setError("Reset failed.");
    }
    setLoading(false);
  };

  return (
    <div className="gainly-container">
      <button onClick={() => navigate(-1)} className="back-btn">
        <ArrowLeft size={20} />
      </button>

      <div className="auth-header">
        <h2>Reset Password</h2>
        <p>Don't worry, Gainly's got your back.</p>
      </div>

      {step === 0 && (
        <form onSubmit={handleRequestOTP} className="gainly-form">
          <div className="input-group">
            <Smartphone className="icon" />
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-txt">{error}</p>}
          <button type="submit" disabled={loading} className="primary-btn">
            {loading ? "Checking..." : "Send Reset Code"}
          </button>
        </form>
      )}
      {step === 1 && (
        <form onSubmit={handleVerifyOTP} className="gainly-form">
          <div className="auth-header">
            <p>
              We've generated a secure code for <b>{phone}</b>.
            </p>
          </div>
          <div className="input-group">
            <Key className="icon" />
            <input
              type="text"
              placeholder="6-Digit Code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />
          </div>
          {error && <p className="error-txt">{error}</p>}
          <button type="submit" disabled={loading} className="primary-btn">
            {loading ? "Verifying..." : "Verify Code"}
          </button>

          <div className="support-link">
            <p>
              Didn't get a code?{" "}
              <a
                href={`https://wa.me/2347030318983?text=Hello, I need the reset code for my Gainly account: ${phone}`}
                target="_blank"
                rel="noreferrer">
                Chat with Admin
              </a>
            </p>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleReset} className="gainly-form">
          <div className="input-group">
            <Lock className="icon" />
            <input
              type="password"
              placeholder="New Passkey"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="primary-btn">
            {loading ? "Updating..." : "Set New Password"}
          </button>
        </form>
      )}
      {showSuccess && (
        <SuccessOverlay
          message="Your passkey has been updated. Taking you to login..."
          onComplete={() => navigate("/login")}
        />
      )}
    </div>
  );
};

export default ForgotPassword;
