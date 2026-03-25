import React, { useState, useContext, useEffect } from "react";
import "./Insights.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUp,
  faLightbulb,
  faChartPie,
  faArrowDown,
  faBullseye,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import API_BASE_URL from "../../apiConfig";
import { AuthContext } from "../../Context Api/AuthContext";
import LoadingScreen from "../../components/LoadingScreen";

const Insights = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d"); // 7d, 30d, all

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
  }, [user?.phone, timeRange]); // Re-run when timeRange changes

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
              style={{ backgroundColor: status.color }}>
              {status.label}
            </span>
          </p>
        </div>

        {/* HIGH-END TIME SELECTOR */}
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

      {/* Goal Card - Dynamically aligns with Revenue */}
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

      {/* Dynamic Niche Index */}
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

      <section
        className="glass-card retention-section"
        style={{ marginTop: "2rem" }}>
        <div className="section-header-flex">
          <h3 className="section-title">Retention & CLV Engine</h3>
          <span className="ai-badge">Goldmine AI</span>
        </div>

        <p className="retention-subtitle">
          Top 5 Customers & Re-engagement Status
        </p>

        <div className="retention-list">
          {data.retentionData && data.retentionData.length > 0 ? (
            data.retentionData.map((cust, idx) => {
              const isChurned = cust.days_ago >= 30;

              return (
                <div key={idx} className="retention-item">
                  <div className="cust-main-info">
                    <div className="cust-avatar">
                      {cust.customer_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="cust-details">
                      <p className="cust-name">{cust.customer_name}</p>
                      <p className="cust-clv">
                        Lifetime: ₦{Number(cust.total_spent).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="retention-actions">
                    {isChurned ? (
                      <div className="churn-box">
                        <span className="churn-alert">
                          ⚠️ Churned ({cust.days_ago} days)
                        </span>
                        <button
                          className="wa-automation-btn"
                          onClick={() => {
                            const msg = `Hi ${cust.customer_name}, we noticed you haven't shopped with ${user.businessName || "us"} in a while! Here is a special 5% discount just for you.`;
                            window.open(
                              `https://wa.me/${cust.customer_phone}?text=${encodeURIComponent(msg)}`,
                            );
                          }}>
                          Send 5% Discount
                        </button>
                      </div>
                    ) : (
                      <span className="status-active">✨ Active</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="empty-text">
              Start logging sales to see your Top Customers here.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Insights;
