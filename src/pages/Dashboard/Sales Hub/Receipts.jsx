import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../Context Api/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faReceipt,
  faShareNodes,
} from "@fortawesome/free-solid-svg-icons";
import "./Receipts.css";
import API_BASE_URL from "../../../apiConfig";

const Receipts = () => {
  const { user, onboardingStep, completeStep } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/fetch-sales-history.php?phone=${user.phone}`)
      .then((res) => res.json())
      .then((data) => setSales(data));
  }, [user]);

  const handleWhatsAppShare = (sale) => {
    const businessName = user.bname || "Our Store";
    const amount = Number(sale.amount).toLocaleString();
    const paid = Number(sale.amount_paid).toLocaleString();
    const balance = Number(sale.debt_balance).toLocaleString();
    const date = new Date(sale.sale_date).toLocaleDateString();
    const product = sale.product_name;

    const customer = sale.customer_name || "Valued Customer";
    const payment = sale.payment_method || "Not Specified";
    const closingMessage =
      `Hey ${customer}, thanks for choosing *${businessName}*! %0A` +
      `We hope you enjoy your *${product}*. Your support keeps our small business thriving! 🚀`;
    const message =
      `*RECEIPT FROM ${businessName.toUpperCase()}*%0A` +
      `--------------------------%0A` +
      `*Receipt No:* G-LY-${sale.id}%0A` +
      `*Customer:* ${customer}%0A` +
      `--------------------------%0A` +
      `*Item:* ${sale.product_name}%0A` +
      `*Total Amount:* ₦${amount}%0A` +
      `*Paid:* ₦${paid}%0A` +
      `*Balance:* ₦${balance}%0A` +
      `*Payment Method:* ${payment}%0A` +
      `*Date:* ${date}%0A` +
      `--------------------------%0A` +
      `${closingMessage}%0A%0A` +
      `_Generated via Gainly Business Suite._%0A` +
      `👉 *Create your own receipts here:* https://gainly.com.ng`;

    window.open(`https://wa.me/?text=${message}`, "_blank");
    if (onboardingStep === 6) completeStep(6);
  };

  return (
    <div className="expenses-container">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <h1>Receipts</h1>
      </header>

      {selectedSale ? (
        <div className="receipt-view animate-in">
          <div className="receipt-paper">
            <div className="receipt-top-design"></div>
            <div className="receipt-header">
              <h2 className="vendor-name">{user.bname || "GAINLY VENDOR"}</h2>
              <p className="receipt-subtitle">Official Receipt</p>
              <div className="divider"></div>
            </div>

            <div className="receipt-body">
              <div className="r-item-row">
                <span className="label">Receipt No</span>
                <span className="val">#G-LY-{selectedSale.id}</span>
              </div>
              <div className="r-item-row">
                <span className="label">Customer</span>
                <span className="val">
                  {selectedSale.customer_name || "Valued Customer"}
                </span>
              </div>
              <div className="r-item-row">
                <span className="label">Product</span>
                <span className="val">{selectedSale.product_name}</span>
              </div>
              <div className="r-item-row">
                <span className="label">Payment Via</span>
                <span className="val">
                  {selectedSale.payment_method || "Not Specified"}
                </span>
              </div>
              <div className="r-item-row">
                <span className="label">Date</span>
                <span className="val">
                  {new Date(selectedSale.sale_date).toLocaleDateString()}
                </span>
              </div>

              <div className="price-section">
                <div className="r-item-row">
                  <p>Total</p>
                  <b>₦{Number(selectedSale.amount).toLocaleString()}</b>
                </div>
                <div className="r-item-row">
                  <p>Paid</p>
                  <b>₦{Number(selectedSale.amount_paid).toLocaleString()}</b>
                </div>
                <div className="divider"></div>
                <p>Balance Due</p>
                <h1 className="main-price">
                  ₦{Number(selectedSale.debt_balance).toLocaleString()}
                </h1>
              </div>
            </div>

            <div className="receipt-footer">
              <p className="thanks-msg">"Thank you for your patronage!"</p>
              <div className="barcode-stub">
                <span>
                  G-LY-{selectedSale.id}-
                  {(selectedSale.vendor_phone || "").slice(-3)}
                </span>
              </div>
              <p className="power-by">Powered by Gainly Business Suite</p>
            </div>
            <div className="receipt-bottom-edge"></div>
          </div>

          <div className="receipt-actions">
            <button
              className="cta-btn share-btn"
              onClick={() => handleWhatsAppShare(selectedSale)}>
              <FontAwesomeIcon icon={faShareNodes} /> Send to Customer
            </button>
            <button
              className="back-to-list"
              onClick={() => setSelectedSale(null)}>
              Back to history
            </button>
          </div>
        </div>
      ) : (
        <div className="history-list">
          {sales.map((sale) => (
            <div
              key={sale.id}
              className="glass-card sale-item"
              onClick={() => setSelectedSale(sale)}>
              <div className="sale-info">
                <FontAwesomeIcon
                  icon={faReceipt}
                  className="blue"
                  style={{ marginRight: "10px" }}
                />
                <div>
                  <h4>{sale.product_name}</h4>
                  <p className="sale-date">
                    {sale.customer_name} • ₦
                    {Number(sale.amount).toLocaleString()}
                  </p>
                </div>
              </div>
              <FontAwesomeIcon icon={faShareNodes} style={{ opacity: 0.5 }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Receipts;
