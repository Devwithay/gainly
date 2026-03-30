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
  useEffect(() => {
    const getInsights = async () => {
      setLoading(true);
      try {
        const [resStats, resRetention] = await Promise.all([
          fetch(
            `${API_BASE_URL}/fetch-insights-data.php?phone=${user.phone}&range=${timeRange}`,
          ),
          fetch(`${API_BASE_URL}/fetch-retention.php?phone=${user.phone}`),
        ]);

        const stats = await resStats.json();
        const retention = await resRetention.json();

        setData({
          ...stats,
          retentionData: Array.isArray(retention) ? retention : [],
        });
      } catch (err) {
        console.error("Insight Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.phone) getInsights();
  }, [user?.phone, timeRange]);

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

  if (loading || !data)
    return <LoadingScreen message="Calculating your growth..." />;

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

  const status = getStatus(netProfit);
  const chartValues = Array.isArray(data?.chartData)
    ? data.chartData
    : [0, 0, 0, 0, 0, 0, 0];
  const nicheList = Array.isArray(data?.nicheData) ? data.nicheData : [];

  return (
    <div className="insights-container">
      <header className="insights-header">
        <div>
          <h1>Performance</h1>
          <p>
            Status:{" "}
            <span
              className="status-tag"
              style={{
                backgroundColor: `${status.color}20`,
                color: status.color,
                padding: "4px 12px",
                borderRadius: "12px",
                fontSize: "0.85rem",
                fontWeight: "700",
              }}>
              {status.label}
            </span>
          </p>
        </div>
        <button className="share-btn" onClick={() => setShowShare(true)}>
          <FontAwesomeIcon icon={faShareNodes} /> Flex
        </button>
        <div className="time-selector">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}>
            <option value="7d">Past 7 Days</option>
            <option value="30d">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </header>
      Zz{" "}
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
      {/* 3. THE SHARE MODAL (Put this at the very end of your JSX, before the closing </div>) */}
      {showShare && (
        <div className="share-overlay">
          <div className="share-modal">
            <div className="share-capture-area" ref={shareAreaRef}>
              <div className="flex-card">
                <div className="flex-logo">GAINLY</div>
                <div className="flex-header">
                  <p>BUSINESS STATUS</p>
                  <h2>Absolute Boss</h2>
                </div>
                <div className="flex-stats-grid">
                  <div className="flex-stat">
                    <label>Revenue Logged</label>
                    <p>₦{revenue.toLocaleString()}</p>
                  </div>
                  <div className="flex-stat">
                    <label>Net Profit</label>
                    <p>₦{netProfit.toLocaleString()}</p>
                  </div>
                  <div className="flex-stat">
                    <label>Top Customer</label>
                    <p>{topCustomer}</p>
                  </div>
                  <div className="flex-stat">
                    <label>Customer Base</label>
                    <p>{totalCustomers} Active</p>
                  </div>
                </div>
                <div className="flex-footer">
                  <p>Tracking growth on Gainly. ✨</p>
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
