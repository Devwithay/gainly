import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../Context Api/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faReceipt,
  faShareNodes,
  faDownload,
  faFileLines,
  faShieldHalved,
  faChevronRight,
  faImage,
} from "@fortawesome/free-solid-svg-icons";

import "../../../App.css";
import "./Receipts.css";
import LoadingScreen from "../../../components/LoadingScreen";
import API_BASE_URL from "../../../apiConfig";

const Receipts = () => {
  const { user, onboardingStep, completeStep } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [format, setFormat] = useState("image");
  const receiptRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/fetch-sales-history.php?phone=${user.phone}`)
      .then((res) => res.json())
      .then((data) => {
        setSales(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  const downloadReceipt = async () => {
    if (receiptRef.current) {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: null,
        scale: 3,
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `Gainly_Receipt_${selectedSale.id}.png`;
      link.click();
    }
  };

  const handleWhatsAppShare = async (sale) => {
    if (format === "image" && receiptRef.current) {
      try {
        const html2canvas = (await import("html2canvas")).default;
        const canvas = await html2canvas(receiptRef.current, {
          backgroundColor: "#ffffff",
          scale: 2,
        });

        canvas.toBlob(async (blob) => {
          const file = new File([blob], `Gainly_Receipt_${sale.id}.png`, {
            type: "image/png",
          });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `Receipt from ${user.bname || "Gainly Vendor"}`,
            });
          } else {
            alert(
              "Your browser doesn't support direct image sharing. Please use 'Save Image' and send manually, or switch to 'WhatsApp Text' mode.",
            );
          }
        }, "image/png");

        if (onboardingStep === 6) completeStep(6);
        return;
      } catch (error) {
        console.error("Error sharing image:", error);
      }
    }

    const businessName = user.bname || "Our Store";
    const amount = Number(sale.amount).toLocaleString();
    const paid = Number(sale.amount_paid).toLocaleString();
    const balance = Number(sale.debt_balance).toLocaleString();
    const date = new Date(sale.sale_date).toLocaleDateString();
    const product = sale.product_name;
    const customer = sale.customer_name || "Valued Customer";
    const payment = sale.payment_method || "Not Specified";

    const message =
      `*RECEIPT FROM ${businessName.toUpperCase()}*%0A` +
      `--------------------------%0A` +
      `*Receipt No:* G-LY-${sale.id}%0A` +
      `*Customer:* ${customer}%0A` +
      `--------------------------%0A` +
      `*Item:* ${product}%0A` +
      `*Total Amount:* ₦${amount}%0A` +
      `*Paid:* ₦${paid}%0A` +
      `*Balance:* ₦${balance}%0A` +
      `*Payment Method:* ${payment}%0A` +
      `*Date:* ${date}%0A` +
      `--------------------------%0A` +
      `Hey ${customer}, thanks for choosing *${businessName}*! Your support keeps our small business thriving! 🚀%0A%0A` +
      `_Generated via Gainly Business Suite._%0A` +
      `👉 *Create your own receipts here:* https://gainly.com.ng`;

    window.open(`https://wa.me/?text=${message}`, "_blank");
    if (onboardingStep === 6) completeStep(6);
  };
  if (loading)
    return <LoadingScreen message="Preparing your official receipts..." />;

  return (
    <div className="receipts-container">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <h1>Receipts</h1>
      </header>

      {selectedSale ? (
        <div className="receipt-view animate-in">
          <div className="format-toggle-container">
            <div className={`toggle-slider ${format}`}></div>
            <button
              className={`toggle-btn ${format === "image" ? "active" : ""}`}
              onClick={() => setFormat("image")}>
              <FontAwesomeIcon icon={faImage} /> Digital Image
            </button>
            <button
              className={`toggle-btn ${format === "text" ? "active" : ""}`}
              onClick={() => setFormat("text")}>
              <FontAwesomeIcon icon={faFileLines} /> WhatsApp Text
            </button>
          </div>

          {format === "image" ? (
            <div className="image-receipt-wrapper">
              <div className="receipt-card" ref={receiptRef}>
                <div className="card-top-id">
                  <span className="gainly-id-pill">G-LY-{selectedSale.id}</span>
                  <div className="status-badge">
                    <div className="dot"></div> Success
                  </div>
                </div>

                <div className="card-header-centered">
                  <div className="gainly-seal">G</div>
                  <h2 className="vendor-name-premium">
                    {user.bname || "Gainly Vendor"}
                  </h2>
                  <p className="receipt-date-stamp">
                    {new Date(selectedSale.sale_date).toLocaleTimeString()} •{" "}
                    {new Date(selectedSale.sale_date).toLocaleDateString()}
                  </p>
                </div>

                <div className="card-amount-block">
                  <span className="label-top">Transaction Amount</span>
                  <h1 className="main-price-display">
                    ₦{Number(selectedSale.amount).toLocaleString()}
                  </h1>
                </div>

                <div className="receipt-details-list">
                  <div className="detail-row">
                    <span className="d-label">Customer</span>
                    <span className="d-val">
                      {selectedSale.customer_name || "Valued Customer"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="d-label">Product/Service</span>
                    <span className="d-val">{selectedSale.product_name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="d-label">Payment Method</span>
                    <span className="d-val">
                      {selectedSale.payment_method || "Not Specified"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="d-label">Amount Paid</span>
                    <span className="d-val">
                      ₦{Number(selectedSale.amount_paid).toLocaleString()}
                    </span>
                  </div>

                  <div
                    className={`detail-row balance-row ${Number(selectedSale.debt_balance) > 0 ? "has-debt" : ""}`}>
                    <span className="d-label">Balance Due</span>
                    <span className="d-val">
                      ₦{Number(selectedSale.debt_balance).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="card-footer-secured">
                  <div className="secured-tag">
                    <FontAwesomeIcon
                      icon={faShieldHalved}
                      className="shield-icon"
                    />
                    <span>Secured by Gainly Business Suite</span>
                  </div>
                  <p>
                    {" "}
                    Hey {selectedSale.customer_name}, thanks for choosing{" "}
                    {user.bname}! Your support keeps our small business
                    thriving!
                  </p>
                  <p className="copyright-tiny">
                    Official Digital Proof of Purchase
                  </p>
                </div>
              </div>

              <div className="action-row">
                <button
                  className="apple-btn secondary"
                  onClick={downloadReceipt}>
                  <FontAwesomeIcon icon={faDownload} /> Save Image
                </button>
                <button
                  className="apple-btn primary"
                  onClick={() => handleWhatsAppShare(selectedSale)}>
                  <FontAwesomeIcon icon={faShareNodes} /> Send WhatsApp
                </button>
              </div>
            </div>
          ) : (
            <div className="text-receipt-preview">
              <div className="preview-box">
                <p>
                  Your receipt text is formatted and ready for WhatsApp. This
                  format is tamper-resistant and easy for customers to read.
                </p>
              </div>
              <button
                className="apple-btn primary"
                onClick={() => handleWhatsAppShare(selectedSale)}>
                <FontAwesomeIcon icon={faShareNodes} /> Send Text Receipt
              </button>
            </div>
          )}

          <button className="back-link" onClick={() => setSelectedSale(null)}>
            Close Receipt
          </button>
        </div>
      ) : (
        /* History List */
        <div className="history-list">
          {sales.length > 0 ? (
            sales.map((sale) => (
              <div
                key={sale.id}
                className="glass-card sale-item"
                onClick={() => setSelectedSale(sale)}>
                <div className="sale-info">
                  <div className="icon-wrap">
                    <FontAwesomeIcon icon={faReceipt} />
                  </div>
                  <div>
                    <h4>{sale.product_name}</h4>
                    <p>
                      {sale.customer_name} • ₦
                      {Number(sale.amount).toLocaleString()}
                    </p>
                  </div>
                </div>
                <FontAwesomeIcon icon={faChevronRight} className="chevron" />
              </div>
            ))
          ) : (
            <div className="empty-state">No receipts found.</div>
          )}
        </div>
      )}
    </div>
  );
};
export default Receipts;
