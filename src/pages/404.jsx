import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRotateLeft,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import "./404.css";

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="error-blob"></div>
      <div className="glass-card error-card">
        <div className="error-icon">
          <FontAwesomeIcon icon={faTriangleExclamation} />
        </div>
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Inventory Item Not Found</h2>
        <p className="error-text">
          The page you are looking for has been moved, deleted, or never existed
          in our records.
        </p>
        <button className="back-btn" onClick={() => navigate("/")}>
          <FontAwesomeIcon icon={faRotateLeft} />
          Return to HQ
        </button>
      </div>
    </div>
  );
};

export default PageNotFound;
