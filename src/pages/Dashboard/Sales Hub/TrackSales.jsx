import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../Context Api/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faReceipt,
  faChartLine,
  faFilter,
  faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";
import API_BASE_URL from "../../../apiConfig";
import "./TrackSales.css";

const TrackSales = ({ trackAction }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/fetch-sales-history.php?phone=${user.phone}`,
        );
        const data = await res.json();
        setSales(data);
        setFilteredSales(data);
      } catch (err) {
        console.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchHistory();
  }, [user]);

  useEffect(() => {
    const filtered =
      activeFilter === "All"
        ? sales
        : sales.filter((s) => s.category === activeFilter);
    setFilteredSales(filtered);
  }, [activeFilter, sales]);

  const totalProfit = filteredSales.reduce((acc, sale) => {
    const profit = parseFloat(sale.amount) - parseFloat(sale.cost_price || 0);
    return acc + profit;
  }, 0);

  const totalRevenue = filteredSales.reduce(
    (acc, sale) => acc + parseFloat(sale.amount),
    0,
  );

  return (
    <div className="track-sales-container mobile-optimized">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <h1>Performance</h1>
      </header>

      <div className="glass-card summary-card">
        <div className="summary-item">
          <span className="label">Revenue ({activeFilter})</span>
          <h2 className="val">₦{totalRevenue.toLocaleString()}</h2>
        </div>
        <div className="summary-divider"></div>
        <div className="summary-item">
          <span className="label">Est. Profit</span>
          <h2 className="val profit-text">₦{totalProfit.toLocaleString()}</h2>
        </div>
      </div>

      <div className="filter-section">
        <label>
          <FontAwesomeIcon icon={faFilter} /> Filter Niche
        </label>
        <select
          className="mobile-select"
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}>
          <option value="All">All Businesses</option>
          {user?.categories?.map((cat, i) => (
            <option key={i} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="history-list">
        {loading ? (
          <div className="loader-box">
            <p>Analyzing records...</p>
          </div>
        ) : filteredSales.length > 0 ? (
          filteredSales.map((sale) => {
            const saleProfit =
              parseFloat(sale.amount) - parseFloat(sale.cost_price || 0);
            return (
              <div key={sale.id} className="glass-card sale-item-v2">
                <div className="sale-main-row">
                  <div className="sale-brand-info">
                    <span className="category-tag">{sale.category}</span>
                    <h4>{sale.product_name}</h4>
                    <span className="type-label">{sale.item_type}</span>
                  </div>
                  <div className="sale-price-info">
                    <h3 className="sale-amount">
                      ₦{Number(sale.amount).toLocaleString()}
                    </h3>
                    <span
                      className={`status-tag ${parseFloat(sale.debt_balance) > 0 ? "owing" : "paid"}`}>
                      {parseFloat(sale.debt_balance) > 0
                        ? `Debt: ₦${Number(sale.debt_balance).toLocaleString()}`
                        : "Cleared"}
                    </span>
                  </div>
                </div>

                <div className="sale-footer-row">
                  <div className="profit-badge">
                    <FontAwesomeIcon icon={faChartLine} /> Profit: ₦
                    {saleProfit.toLocaleString()}
                  </div>
                  <span className="date-text">
                    {new Date(sale.sale_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">No sales found for this category.</div>
        )}
      </div>
    </div>
  );
};

export default TrackSales;
