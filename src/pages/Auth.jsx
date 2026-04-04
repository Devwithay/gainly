import React, { useContext, useState, useEffect } from "react";
import "../App.css";
import { AuthContext } from "../Context Api/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faMoon,
  faSun,
  faEyeSlash,
  faPhone,
  faStore,
  faUser,
  faSpinner,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import { ThemeContext } from "../Context Api/useTheme";

export default function Auth() {
  const { login, register } = useContext(AuthContext);
  const { theme, setTheme } = useContext(ThemeContext);
  const [isSignUp, setIsSignUp] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [selectedNiches, setSelectedNiches] = useState([]);
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const savedNumber = localStorage.getItem("rememberedNumber");
    const savedPass = localStorage.getItem("rememberedPass");
    if (savedNumber && savedPass) {
      setNumber(savedNumber);
      setPassword(savedPass);
      setRememberMe(true);
    }
  }, []);

  const handleRememberMe = (phone, pass) => {
    if (rememberMe) {
      localStorage.setItem("rememberedNumber", phone);
      localStorage.setItem("rememberedPass", pass);
    } else {
      localStorage.removeItem("rememberedNumber");
      localStorage.removeItem("rememberedPass");
    }
  };

  const categoriesList = [
    "Fashion & Apparel",
    "Footwear & Bags",
    "Human Hairs & Wigs",
    "Beauty & Skincare",
    "Jewellery & Accessories",
    "Phones & Tech Gadgets",
    "Stationeries",
    "Health & Wellness Products",
    "Home & Kitchenware",
    "Baby & Kids Products",
    "Snacks & Food Items",
    "Eco-Friendly Goods",
    "Pet Supplies & Accessories",
    "Fitness & Gym Apparel",
    "Print-On-Demand Merchandise",
    "Wedding & Event Goods",
    "Gaming & Esports Accessories",
    "DIY Crafts & Handmade Items",
    "Digital Products & Templates",
    "Service-Based Offers",
    "Graphics designer",
    "Video Editor",
    "Beauty Tools & Grooming Devices",
  ];

  const toggleNiche = (niche) => {
    if (selectedNiches.includes(niche)) {
      setSelectedNiches(selectedNiches.filter((item) => item !== niche));
    } else {
      if (selectedNiches.length < 3) {
        setSelectedNiches([...selectedNiches, niche]);
      } else {
        alert("Maximum 3 categories allowed for now, Boss!");
      }
    }
  };

  const handleSignUp = async () => {
    setErrorMsg("");

    // 1. Name Validation (Regex: Letters and spaces only, min 3 chars)
    const nameRegex = /^[a-zA-Z\s]{3,}$/;
    if (!nameRegex.test(firstName.trim())) {
      return setErrorMsg("Please input a real name (no numbers or symbols).");
    }

    // 2. Business Name (Simple non-empty check)
    if (businessName.trim().length < 2) {
      return setErrorMsg("Please enter a valid business name.");
    }

    // 3. Phone Number (Min 10 digits, numbers only)
    const cleanPhone = number.trim();
    if (cleanPhone.length < 10 || isNaN(cleanPhone)) {
      return setErrorMsg("Please enter a valid phone number.");
    }

    // 4. Password Strength Check
    const strength = getPasswordStrength(); // Using the helper from my previous reply
    if (strength.label === "Weak" || strength.label === "") {
      return setErrorMsg("Password too weak. Please make it longer.");
    }

    // 5. Category Check
    if (selectedNiches.length === 0) {
      return setErrorMsg("Please select at least one category.");
    }

    setIsLoading(true);
    try {
      const result = await register(
        firstName.trim(),
        businessName.trim(),
        JSON.stringify(selectedNiches),
        cleanPhone,
        password,
      );

      if (result === "success") {
        const success = await login(cleanPhone, password);
        if (success) window.location.href = "/dashboard";
      } else {
        setErrorMsg(result);
      }
    } catch (err) {
      setErrorMsg("System Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (password.length === 0) return { width: "0%", color: "#ccc", label: "" };
    if (password.length < 6)
      return { width: "33%", color: "#ff4d4d", label: "Weak" };
    if (password.length < 10)
      return { width: "66%", color: "#ffcc00", label: "Medium" };
    return { width: "100%", color: "#27ae60", label: "Strong" };
  };

  const strength = getPasswordStrength();

  const handleLogin = async () => {
    console.log("Check before Login:", { number, password });

    if (!number || !password) {
      setErrorMsg("Please enter both phone and password");
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(number, password);
      if (success) {
        handleRememberMe(number, password);
        navigate("/dashboard");
      } else {
        setErrorMsg("Invalid credentials");
      }
    } catch (err) {
      setErrorMsg("Connection failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container" data-theme={theme}>
      {/* Ambient Background for the Liquid Glass effect */}
      <div className="ambient-scene">
        <div className="blob-blue"></div>
        <div className="blob-green"></div>
      </div>

      <button
        className="theme-toggle"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        aria-label="Toggle theme">
        <FontAwesomeIcon icon={theme === "light" ? faMoon : faSun} />
      </button>

      <div className="gainly-container">
        <div className="glass-liquid">
          <div className="auth-header">
            <div className="logo-glow">Gainly</div>
            <h2 className="auth-title">
              {isSignUp ? "Create account" : "Welcome Back, CEO"}
            </h2>
            <p className="auth-subtitle">
              {isSignUp
                ? "Join thousands of vendors managing sales."
                : "Sign in to manage your business."}
            </p>
          </div>

          <div className="form-content">
            {isSignUp && (
              <>
                <div className="input-group">
                  <FontAwesomeIcon icon={faUser} className="icon" />
                  <input
                    type="text"
                    className="auth-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Full Name"
                  />
                </div>
                <div className="input-group">
                  <FontAwesomeIcon icon={faStore} className="icon" />
                  <input
                    type="text"
                    className="auth-input"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Business name (e.g. Your Store)"
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label className="section-label">
                    BUSINESS CATEGORY (MAX 3)
                  </label>
                  <div className="niche-selector-container">
                    {categoriesList.map((niche) => (
                      <button
                        key={niche}
                        type="button"
                        onClick={() => toggleNiche(niche)}
                        className={`niche-chip ${selectedNiches.includes(niche) ? "active" : ""}`}>
                        {niche}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="input-group">
              <FontAwesomeIcon icon={faPhone} className="icon" />
              <input
                className="auth-input"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="Phone Number"
                type="tel"
              />
            </div>

            <div className="input-group">
              <FontAwesomeIcon icon={faLock} className="icon" />
              <input
                type={showPassword ? "text" : "password"}
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
              <button
                type="button"
                className="eye-icon-btn"
                onClick={() => setShowPassword((s) => !s)}>
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>

            {/* Password Strength Meter */}
            <div className="strength-meter">
              <div className="meter-bg">
                <div
                  className="meter-fill"
                  style={{
                    width: strength.width,
                    backgroundColor: strength.color,
                  }}></div>
              </div>
              <span className="strength-text" style={{ color: strength.color }}>
                {strength.label}
              </span>
            </div>

            <div className="auth-options">
              <label className="remember-box">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              {!isSignUp && (
                <Link
                  to="/forgot-password"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--primary-color)",
                  }}>
                  Forgot Password?
                </Link>
              )}
            </div>

            <div style={{ marginTop: 20 }}>
              {errorMsg && <div className="error-banner">{errorMsg}</div>}

              <button
                className="primary-btn"
                onClick={isSignUp ? handleSignUp : handleLogin}
                disabled={isLoading}>
                {isLoading ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : isSignUp ? (
                  "Create Account"
                ) : (
                  "Sign In"
                )}
              </button>
            </div>

            <div style={{ marginTop: 20, textAlign: "center" }}>
              <button
                className="toggle-auth-btn"
                onClick={() => {
                  setIsSignUp((s) => !s);
                  setErrorMsg("");
                }}>
                {isSignUp
                  ? "Already have an account? Sign In"
                  : "New to Gainly? Create Account"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
