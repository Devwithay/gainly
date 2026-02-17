import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../Context Api/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faReceipt,
  faShareNodes,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import "./Receipts.css";
import API_BASE_URL from "../../../apiConfig";
const Receipts = () => {
  const { user } = useContext(AuthContext);
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
    const date = new Date(sale.sale_date).toLocaleDateString();

    const message =
      `*RECEIPT FROM ${businessName.toUpperCase()}*%0A` +
      `--------------------------%0A` +
      `*Item:* ${sale.product_name}%0A` +
      `*Amount:* ₦${amount}%0A` +
      `*Date:* ${date}%0A` +
      `*Status:* ${(sale.status || "Completed").toUpperCase()}%0A` +
      `--------------------------%0A` +
      `Thank you so much for your patronage! ✨%0A%0A` +
      `_Track your sales and grow your business with Gainly._%0A` +
      `👉 *Create your own receipts here:* https://gainly.com.ng`;
    window.open(`https://wa.me/?text=${message}`, "_blank");
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
              <p className="receipt-subtitle">Transaction Acknowledgment</p>
              <div className="divider"></div>
            </div>

            <div className="receipt-body">
              <div className="r-item-row">
                <span className="label">Product</span>
                <span className="val">{selectedSale.product_name}</span>
              </div>
              <div className="r-item-row">
                <span className="label">Date</span>
                <span className="val">
                  {new Date(selectedSale.sale_date).toLocaleDateString()}
                </span>
              </div>
              <div className="r-item-row">
                <span className="label">Payment Status</span>
                <span className={`val status-tag ${selectedSale.status}`}>
                  {selectedSale.status === "paid" ? "✔ PAID" : "⚠ UNPAID"}
                </span>
              </div>

              <div className="price-section">
                <p>Total Amount</p>
                <h1 className="main-price">
                  ₦{Number(selectedSale.amount).toLocaleString()}
                </h1>
              </div>
            </div>

            <div className="receipt-footer">
              <p className="thanks-msg">
                "Thank you so much for your patronage! We truly value your
                business and hope to serve you again very soon."
              </p>
              <div className="barcode-stub">
                <span>
                  G-LY-{selectedSale.id}
                  {(selectedSale.vendor_phone || "").slice(-3)}
                </span>
              </div>
              <p className="power-by">Generated via Gainly Business Suite</p>
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
              Generate another receipt
            </button>
          </div>
        </div>
      ) : (
        /* THE LIST */
        <div className="history-list">
          <p style={{ color: "var(--muted)", fontSize: "14px" }}>
            Select a sale to generate a receipt
          </p>
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
                    ₦{Number(sale.amount).toLocaleString()}
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
