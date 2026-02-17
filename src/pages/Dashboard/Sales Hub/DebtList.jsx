import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../Context Api/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faCheckCircle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import API_BASE_URL from "../../../apiConfig";
import "./DebtList.css";

const DebtList = ({ trackAction }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [debts, setDebts] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  const loadDebts = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/fetch-sales-history.php?phone=${user.phone}`,
      );
      const data = await res.json();

      const activeDebtors = Array.isArray(data)
        ? data.filter((s) => parseFloat(s.debt_balance) > 0)
        : [];

      setDebts(activeDebtors);
    } catch (err) {
      console.error("Failed to load debts");
    }
  };

  useEffect(() => {
    if (user) loadDebts();
  }, [user]);

  const handleResolve = async (id) => {
    setLoadingId(id);
    const fd = new FormData();
    fd.append("id", id);
    fd.append("status", "paid");

    try {
      const res = await fetch(`${API_BASE_URL}/update-sale-status.php`, {
        method: "POST",
        body: fd,
      });
      const result = await res.text();
      if (result.trim() === "success") {
        if (trackAction) trackAction("cleared_debt");
        setDebts((prev) => prev.filter((debt) => debt.id !== id));
      }
    } catch (err) {
      alert("Could not update status.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="expenses-container">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <h1>Unpaid Debts</h1>
      </header>

      <div className="history-list">
        {debts.length > 0 ? (
          debts.map((debt) => (
            <div key={debt.id} className="glass-card debt-card">
              <div className="debt-details">
                <div className="debt-header">
                  <h4>{debt.product_name}</h4>
                  <span className="niche-tag">{debt.category}</span>
                </div>
                <div className="debt-math">
                  <span className="total-label">
                    Total: ₦{Number(debt.amount).toLocaleString()}
                  </span>
                  <br />{" "}
                  <span className="balance-label">
                    Owing: <b>₦{Number(debt.debt_balance).toLocaleString()}</b>
                  </span>
                </div>
              </div>
              <button
                className="clear-btn"
                onClick={() => handleResolve(debt.id)}
                disabled={loadingId === debt.id}>
                {loadingId === debt.id ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  "Mark Fully Paid"
                )}
              </button>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <FontAwesomeIcon
              icon={faCheckCircle}
              size="3x"
              style={{ color: "#22c55e", marginBottom: "10px" }}
            />
            <p>Great job CEO! No one is owing you.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebtList;
