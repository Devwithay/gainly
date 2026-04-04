import { useState, useEffect, useContext, Suspense } from "react";
import "./Home.css";
import { AuthContext } from "../../Context Api/AuthContext";
import API_BASE_URL from "../../apiConfig";
// import { AiContext } from "../../Context Api/AiContext"; // AI Context Commented
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faFire,
  faBell,
  faMagicWandSparkles,
  faXmark,
  faRocket,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router";
// import { KNOWLEDGE_BASE, detectIntent, generateResponse } from "../../components/ai/ai"; // AI Logic Commented
import LoadingScreen from "../../components/LoadingScreen";

const CardSkeleton = () => (
  <div className="glass-card skeleton-card">
    <div className="skeleton skeleton-label"></div>
    <div className="skeleton skeleton-title"></div>
    <div className="skeleton skeleton-subtitle"></div>
    <div className="skeleton skeleton-footer"></div>
  </div>
);

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  if (hour < 21) return "Good Evening";
  return "Good Night";
};

function Home({ trackAction }) {
  const [showAiPopup, setShowAiPopup] = useState(false); // New Apple-style popup state
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    todayTotal: 0,
    todayCount: 0,
    lastSale: null,
    yesterdayTotal: 0,
    hasAnySales: false,
    topProductName: "",
    topProductCount: 0,
    topProductMoney: 0,
    unpaidTotal: 0,
  });

  useEffect(() => {
    const getStats = async () => {
      if (!user?.phone) return;
      try {
        const response = await fetch(
          `${API_BASE_URL}/fetch-dashboard-stats.php?phone=${user.phone}`,
        );
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setIsLoading(false);
      }
    };
    getStats();
  }, [user]);

  const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return "No sales yet";
    return new Date(dateTimeStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // --- DYNAMIC ADVICE BANK LOGIC ---
  const getDynamicAdvice = () => {
    // 1. Debt Priority
    if (stats.unpaidTotal > 20000) {
      return {
        title: "Revenue Recovery",
        subtitle: "Cash is trapped in debt!",
        advice: `You have ₦${Number(stats.unpaidTotal).toLocaleString()} outside. Send friendly reminders to your customers today to boost your cash flow.`,
        icon: "💸",
        tag: "High Priority",
      };
    }

    // 2. High Volume / Success
    if (stats.todayCount >= 5) {
      return {
        title: "Momentum Alert",
        subtitle: "You're on a roll today!",
        advice: `5+ orders today! Post a 'Thank You' note on your WhatsApp status. Social proof drives even more sales.`,
        icon: "🔥",
        tag: "Growth",
      };
    }

    // 3. Top Product Insight
    if (stats.topProductCount > 0) {
      return {
        title: "Inventory Insight",
        subtitle: `${stats.topProductName} is a winner`,
        advice: `This is your best seller. Try creating a 'Limited Time Offer' or bundle it with a slower item to clear stock.`,
        icon: "👑",
        tag: "Strategy",
      };
    }

    // 4. General/Default Advice
    return {
      title: "Market Visibility",
      subtitle: "Keep the engine running",
      advice:
        "Consistent posting wins. Share a 'Behind the scenes' clip of you working. Customers buy from people they trust.",
      icon: "✨",
      tag: "Daily Tip",
    };
  };

  const strategy = getDynamicAdvice();

  return (
    <main className="dashboard-container">
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      {/* APPLE-STYLE "COMING SOON" POPUP */}
      {showAiPopup && (
        <div
          className="apple-popup-overlay"
          onClick={() => setShowAiPopup(false)}>
          <div
            className="apple-popup-card animate-pop"
            onClick={(e) => e.stopPropagation()}>
            <div className="popup-icon-wrap">
              <FontAwesomeIcon icon={faRocket} className="rocket-icon" />
            </div>
            <h2>Coming Soon</h2>
            <p>
              Our <b>AI Marketing Expert</b> is currently in training to help
              you scale {user?.bname || "your business"} to the moon.
            </p>
            <button
              className="popup-close-btn"
              onClick={() => setShowAiPopup(false)}>
              Got it
            </button>
          </div>
        </div>
      )}

      {/* AI DRAWER COMMENTED OUT 
      <Suspense fallback={<LoadingScreen message="Assembling briefing..." />}>
          ... previous AI code ...
      </Suspense> 
      */}

      <header className="header">
        <h1>
          {getGreeting()}, {user?.fullname?.split(" ")[0] || "CEO"}!
        </h1>
        <div className="header-actions">
          {/* Triggers the "Coming Soon" Popup instead of the Drawer */}
          <button
            className="icon-btn ai-btn"
            onClick={() => setShowAiPopup(true)}>
            <FontAwesomeIcon icon={faMagicWandSparkles} />
          </button>
          <button
            className="icon-btn"
            onClick={() => navigate("/sales-hub/debt-list")}
            style={{ position: "relative" }}>
            <FontAwesomeIcon icon={faBell} />
            {stats.unpaidTotal > 0 && (
              <span className="notification-dot"></span>
            )}
          </button>
        </div>
      </header>

      <section className="stats-container">
        {isLoading ? (
          <CardSkeleton />
        ) : (
          <>
            <div className="glass-card">
              <p className="card-label">Today's Sales</p>
              <h2 className="card-main-val">
                ₦{Number(stats.todayTotal).toLocaleString()}
              </h2>
              <p className="card-sub-val">{stats.todayCount} orders today</p>
              <div className="card-footer">
                <FontAwesomeIcon icon={faClock} />{" "}
                <span>Last: {formatTime(stats.lastSale)}</span>
              </div>
            </div>

            {/* DYNAMIC STRATEGY CARD (No Button) */}
            <div className="glass-card strategy-card-v2">
              <div className="strategy-header">
                <div className="strategy-badge-v2">
                  <span className="s-icon">{strategy.icon}</span>
                  <span className="s-tag">{strategy.tag}</span>
                </div>
              </div>
              <h2 className="card-main-title">{strategy.title}</h2>
              <p className="strategy-subtitle">{strategy.subtitle}</p>
              <div className="dynamic-advice-content">
                <p>"{strategy.advice}"</p>
              </div>
              {/* Removed Execute Strategy Button as requested */}
            </div>

            <div className="glass-card top-product-golden">
              <div className="crown-icon">👑</div>
              <p className="card-label">Top Product (All Time)</p>
              <h2 className="card-main-title">
                {stats.topProductName || "Analyzing..."}
              </h2>
              <p className="card-sub-val">
                {stats.topProductCount} sales · ₦
                {Number(stats.topProductMoney).toLocaleString()}
              </p>
              <div className="card-footer">
                <FontAwesomeIcon icon={faFire} /> <span>Trending Item</span>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default Home;
