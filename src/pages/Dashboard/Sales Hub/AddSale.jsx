import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../Context Api/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faCheckCircle,
  faCirclePlus,
  faUserAstronaut,
  faWallet,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import API_BASE_URL from "../../../apiConfig";
import "./AddSale.css";
import LoadingScreen from "../../../components/LoadingScreen";

const AddSale = ({ trackAction }) => {
  const { user, completeStep, onboardingStep } = useContext(AuthContext);
  const navigate = useNavigate();

  const [product, setProduct] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Transfer");
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

  const isFormValid = product.trim().length > 0 && normalize(totalAmount) > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) return;

    if ("vibrate" in navigator) {
      navigator.vibrate([100, 50, 100]);
    }

    setIsSubmitting(true);
    const finalTotal = normalize(totalAmount);

    const formData = new FormData();
    formData.append("phone", user.phone);
    formData.append("product", product);
    formData.append("customer_name", customerName || "Valued Customer");
    formData.append("payment_method", paymentMethod);
    formData.append("amount", finalTotal);
    formData.append("amount_paid", normalize(amountPaid));
    formData.append("cost_price", normalize(cost));
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
        if (onboardingStep === 3) completeStep(3);

        setIsSubmitting(false);
        setSuccess(true);

        setTimeout(() => navigate("/sales-hub"), 1500);
      } else {
        alert("Error: " + result);
        setIsSubmitting(false);
      }
    } catch (err) {
      alert("Network error.");
      setIsSubmitting(false);
    }
  };

  // Render logic priority
  if (isSubmitting) return <LoadingScreen message="Recording your profit..." />;

  return (
    <div className="add-sale-page">
      <header className="add-sale-header">
        <button className="icon-btn-back" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <h1>Log Order</h1>
        <div className="header-dot"></div>
      </header>

      <div className="add-sale-content">
        {success ? (
          /* THIS WILL NOW SHOW PROPERLY */
          <div
            className="success-overlay"
            style={{ textAlign: "center", padding: "50px 20px" }}>
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="success-icon-glow"
              style={{
                fontSize: "80px",
                color: "#27ae60",
                marginBottom: "20px",
              }}
            />
            <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>
              Sale Logged!
            </h2>
            <p>Your business is growing, CEO! 🚀</p>
          </div>
        ) : (
          <form className="gainly-form" onSubmit={handleSubmit}>
            <section className="form-card highlight">
              <div className="input-box">
                <label>
                  <FontAwesomeIcon icon={faTag} /> Which Business?
                </label>
                <select
                  className="gainly-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}>
                  {user?.categories?.map((cat, i) => (
                    <option key={i} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            <section className="form-card">
              <div className="input-box">
                <label>Customer Name</label>
                <div className="input-wrapper">
                  <FontAwesomeIcon
                    icon={faUserAstronaut}
                    className="input-icon"
                  />
                  <input
                    type="text"
                    placeholder="e.g. Faizah"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-box">
                <label>Product / Service Name*</label>
                <input
                  type="text"
                  placeholder="e.g. Wig Installation"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="input-box">
                  <label>Total Price (₦)*</label>
                  <input
                    type="text"
                    placeholder="50k"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="input-box">
                  <label>Amount Paid (₦)</label>
                  <input
                    type="text"
                    placeholder="20k"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                  />
                </div>
              </div>
            </section>
            <section className="form-card secondary">
              <div className="input-box">
                <label>Cost Price (Optional)</label>
                <input
                  type="text"
                  placeholder="15k"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                />
              </div>

              <div className="type-pill-toggle">
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

              <div className="input-box">
                <label>
                  <FontAwesomeIcon icon={faWallet} /> Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="POS">POS</option>
                  <option value="Split">Split Payment</option>
                </select>
              </div>
            </section>

            <button
              type="submit"
              className={`gainly-submit-btn ${!isFormValid ? "disabled-btn" : ""}`}
              disabled={!isFormValid}
              style={{
                opacity: isFormValid ? 1 : 0.5,
                cursor: isFormValid ? "pointer" : "not-allowed",
              }}>
              <FontAwesomeIcon icon={faCirclePlus} /> Log Sale
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddSale;
