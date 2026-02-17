import { useState, useEffect, useContext, Suspense } from "react";
import "./Home.css";
import { AuthContext } from "../../Context Api/AuthContext";
import API_BASE_URL from "../../apiConfig";
import { AiContext } from "../../Context Api/AiContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faFire,
  faBell,
  faMagicWandSparkles,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router";
import {
  KNOWLEDGE_BASE,
  detectIntent,
  generateResponse,
} from "../../components/ai/ai";

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
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [randomTips, setRandomTips] = useState([]);
  const [activeResponse, setActiveResponse] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [customQuery, setCustomQuery] = useState("");

  const { saveSnippet } = useContext(AiContext);

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

  useEffect(() => {
    if (isAiOpen) {
      const shuffled = [...KNOWLEDGE_BASE].sort(() => 0.5 - Math.random());
      setRandomTips(shuffled.slice(0, 3));
      setActiveResponse("");
      setDisplayedText("");
    }
  }, [isAiOpen]);

  useEffect(() => {
    if (activeResponse && isTyping) {
      let index = 0;
      setDisplayedText("");
      const interval = setInterval(() => {
        setDisplayedText((prev) => prev + (activeResponse[index] || ""));
        index++;
        if (index >= activeResponse.length) {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 18);
      return () => clearInterval(interval);
    }
  }, [activeResponse, isTyping]);

  const handleAskAi = async (itemOrQuery) => {
    let finalQuery = "";
    if (typeof itemOrQuery === "object" && itemOrQuery.q) {
      finalQuery = itemOrQuery.q;
    } else {
      finalQuery = String(itemOrQuery || customQuery || "").trim();
    }

    if (!finalQuery) return;

    setIsTyping(true);
    setDisplayedText("");
    setActiveResponse("");

    const financeKeywords = ["profit", "sales", "revenue", "made", "debt"];
    const isFinanceQuery = financeKeywords.some((word) =>
      finalQuery.toLowerCase().includes(word),
    );

    if (isFinanceQuery) {
      try {
        const res = await fetch(
          `${API_BASE_URL}/ai-query.php?phone=${user.phone}&q=${encodeURIComponent(finalQuery)}`,
        );
        const data = await res.json();
        if (data.response) {
          setActiveResponse(data.response);
          setCustomQuery("");
          return;
        }
      } catch (err) {
        console.error("Backend AI Error:", err);
      }
    }

    const response = generateResponse({
      query: finalQuery,
      user: user,
      stats: stats,
    });

    setActiveResponse(response);
    setCustomQuery("");
  };

  const getGoldenStrategy = () => {
    if (stats.unpaidTotal > 50000) {
      return {
        title: "Debt Recovery Mode",
        subtitle: "Cash is trapped!",
        advice: `You have ₦${stats.unpaidTotal.toLocaleString()} in unpaid orders. Ask AI for a "Polite Debt Reminder" now.`,
        icon: "💸",
        actionColor: "#ef4444",
      };
    }

    if (stats.topProductCount > 10) {
      return {
        title: "Stock Velocity Alert",
        subtitle: `${stats.topProductName} is flying!`,
        advice: `You've sold this ${stats.topProductCount} times. Consider a 'Bundle Deal' with a slow-moving item to clear space.`,
        icon: "📦",
        actionColor: "#8b5cf6",
      };
    }

    return {
      title: "Market Expansion",
      subtitle: `Steady growth in ${user?.category}`,
      advice:
        "Post a behind-the-scenes video. People buy from people, not just stores.",
      icon: "✨",
      actionColor: "#22c55e",
    };
  };

  const strategy = getGoldenStrategy();

  return (
    <main className={`dashboard-container ${isAiOpen ? "modal-open" : ""}`}>
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      <Suspense
        fallback={<div className="loading-screen">Loading Gainly_Ai...</div>}>
        <div
          className={`drawer-overlay ${isAiOpen ? "active" : ""}`}
          onClick={() => setIsAiOpen(false)}>
          <div
            className={`ai-drawer ${isAiOpen ? "slide-up" : ""}`}
            onClick={(e) => e.stopPropagation()}>
            <div className="drawer-handle"></div>
            <div className="drawer-header">
              <h3>
                <FontAwesomeIcon
                  icon={faMagicWandSparkles}
                  className="ai-icon-purple"
                />{" "}
                Marketing Expert
              </h3>
              <button className="close-btn" onClick={() => setIsAiOpen(false)}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="drawer-content">
              {activeResponse ? (
                <div className="ai-response-area">
                  <div className="ai-text-bubble">
                    {displayedText}
                    {isTyping && <span className="typing-cursor">|</span>}
                  </div>
                  <div className="ai-response-actions">
                    {!isTyping && (
                      <>
                        <button
                          className="back-to-tips"
                          onClick={() => setActiveResponse("")}>
                          Ask something else
                        </button>
                        <button
                          type="button"
                          className="save-snippet-btn"
                          onClick={() => {
                            if (activeResponse) {
                              saveSnippet(activeResponse);
                              if (trackAction) trackAction("saved_snippet");
                            }
                          }}>
                          Save Snippet
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <p className="ai-intro">
                    How can I help you scale today,{" "}
                    {user?.fullname?.split(" ")[0]}?
                  </p>
                  <form
                    className="ai-input-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAskAi(customQuery);
                    }}>
                    <input
                      type="text"
                      placeholder={`Ask about your ${user?.category || "business"}...`}
                      value={customQuery}
                      onChange={(e) => setCustomQuery(e.target.value)}
                    />
                    <button type="submit" className="send-query-btn">
                      <FontAwesomeIcon icon={faMagicWandSparkles} />
                    </button>
                  </form>
                  <div className="ai-suggestions">
                    {randomTips.map((item, index) => (
                      <button key={index} onClick={() => handleAskAi(item)}>
                        {item.q}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </Suspense>

      <header className="header">
        <h1>
          {getGreeting()}, {user?.fullname?.split(" ")[0] || "CEO"}!
        </h1>
        <div className="header-actions">
          <button className="icon-btn ai-btn" onClick={() => setIsAiOpen(true)}>
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

            <div className="glass-card">
              <div className="strategy-badge">
                <span className="strategy-icon">{strategy.icon}</span>
                <p className="card-label">CEO STRATEGY</p>
              </div>
              <h2 className="card-main-title">{strategy.title}</h2>
              <p className="strategy-subtitle">{strategy.subtitle}</p>
              <div className="strategy-advice-box">
                <p>"{strategy.advice}"</p>
              </div>

              <button
                className="strategy-action-btn cta-btn"
                onClick={() =>
                  strategy.title.includes("Debt")
                    ? navigate("/sales-hub/debt-list")
                    : setIsAiOpen(true)
                }>
                Execute Strategy
              </button>
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
