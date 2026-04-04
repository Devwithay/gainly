import React, { useState, useContext, useEffect, useRef } from "react";
import "./Insights.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { toPng } from "html-to-image";
import {
  faArrowUp,
  faLightbulb,
  faChartPie,
  faArrowDown,
  faBullseye,
  faCalendarAlt,
  faShareNodes,
} from "@fortawesome/free-solid-svg-icons";
import API_BASE_URL from "../../apiConfig";
import { AuthContext } from "../../Context Api/AuthContext";
import LoadingScreen from "../../components/LoadingScreen";

const Insights = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [showQuietInfo, setShowQuietInfo] = useState(false);
  const [customDate, setCustomDate] = useState({ start: "", end: "" });
  const [error, setError] = useState(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const getInsights = async () => {
      const isCustomReady =
        timeRange === "custom" && customDate.start && customDate.end;
      const isStandardRange = timeRange !== "custom";

      if (isStandardRange || isCustomReady) {
        // If we already have data, show the subtle refresher, otherwise full screen
        if (data) setIsRefreshing(true);
        else setLoading(true);

        setError(null);

        let url = `${API_BASE_URL}/fetch-insights-data.php?phone=${user.phone}&range=${timeRange}`;
        if (timeRange === "custom") {
          url += `&start=${customDate.start}&end=${customDate.end}`;
        }

        try {
          const [resStats, resRetention] = await Promise.all([
            fetch(url),
            fetch(`${API_BASE_URL}/fetch-retention.php?phone=${user.phone}`),
          ]);

          if (!resStats.ok) throw new Error("Server Error");

          const stats = await resStats.json();
          const retention = await resRetention.json();

          setData({
            ...stats,
            retentionData: Array.isArray(retention) ? retention : [],
          });
        } catch (err) {
          setError("Failed to sync data.");
          console.error(err);
        } finally {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    };
    if (user?.phone) getInsights();
  }, [user?.phone, timeRange, customDate.start, customDate.end]);

  const shareAreaRef = useRef(null);
  const [showShare, setShowShare] = useState(false);

  const handleShare = async () => {
    if (shareAreaRef.current === null) return;
    try {
      const dataUrl = await toPng(shareAreaRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `Gainly-Flex-${new Date().getTime()}.png`;
      link.href = dataUrl;
      link.click();
      setShowShare(false);
    } catch (err) {
      console.error("Share failed", err);
    }
  };

  const totalCustomers = data?.retentionData?.length || 0;
  const topCustomer = data?.retentionData?.[0]?.customer_name || "New Legend";
  const atRiskAmount =
    data?.retentionData
      ?.filter((c) => c.days_ago >= 30)
      .reduce((sum, c) => sum + Number(c.total_spent), 0) || 0;

  if (loading && !data)
    return <LoadingScreen message="Calculating growth..." />;

  const revenue = Number(data?.revenue || 0);
  const netProfit = Number(data?.netProfit || 0);
  const expenses = Number(data?.expenses || 0);
  const currentTarget = Number(user?.salesGoal || 500000);
  const goalProgress = (revenue / currentTarget) * 100;

  const getStatus = (profit) => {
    if (profit > 100000) return { label: "Market Leader", color: "#8b5cf6" };
    if (profit > 0) return { label: "Profitable", color: "#22c55e" };
    if (profit < 0) return { label: "In Debt", color: "#ef4444" };
    return { label: "Bootstrapping", color: "#f59e0b" };
  };

  const InlineSpinner = () => <div className="inline-spinner"></div>;
  const status = getStatus(netProfit);
  const chartValues = Array.isArray(data?.chartData)
    ? data.chartData
    : [0, 0, 0, 0, 0, 0, 0];
  const nicheList = Array.isArray(data?.nicheData) ? data.nicheData : [];

  return (
    <div className={`insights-container ${isRefreshing ? "data-syncing" : ""}`}>
      {error && <div className="error-toast">{error}</div>}

      {/* Subtle syncing bar so the user knows it's working without the UI disappearing */}
      {isRefreshing && <div className="sync-loader"></div>}

      <header className="insights-header">
        <h1>Performance</h1>
        <div className="filter-container">
          <label className="time-selector-wrapper">
            <FontAwesomeIcon icon={faCalendarAlt} className="cal-icon" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}>
              <option value="7d">Past 7 Days</option>
              <option value="30d">This Month</option>
              <option value="all">All Time</option>
              <option value="custom">Custom Range</option>
            </select>
            <span className="dropdown-arrow">▾</span>
          </label>

          {timeRange === "custom" && (
            <div className="premium-date-picker">
              <div className="date-input-group">
                <input
                  type="date"
                  value={customDate.start}
                  onChange={(e) =>
                    setCustomDate((prev) => ({
                      ...prev,
                      start: e.target.value,
                    }))
                  }
                />
                <div className="date-sep">to</div>
                <input
                  type="date"
                  value={customDate.end}
                  onChange={(e) =>
                    setCustomDate((prev) => ({ ...prev, end: e.target.value }))
                  }
                />

                {isRefreshing && <InlineSpinner />}
              </div>
            </div>
          )}
        </div>
      </header>

      <section className="glass-card goal-card">
        <div className="goal-header">
          <span>
            <FontAwesomeIcon icon={faBullseye} />{" "}
            {timeRange === "7d" ? "Weekly" : "Monthly"} Goal
          </span>
          <span className="goal-percent">
            {Math.min(Math.round(goalProgress), 100)}%
          </span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(goalProgress, 100)}%` }}></div>
        </div>
        <div className="goal-footer">
          <span>₦{revenue.toLocaleString()}</span>
          <span>Target: ₦{currentTarget.toLocaleString()}</span>
        </div>
      </section>
      {/* Main Stats Grid */}
      <div className="metrics-grid">
        <div className="glass-card mini-metric">
          <div className="metric-info">
            <span className="label">Net Profit</span>
            <span
              className="val"
              style={{ color: netProfit >= 0 ? "#22c55e" : "#ef4444" }}>
              ₦{netProfit.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="glass-card mini-metric">
          <div className="metric-info">
            <span className="label">Total Expenses</span>
            <span className="val" style={{ color: "#ef4444" }}>
              ₦{expenses.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      <section className="niche-war-room">
        <h3 className="section-title">Niche Profitability Index</h3>
        <div className="niche-grid">
          {nicheList.map((niche, idx) => {
            const efficiency = Math.round(niche.efficiency || 0);
            return (
              <div key={idx} className="glass-card niche-stat-card">
                <div className="niche-card-header">
                  <h4>{niche.category}</h4>
                  <span
                    className={`efficiency-tag ${efficiency > 40 ? "high" : "low"}`}>
                    {efficiency}% Margin
                  </span>
                </div>
                <div className="niche-main-metrics">
                  <div className="metric">
                    <label>Revenue</label>
                    <p>₦{Number(niche.revenue).toLocaleString()}</p>
                  </div>
                  <div className="metric">
                    <label>Profit</label>
                    <p>₦{Number(niche.profit).toLocaleString()}</p>
                  </div>
                </div>
                <div className="niche-health-bar">
                  <div
                    className="health-fill"
                    style={{ width: `${Math.min(efficiency, 100)}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      {/* Chart Section */}
      <section className="glass-card chart-card">
        <h3>Revenue Trend (7D)</h3>
        <div className="visual-chart">
          {chartValues.map((val, i) => (
            <div key={i} className="bar-container">
              <div
                className="bar"
                style={{
                  height: `${(val / (Math.max(...chartValues, 1) || 1)) * 100}%`,
                  backgroundColor:
                    val > 0 ? "#7c3aed" : "rgba(255,255,255,0.1)",
                }}></div>
              <span>{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="glass-card goldmine-section">
        <div className="section-header-flex">
          <h3>Customer Goldmine</h3>
          <span className="ai-badge">Real-time AI</span>
        </div>
        <p className="goldmine-subtitle">
          We found ₦{atRiskAmount.toLocaleString()} sitting in "quiet"
          customers.
          <span
            className="learn-more-link"
            onClick={() => setShowQuietInfo(true)}>
            {" "}
            Learn More
          </span>
        </p>
        {showQuietInfo && (
          <div
            className="info-modal-overlay"
            onClick={() => setShowQuietInfo(false)}>
            <div
              className="info-modal-content"
              onClick={(e) => e.stopPropagation()}>
              <div className="info-modal-icon">🤫</div>
              <h3>What are "Quiet" Customers?</h3>
              <p>
                These are customers who used to buy from you but haven't spent a
                kobo in over <strong>30 days</strong>.
              </p>
              <div className="advice-box">
                <strong>💡 Lead's Advice:</strong>
                <p>
                  Don't let them forget you! Tap "Win Back" to send a quick
                  WhatsApp discount. It’s 5x cheaper to keep an old customer
                  than to find a new one.
                </p>
              </div>
              <button
                className="understood-btn"
                onClick={() => setShowQuietInfo(false)}>
                Understood
              </button>
            </div>
          </div>
        )}
        <div className="retention-list">
          {data.retentionData.slice(0, 5).map((cust, idx) => (
            <div key={idx} className="goldmine-item">
              <div className="cust-info">
                <div className="cust-avatar">
                  {cust.customer_name.charAt(0)}
                </div>
                <div>
                  <p className="cust-name">
                    {cust.customer_name} {idx === 0 && "🏆"}
                  </p>
                  <p className="cust-clv">
                    Spent ₦{Number(cust.total_spent).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="cust-status">
                {cust.days_ago >= 30 ? (
                  <button
                    className="winback-btn"
                    onClick={() => {
                      /* your whatsapp logic */
                    }}>
                    Win Back
                  </button>
                ) : (
                  <span className="active-pill">Loyal</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {showShare && (
        <div className="share-overlay">
          <div className="share-modal">
            <div className="share-capture-area" ref={shareAreaRef}>
              <div className="flex-card-glass" ref={shareAreaRef}>
                <div className="glass-inner">
                  <div className="flex-logo">
                    GAINLY <span className="logo-dot">.</span>
                  </div>

                  <div className="flex-main-content">
                    <p className="flex-label">BUSINESS STATUS</p>
                    <h2 className="flex-status-text">{status.label}</h2>
                    <div className="flex-divider"></div>

                    <div className="flex-stats-grid">
                      <div className="flex-stat-item">
                        <label>Revenue</label>
                        <p>₦{revenue.toLocaleString()}</p>
                      </div>
                      <div className="flex-stat-item">
                        <label>Net Profit</label>
                        <p>₦{netProfit.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-footer-glass">
                    <p>Verified on Gainly Business Hub</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-buttons">
              <button className="download-btn" onClick={handleShare}>
                Save Image
              </button>
              <button className="close-btn" onClick={() => setShowShare(false)}>
                Not Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Insights;
