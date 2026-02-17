import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../Context Api/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faSpinner,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import API_BASE_URL from "../../../apiConfig";
import "./Expenses.css";

const Expenses = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Stock");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogExpense = async (e) => {
    e.preventDefault();

    let finalAmount = amount.toString().toLowerCase().trim();
    if (finalAmount.endsWith("k")) finalAmount = parseFloat(finalAmount) * 1000;
    else if (finalAmount.endsWith("m"))
      finalAmount = parseFloat(finalAmount) * 1000000;
    else finalAmount = parseFloat(finalAmount);

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("phone", user.phone);
    formData.append("item", item);
    formData.append("amount", finalAmount);
    formData.append("category", category);

    try {
      const res = await fetch(`${API_BASE_URL}/add-expense.php?`, {
        method: "POST",
        body: formData,
      });
      if ((await res.text()) === "success") {
        alert("Expense logged!");
        navigate("/sales-hub");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="expenses-container">
      <div className="blob blob-orange"></div>

      <header className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <h1>Log Expense</h1>
      </header>

      <div className="glass-card expense-card">
        <form onSubmit={handleLogExpense}>
          <div className="form-group">
            <label>What did you pay for?</label>
            <input
              type="text"
              placeholder="e.g. Delivery to Ikeja"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Amount (Shortcuts allowed: 2k, 10k)</label>
            <input
              type="text"
              placeholder="₦ 0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}>
              <option>Delivery</option>
              <option>Transport</option>
              <option>Marketing</option>
              <option>Data</option>
              <option>Other bills</option>
            </select>
          </div>

          <button
            type="submit"
            className="cta-btn expense-btn"
            disabled={isSubmitting}>
            {isSubmitting ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              "Log Expense"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Expenses;
