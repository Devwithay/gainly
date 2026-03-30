import { useContext, useState, useEffect, lazy, Suspense } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CaptainGainly from "./components/Onboarding/CaptainGainly";
import {
  faMoon,
  faSun,
  faChartPie,
  faShield,
  faArrowTrendUp,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import "./App.css";
import AddSale from "./pages/Dashboard/Sales Hub/AddSale";
import TrackSales from "./pages/Dashboard/Sales Hub/TrackSales";
import Expenses from "./pages/Dashboard/Sales Hub/Expenses";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
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
import LoadingScreen from "./components/LoadingScreen";

const Insights = lazy(() => import("./pages/Dashboard/Insight"));
const SalesHub = lazy(() => import("./pages/Dashboard/Sales Hub/SalesHub"));

function LandingPage({ showModal, setShowModal }) {
  const { theme, setTheme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleJoinWaitlist = () => {
    window.open(
      "https://wa.me/2347030318983?text=Hi%20I%20want%to%20join%20Gainly%20Community.",
      "_blank",
    );
  };

  return (
    <div className="landing-wrapper">
      {/* THEME TOGGLE DOCK */}
      <div className="top-actions">
        <button
          className="glass-toggle"
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
          <FontAwesomeIcon icon={theme === "light" ? faMoon : faSun} />
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card premium-glass animate-pop">
            <div className="modal-glow"></div>
            <h2 className="modal-headline">Upgrade Your Hustle 🚀</h2>
            <p className="modal-subhead">
              Join the 1% of student vendors using data to dominate. No more
              vibes. Just growth.
            </p>
            <div className="modal-actions">
              <button
                className="apple-btn primary"
                onClick={() => navigate("/auth")}>
                Get Started
              </button>
              <button
                className="apple-btn secondary"
                onClick={() => setShowModal(false)}>
                Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BACKGROUND BLOBS */}
      <div className="background-elements">
        <div className="floating-blob green-blob"></div>
        <div className="floating-blob blue-blob"></div>
      </div>

      <main className={`landing-container ${showModal ? "blurred" : ""}`}>
        {/* NAV DOCK */}
        <nav className="floating-nav">
          <div className="nav-logo">GAINLY</div>
          <button onClick={() => navigate("/auth")} className="nav-cta">
            Log In
          </button>
        </nav>

        {/* HERO SECTION */}
        <section className="hero-v2">
          <div className="badge-pill">Built for the next-gen Student CEO</div>
          <h1 className="main-headline">
            Stop Hustling.
            <br />
            <span className="gradient-text">Start Building.</span>
          </h1>
          <p className="hero-subtext">
            Gainly is the all-in-one operating system for student entrepreneurs.
            Track sales, issue professional receipts, and scale your brand with
            precision.
          </p>
          <div className="hero-actions">
            <button
              className="hero-btn-primary shine"
              onClick={() => navigate("/auth")}>
              Launch Your Business
            </button>
            <button className="hero-btn-secondary" onClick={handleJoinWaitlist}>
              <FontAwesomeIcon icon={faWhatsapp} /> Join Community
            </button>
          </div>
        </section>

        {/* PROOF STRIP */}
        <div className="trust-strip">
          <span>TRUSTED BY 100+ UNILORIN VENDORS</span>
          <div className="divider-line"></div>
        </div>

        {/* FEATURE GRID */}
        <section className="features-section">
          <div className="feature-card glass-v2">
            <div className="icon-box purple-box">
              <FontAwesomeIcon icon={faChartPie} />
            </div>
            <h3>Revenue Clarity</h3>
            <p>
              Know your profit to the last Naira. Stop wondering where your
              capital went.
            </p>
          </div>

          <div className="feature-card glass-v2">
            <div className="icon-box green-box">
              <FontAwesomeIcon icon={faShield} />
            </div>
            <h3>Instant Credibility</h3>
            <p>
              Issue Apple-level digital receipts that make customers trust your
              brand instantly.
            </p>
          </div>

          <div className="feature-card glass-v2">
            <div className="icon-box blue-box">
              <FontAwesomeIcon icon={faArrowTrendUp} />
            </div>
            <h3>Smart Scaling</h3>
            <p>
              Identify your best-selling products and restock with data, not
              guesswork.
            </p>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="closing-cta glass-v2">
          <h2>Ready to go pro?</h2>
          <p>Don't just sell. Build a legacy.</p>
          <button
            className="hero-btn-primary"
            onClick={() => navigate("/auth")}>
            Create Free Account
          </button>
        </section>

        <footer className="landing-footer">
          <p>© {new Date().getFullYear()} GAINLY — Designed for Growth.</p>
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  const [showModal, setShowModal] = useState(
    () => !localStorage.getItem("gainly-entered"),
  );

  return (
    <AuthProvider>
      <AppContent showModal={showModal} setShowModal={setShowModal} />
    </AuthProvider>
  );
}

function AppContent({ showModal, setShowModal }) {
  const { loading, user, onboardingStep } = useContext(AuthContext);

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

  if (loading) {
    return LoadingScreen;
  }

  return (
    <>
      {user && onboardingStep < 13 && <CaptainGainly />}

      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route
            path="/"
            element={
              <LandingPage showModal={showModal} setShowModal={setShowModal} />
            }
          />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

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

          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
