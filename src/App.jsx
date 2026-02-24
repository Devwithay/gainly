import { useContext, useState, useEffect, lazy, Suspense } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CaptainGainly from "./components/Onboarding/CaptainGainly";
import {
  faMoon,
  faSun,
  faCode,
  faChartLine,
  faUsers,
  faBolt,
} from "@fortawesome/free-solid-svg-icons";
import "./App.css";
import AddSale from "./pages/Dashboard/Sales Hub/AddSale";
import TrackSales from "./pages/Dashboard/Sales Hub/TrackSales";
import Expenses from "./pages/Dashboard/Sales Hub/Expenses";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Auth from "./pages/Auth";

import DashboardLayout from "./pages/Dashboard/DashboardLayout";
import { ThemeContext } from "./Context Api/useTheme";
import PageNotFound from "./pages/404";
import Home from "./pages/Dashboard/Home";

import Profile from "./pages/Dashboard/Profile";
import { AuthProvider } from "./Context Api/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ExpenseHistory from "./pages/Dashboard/Sales Hub/ExpenseHistory";
import Receipts from "./pages/Dashboard/Sales Hub/Receipts";
import DebtList from "./pages/Dashboard/Sales Hub/DebtList";
import { AuthContext } from "./Context Api/AuthContext";
import API_BASE_URL from "./apiConfig";

const Insights = lazy(() => import("./pages/Dashboard/Insight"));
const SalesHub = lazy(() => import("./pages/Dashboard/Sales Hub/SalesHub"));

function LandingPage({ showModal, setShowModal }) {
  const { theme, setTheme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleJoinWaitlist = () => {
    const whatsappUrl =
      "https://wa.me/2347030318983?text=Hi%20I%20want%20early%20access%20to%20Gainly.";
    window.open(whatsappUrl, "_blank");
  };

  return (
    <>
      <button
        className="theme-toggle"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        aria-label="Toggle theme">
        <FontAwesomeIcon icon={theme === "light" ? faMoon : faSun} />
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card glass">
            <h2 className="modal-headline">Level Up Your Hustle 🚀</h2>
            <p className="modal-subhead">
              Stop running your business on "vibes." Join 100+ Unilorin vendors
              using Gainly to track profits and scale professionally.
            </p>
            <div className="modal-actions">
              <button
                className="cta-btn modal-enter"
                onClick={() => setShowModal(false)}>
                Explore Features
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="cta-btn shine">
                Log In Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      <main className={`app ${showModal ? "blurred" : ""}`}>
        <nav className="landing-nav">
          <div className="logo-glow">
            <FontAwesomeIcon icon={faCode} style={{ marginRight: 8 }} />
            Gainly
          </div>
          <button
            onClick={() => navigate("/auth")}
            className="nav-login cta-btn">
            Login
          </button>
        </nav>

        <section className="hero">
          <div className="hero-content">
            <span className="badge">
              Built for Unilorin Student Vendors, Open to All
            </span>
            <h1 className="hero-title">
              The Operating System for <br />
              <span className="gradient-text">Student CEOs.</span>
            </h1>
            <p className="hero-desc">
              Gainly turns your daily hustle into a structured brand. Track
              sales, manage expenses, and get insights that help you grow—all in
              one place.
            </p>
            <div className="hero-btns">
              <button
                onClick={() => navigate("/auth")}
                className="cta-btn shine">
                Start Tracking for Free
              </button>
              <button
                onClick={handleJoinWaitlist}
                className="cta-btn secondary">
                Join Community
              </button>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="stats-strip glass">
            <div className="stat-item">
              <h3>100%</h3>
              <p>Mobile Friendly</p>
            </div>
            <div className="stat-item">
              <h3>₦0</h3>
              <p>Initial Cost</p>
            </div>
            <div className="stat-item">
              <h3>24/7</h3>
              <p>CEO Support</p>
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Everything you need to scale</h2>
          <div className="card-grid">
            <div className="card glass">
              <FontAwesomeIcon
                icon={faChartLine}
                className="card-icon purple"
              />
              <h3>Sales Tracking</h3>
              <p>
                Know exactly how much you're making. No more "where did my money
                go?" moments.
              </p>
            </div>
            <div className="card glass">
              <FontAwesomeIcon icon={faUsers} className="card-icon blue" />
              <h3>Customer Trust</h3>
              <p>
                Get a verified badge and professional receipts that make
                customers take you seriously.
              </p>
            </div>
            <div className="card glass">
              <FontAwesomeIcon icon={faBolt} className="card-icon orange" />
              <h3>Smart Insights</h3>
              <p>
                Understand your best-selling days and products so you can
                restock smarter.
              </p>
            </div>
          </div>
        </section>

        <section className="section cta-section glass">
          <h2>Ready to turn your hustle into a legacy?</h2>
          <p>Join the next generation of student entrepreneurs at Unilorin.</p>
          <button onClick={() => navigate("/auth")} className="cta-btn shine">
            Create Your Account
          </button>
        </section>

        <footer className="footer">
          © {new Date().getFullYear()} Gainly — The Student CEO's Choice
        </footer>
      </main>
    </>
  );
}

export default function App() {
  const [showModal, setShowModal] = useState(
    () => !localStorage.getItem("gainly-entered"),
  );
  const trackAction = (actionType) => {
    const currentHistory = JSON.parse(
      localStorage.getItem("gainly_history") || "[]",
    );
    currentHistory.push({ action: actionType, time: Date.now() });
    localStorage.setItem(
      "gainly_history",
      JSON.stringify(currentHistory.slice(-10)),
    );
  };

  const [user, setUser] = useState(null);

  return (
    <AuthProvider>
      <CaptainGainly />
      <Suspense
        fallback={<div className="loading-screen">Loading Gainly...</div>}>
        <Routes>
          <Route
            path="/"
            element={
              <LandingPage showModal={showModal} setShowModal={setShowModal} />
            }
          />

          <Route
            path="/auth"
            element={<Auth onLoginSuccess={(userData) => setUser(userData)} />}
          />

          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
            <Route
              path="dashboard"
              element={<Home trackAction={trackAction} />}
            />
            <Route
              path="sales-hub"
              element={<SalesHub trackAction={trackAction} />}
            />
            <Route
              path="sales-hub/add-sale"
              element={<AddSale trackAction={trackAction} />}
            />
            <Route
              path="sales-hub/track-sales"
              element={<TrackSales trackAction={trackAction} />}
            />
            <Route path="sales-hub/expenses" element={<Expenses />} />
            <Route
              path="sales-hub/expense-history"
              element={<ExpenseHistory trackAction={trackAction} />}
            />
            <Route path="sales-hub/receipts" element={<Receipts />} />
            <Route
              path="sales-hub/debt-list"
              element={<DebtList trackAction={trackAction} />}
            />
            <Route path="insights" element={<Insights />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="/" element={<Navigate to="/home" />} />

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
