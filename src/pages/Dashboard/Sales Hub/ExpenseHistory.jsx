import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../Context Api/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faArrowDownWideShort,
  faCalendar,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import API_BASE_URL from "../../../apiConfig";
import "./Expenses.css";
import LoadingScreen from "../../../components/LoadingScreen";
const ExpenseHistory = ({ trackAction }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/fetch-expense-history.php?phone=${user.phone}`,
        );
        const data = await res.json();
        setExpenses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchExpenses();
      if (trackAction) trackAction("viewed_expenses");
    }
  }, [user]);

  return (
    <div className="expenses-container">
      <div className="blob-orange"></div>

      {/* This wrapper is key for scannability and z-index depth */}
      <div className="expenses-content-wrapper">
        <header className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <h1 className="premium-title">Expense History</h1>
        </header>

        <div className="history-header-actions">
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "14px",
              fontWeight: "600",
            }}>
            Your spending logs
          </p>
          <button
            id="btn-add-expense"
            className="add-exp-inline-btn"
            onClick={() => navigate("/sales-hub/expenses")}
            style={{ position: "relative", zIndex: 20 }} // Force it to the front
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Add New</span>
          </button>
        </div>

        <div className="history-list">
          {loading ? (
            <LoadingScreen message="Categorizing your spending..." />
          ) : expenses.length > 0 ? (
            expenses.map((exp) => (
              <div
                key={exp.id}
                className="glass-card sale-item-v2 liquid-variant">
                <div className="sale-main-row">
                  <div className="sale-brand-info">
                    <span className="category-tag">{exp.category}</span>
                    <h4>{exp.expense_name}</h4>
                    <p className="date-text">
                      {new Date(exp.expense_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="sale-price-info">
                    <h3 className="sale-amount" style={{ color: "#ef4444" }}>
                      - ₦{Number(exp.amount).toLocaleString()}
                    </h3>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No expenses recorded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseHistory;
