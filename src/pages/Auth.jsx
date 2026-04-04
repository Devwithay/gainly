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
  // const handleForgotPassword = () => {
  //   const contactCeo = window.confirm(
  //     "Forgot Password? For security, password resets are handled manually by the Gainly Team. Contact support now?",
  //   );
  //   if (contactCeo) {
  //     window.location.href =
  //       "https://wa.me/2347030318983?text=Hi%20Gainly%20Support,%20I%20forgot%20my%20password.";
  //   }
  // };

  return (
    <>
      <button
        className="theme-toggle"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        aria-label="Toggle theme">
        <FontAwesomeIcon icon={theme === "light" ? faMoon : faSun} />
      </button>

      <div
        className="auth-wrapper"
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 20,
          background: "var(--bg)",
        }}>
        <div
          className="modal-card glass"
          style={{ maxWidth: 420, width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <div className="logo-glow">Gainly</div>
            <h2 style={{ marginTop: 8 }}>
              {isSignUp ? "Create account" : "Welcome Back, CEO"}
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>
              {isSignUp
                ? "Join thousands of vendors managing sales."
                : "Sign in to manage your business."}
            </p>
          </div>

          {isSignUp && (
            <>
              <input
                type="text"
                className="auth-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Full Name"
              />
              <input
                type="text"
                className="auth-input"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Business name (e.g. Your Store)"
              />
              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    display: "block",
                    marginBottom: 8,
                    fontWeight: 600,
                  }}>
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

          <input
            className="auth-input"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="Phone Number"
            type="number"
          />

          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              style={{ paddingRight: 48 }}
            />
            {/* Put this directly under your Password Input */}
            <div style={{ marginTop: "8px", marginBottom: "15px" }}>
              <div
                style={{
                  height: "6px",
                  width: "100%",
                  backgroundColor: "#e0e0e0",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}>
                <div
                  style={{
                    height: "100%",
                    width: strength.width,
                    backgroundColor: strength.color,
                    transition: "width 0.3s ease-in-out",
                  }}></div>
              </div>
              <span
                style={{
                  fontSize: "12px",
                  color: strength.color,
                  fontWeight: "bold",
                  marginTop: "4px",
                  display: "block",
                }}>
                {strength.label}
              </span>
            </div>
            <button
              type="button"
              className="eye-icon"
              onClick={() => setShowPassword((s) => !s)}>
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 5,
              padding: "0 4px",
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: 16, height: 16, cursor: "pointer" }}
              />
              <label
                htmlFor="remember"
                style={{
                  cursor: "pointer",
                  fontSize: 13,
                  color: "var(--text)",
                }}>
                Remember me
              </label>
            </div>

            {!isSignUp && (
              <Link
                to="/forgot-password"
                style={{
                  background: "none",
                  border: "none",
                  color: "#7c3aed",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}>
                Forgot Password?
              </Link>
            )}
          </div>

          <div style={{ marginTop: 20 }}>
            {errorMsg && <div className="error-banner">{errorMsg}</div>}

            <button
              className="cta-btn"
              onClick={isSignUp ? handleSignUp : handleLogin}
              style={{ width: "100%", height: 50, fontSize: 16 }}
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

      <style>{`
  .auth-input {
    width: 100%;
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 12px;
    outline: none;
    transition: all 0.2s ease;
  }
  .auth-input:focus { 
    border-color: var(--green) !important;
    box-shadow: 0 0 0 4px var(--primary-glow);
  }
  .niche-selector-container {
    display: flex; flex-wrap: wrap; gap: 8px; max-height: 160px; 
    overflow-y: auto; padding: 12px; border-radius: 14px;
    background: rgba(0,0,0,0.03); border: 1px solid var(--border);
  }
  [data-theme="dark"] .niche-selector-container {
    background: rgba(255,255,255,0.03);
  }
  .niche-chip {
    padding: 8px 16px; border-radius: 99px; font-size: 13px;
    cursor: pointer; transition: 0.2s;
  }
  .error-banner {
    background: rgba(239, 68, 68, 0.1); color: #ef4444; 
    padding: 12px; border-radius: 10px; font-size: 13px; 
    text-align: center; margin-bottom: 12px; border: 1px solid rgba(239, 68, 68, 0.2);
  }
  .toggle-auth-btn {
    background: none; border: none; color: var(--muted); 
    font-size: 14px; cursor: pointer; font-weight: 500;
  }
`}</style>
    </>
  );
}
