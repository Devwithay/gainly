import React, { useContext, useState, useEffect } from "react";
import "../App.css";
import { AuthContext } from "../Context Api/AuthContext";
import { useNavigate } from "react-router-dom";
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

  // --- REMEMBER ME LOGIC ---
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
    "Fashion & Apparel", "Footwear & Bags", "Human Hairs & Wigs", 
    "Beauty & Skincare", "Jewellery & Accessories", "Phones & Tech Gadgets",
    "Health & Wellness Products", "Home & Kitchenware", "Baby & Kids Products",
    "Snacks & Food Items", "Eco-Friendly Goods", "Pet Supplies & Accessories",
    "Fitness & Gym Apparel", "Print-On-Demand Merchandise", "Wedding & Event Goods",
    "Gaming & Esports Accessories", "DIY Crafts & Handmade Items", 
    "Digital Products & Templates", "Service-Based Offers", "Beauty Tools & Grooming Devices"
  ];

  const toggleNiche = (niche) => {
    if (selectedNiches.includes(niche)) {
      setSelectedNiches(selectedNiches.filter(item => item !== niche));
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
    if (!firstName || !number || !password || !businessName || selectedNiches.length === 0) {
      setErrorMsg("Please fill in all fields and select a category.");
      return;
    }
    setIsLoading(true);
    try {
      const result = await register(
        firstName,
        businessName,
        JSON.stringify(selectedNiches),
        number,
        password
      );

      if (result === "Vendor Successfully added") {
        handleRememberMe(number, password);
        const success = await login(number, password);
        if (success) window.location.href = "/dashboard";
      } else {
        setErrorMsg(result || "Could not create account.");
      }
    } catch (err) {
      setErrorMsg("Server error. Check connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setErrorMsg("");
    if (!number || !password) {
      setErrorMsg("Please provide Phone number and password.");
      return;
    }
    setIsLoading(true);
    try {
      const success = await login(number, password);
      if (success) {
        handleRememberMe(number, password);
        window.location.href = "/dashboard";
      } else {
        setErrorMsg("Invalid phone number or password.");
      }
    } catch (err) {
      setErrorMsg("Connection failed. Is the server running?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    const contactCeo = window.confirm("Forgot Password? For security, password resets are handled manually by the Gainly Team. Contact support now?");
    if(contactCeo) {
        window.location.href = "https://wa.me/2347030318983?text=Hi%20Gainly%20Support,%20I%20forgot%20my%20password.";
    }
  };

  return (
    <>
      <button
        className="theme-toggle"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        aria-label="Toggle theme">
        <FontAwesomeIcon icon={theme === "light" ? faMoon : faSun} />
      </button>

      <div className="auth-wrapper" style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 20,
          background: "var(--bg)",
      }}>
        <div className="modal-card glass" style={{ maxWidth: 420, width: "100%" }}>
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <div className="logo-glow">Gainly</div>
            <h2 style={{ marginTop: 8 }}>
              {isSignUp ? "Create account" : "Welcome Back, CEO"}
            </h2>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>
              {isSignUp ? "Join thousands of vendors managing sales." : "Sign in to manage your business."}
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
                <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 8, fontWeight: 600 }}>
                  BUSINESS CATEGORY (MAX 3)
                </label>
                <div className="niche-selector-container">
                  {categoriesList.map((niche) => (
                    <button
                      key={niche}
                      type="button"
                      onClick={() => toggleNiche(niche)}
                      className={`niche-chip ${selectedNiches.includes(niche) ? "active" : ""}`}
                    >
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
            <button
              type="button"
              className="eye-icon"
              onClick={() => setShowPassword((s) => !s)}>
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>

          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginTop: 5,
            padding: "0 4px" 
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: 16, height: 16, cursor: "pointer" }}
              />
              <label htmlFor="remember" style={{ cursor: "pointer", fontSize: 13, color: "var(--text)" }}>
                Remember me
              </label>
            </div>
            
            {!isSignUp && (
              <button 
                onClick={handleForgotPassword}
                style={{ background: "none", border: "none", color: "#7c3aed", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Forgot Password?
              </button>
            )}
          </div>

          <div style={{ marginTop: 20 }}>
            {errorMsg && (
              <div className="error-banner">
                {errorMsg}
              </div>
            )}

            <button
              className="cta-btn"
              onClick={isSignUp ? handleSignUp : handleLogin}
              style={{ width: "100%", height: 50, fontSize: 16 }}
              disabled={isLoading}>
              {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : (isSignUp ? "Create Account" : "Sign In")}
            </button>
          </div>

          <div style={{ marginTop: 20, textAlign: "center" }}>
            <button
              className="toggle-auth-btn"
              onClick={() => {
                setIsSignUp((s) => !s);
                setErrorMsg("");
              }}>
              {isSignUp ? "Already have an account? Sign In" : "New to Gainly? Create Account"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .auth-input {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.03);
          color: var(--text);
          margin-bottom: 12px;
          outline: none;
          transition: 0.3s;
        }
        .auth-input:focus { border-color: #7c3aed; background: rgba(124, 58, 237, 0.05); }
        .eye-icon {
          position: absolute; right: 12px; top: 12px;
          background: transparent; border: none; color: var(--muted); cursor: pointer;
        }
        .niche-selector-container {
          display: flex; flex-wrap: wrap; gap: 8px; max-height: 120px; 
          overflow-y: auto; padding: 10px; border-radius: 12px;
          background: rgba(0,0,0,0.1); border: 1px solid var(--border);
        }
        .niche-chip {
          padding: 6px 12px; border-radius: 20px; fontSize: 11px;
          border: 1px solid var(--border); background: transparent; color: var(--text);
          cursor: pointer; transition: 0.3s;
        }
        .niche-chip.active { background: #7c3aed; border-color: #7c3aed; color: white; }
        .error-banner {
          background: rgba(239, 68, 68, 0.1); color: #ef4444; 
          padding: 10px; border-radius: 8px; font-size: 13px; text-align: center; margin-bottom: 12px;
        }
        .toggle-auth-btn {
          background: none; border: none; color: var(--muted); font-size: 14px; cursor: pointer;
        }
        .toggle-auth-btn:hover { color: #7c3aed; text-decoration: underline; }
      `}</style>
    </>
  );
}