import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../Context Api/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faSpinner,
  faCheckCircle,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import API_BASE_URL from "../../../apiConfig";
import "./AddSale.css";

const AddSale = ({ trackAction }) => {
  const { user, completeStep, onboardingStep } = useContext(AuthContext);
  const navigate = useNavigate();

  const [product, setProduct] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [cost, setCost] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    user?.categories?.[0] || "General",
  );
  const [itemType, setItemType] = useState("product");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const normalize = (val) => {
    if (!val) return 0;
    let clean = val.toString().toLowerCase().trim().replace(/,/g, "");
    if (clean.endsWith("k")) return parseFloat(clean) * 1000;
    if (clean.endsWith("m")) return parseFloat(clean) * 1000000;
    return parseFloat(clean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalTotal = normalize(totalAmount);
    const finalPaid = normalize(amountPaid);
    const finalCost = normalize(cost);

    if (!product || !finalTotal) {
      alert("Please enter product name and total price.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("phone", user.phone);
    formData.append("product", product);
    formData.append("amount", finalTotal);
    formData.append("amount_paid", finalPaid);
    formData.append("cost_price", finalCost);
    formData.append("category", selectedCategory);
    formData.append("item_type", itemType);

    try {
      const response = await fetch(`${API_BASE_URL}/add-sale.php`, {
        method: "POST",
        body: formData,
      });
      const result = await response.text();

      if (result.trim() === "success") {
        if (trackAction) trackAction("logged_a_sale");

        if (onboardingStep === 3) {
          completeStep(3);
        }

        setSuccess(true);
        setTimeout(() => navigate("/sales-hub"), 1500);
      } else {
        alert("Server error: " + result);
      }
    } catch (err) {
      alert("Network error. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-sale-container">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <h1>Log Order</h1>
      </header>

      <div className="glass-card add-sale-card">
        {success ? (
          <div className="success-state">
            <FontAwesomeIcon icon={faCheckCircle} className="success-icon" />
            <h3>Sale Recorded!</h3>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faTag} /> Which Business?
              </label>
              <select
                className="custom-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}>
                {user?.categories?.map((cat, i) => (
                  <option key={i} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Product/Service Name</label>
              <input
                type="text"
                placeholder="e.g. Wig Installation"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Total Price (₦)</label>
                <input
                  type="text"
                  placeholder="e.g. 50k"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Amount Paid (₦)</label>
                <input
                  type="text"
                  placeholder="e.g. 20k"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Cost Price (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 15k"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>

            <div className="item-type-toggle">
              <button
                type="button"
                className={itemType === "product" ? "active" : ""}
                onClick={() => setItemType("product")}>
                Product
              </button>
              <button
                type="button"
                className={itemType === "service" ? "active" : ""}
                onClick={() => setItemType("service")}>
                Service
              </button>
            </div>

            <button
              type="submit"
              className="cta-btn submit-btn"
              disabled={isSubmitting}>
              {isSubmitting ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                "Log Sale"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddSale;
