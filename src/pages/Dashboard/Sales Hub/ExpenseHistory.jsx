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
import "./TrackSales.css";

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
      {" "}
      {/* Changed class to use the fixed container */}
      <div className="blob blob-orange"></div>
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <h1>Expense History</h1>
      </header>
      <div className="history-header-actions">
        <p style={{ color: "var(--muted)", fontSize: "14px" }}>
          Your spending logs
        </p>
        <button
          className="add-exp-inline-btn"
          onClick={() => navigate("/sales-hub/expenses")}>
          <FontAwesomeIcon icon={faPlus} />
          Add New
        </button>
      </div>
      <div className="history-list">
        {loading ? (
          <p>Loading expenses...</p>
        ) : expenses.length > 0 ? (
          expenses.map((exp) => (
            <div key={exp.id} className="glass-card sale-item">
              <div className="sale-info">
                <div
                  className="sale-icon-circle"
                  style={{
                    background: "rgba(234, 88, 12, 0.2)",
                    color: "#f97316",
                  }}>
                  <FontAwesomeIcon icon={faArrowDownWideShort} />
                </div>
                <div>
                  <h4>{exp.expense_name}</h4>
                  <p className="sale-date">
                    <span className="cat-tag" style={{ color: "#f97316" }}>
                      {exp.category}
                    </span>{" "}
                    • {new Date(exp.expense_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="sale-amount-area">
                <h3 className="sale-amount" style={{ color: "#fb7185" }}>
                  - ₦{Number(exp.amount).toLocaleString()}
                </h3>
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
  );
};

export default ExpenseHistory;
