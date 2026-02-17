import React, { useState, useEffect, useContext } from "react";
import "./SalesHub.css";
import { AuthContext } from "../../../Context Api/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router";
import {
  faPlus,
  faListCheck,
  faWallet,
  faReceipt,
  faFileExport,
  faFileLines,
  faSearch,
  faFilter,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import API_BASE_URL from "../../../apiConfig";

const StatSkeleton = () => (
  <div className="stat-item glass-card skeleton-card">
    <div className="skeleton skel-label"></div>
    <div className="skeleton skel-val"></div>
  </div>
);

const ActionSkeleton = () => (
  <div className="action-card glass-card skeleton-card">
    <div className="skeleton skel-icon"></div>
    <div className="skeleton skel-text"></div>
  </div>
);

const SalesHub = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const [hubStats, setHubStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    todaySales: 0,
    unpaidTotal: 0,
  });

  useEffect(() => {
    const getHubStats = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/fetch-sales-hub-stats.php?phone=${user.phone}`,
        );
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          setHubStats(data);
        } catch (err) {
          console.error(
            "Server sent HTML instead of JSON. Look at this:",
            text,
          );
        }
      } catch (error) {
        console.error("Network error:", error);
      }
    };
    getHubStats();
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);
  const navigate = useNavigate();
  const handleExport = () => {
    window.location.href = `http://localhost/gainly-backend/export-csv.php?phone=${user.phone}`;
  };

  return (
    <div className="sales-hub-container">
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>

      <header className="hub-header">
        <h1>Sales Hub</h1>
        <p>Control center for your revenue</p>
      </header>

      <section className="stats-grid">
        {isLoading ? (
          <>
            <StatSkeleton /> <StatSkeleton />
            <StatSkeleton /> <StatSkeleton />
          </>
        ) : (
          <section className="stats-grid">
            <div className="stat-item glass-card">
              <span className="stat-label">Total Sales</span>
              <p className="stat-value">
                ₦{Number(hubStats.totalSales).toLocaleString()}
              </p>
            </div>
            <div className="stat-item glass-card">
              <span className="stat-label">Total Orders</span>
              <p className="stat-value">{hubStats.totalOrders}</p>
            </div>
            <div
              className="stat-item glass-card"
              onClick={() => navigate("/sales-hub/debt-list")}
              style={{ cursor: "pointer" }}>
              <span className="stat-label">Unpaid</span>
              <p className="stat-value alert-text">
                ₦{Number(hubStats.unpaidTotal || 0).toLocaleString()}
              </p>
            </div>
            <div className="stat-item glass-card">
              <span className="stat-label">Today</span>
              <p className="stat-value highlight-text">
                ₦{Number(hubStats.todaySales).toLocaleString()}
              </p>
            </div>
          </section>
        )}
      </section>

      <button
        className="primary-add-btn"
        onClick={() => navigate("/sales-hub/add-sale")}>
        <div className="btn-content">
          <div className="icon-circle">
            <FontAwesomeIcon icon={faPlus} />
          </div>
          <div className="text-group">
            <span className="btn-title">Add New Sale</span>
            <span className="btn-sub">Log a new order instantly</span>
          </div>
        </div>
        <FontAwesomeIcon icon={faChevronRight} className="arrow-icon" />
      </button>

      <section className="actions-grid">
        {isLoading ? (
          <>
            <ActionSkeleton /> <ActionSkeleton />
            <ActionSkeleton /> <ActionSkeleton />
          </>
        ) : (
          <>
            <div
              className="action-card glass-card"
              onClick={() => navigate("/sales-hub/track-sales")}>
              <FontAwesomeIcon
                icon={faListCheck}
                className="action-icon purple"
              />
              <span>Track Sales</span>
            </div>
            <div
              className="action-card glass-card"
              onClick={() => navigate("/sales-hub/expense-history")}>
              <FontAwesomeIcon icon={faWallet} className="action-icon green" />
              <span>Expenses</span>
            </div>
            <div
              className="action-card glass-card"
              onClick={() => navigate("/sales-hub/receipts")}>
              <FontAwesomeIcon icon={faReceipt} className="action-icon blue" />
              <span>Receipts</span>
            </div>
            <div className="action-card glass-card" onClick={handleExport}>
              <FontAwesomeIcon
                icon={faFileExport}
                className="action-icon orange"
              />
              <span>Export CSV</span>
            </div>
          </>
        )}
      </section>

      <section className="hub-section">
        <h4 className="section-title">Sales Reports</h4>
        <div className="glass-card report-preview">
          <div className="report-info">
            <FontAwesomeIcon icon={faFileLines} className="report-icon" />
            <div>
              <p className="main-p">Download-ready reports</p>
              <p className="sub-p">Weekly, Monthly, & Yearly</p>
            </div>
          </div>
          <span className="status-tag">Coming Soon</span>
        </div>
      </section>
    </div>
  );
};

export default SalesHub;
