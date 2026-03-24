import React, { useEffect } from "react";
import { CheckCircle } from "lucide-react";

const SuccessOverlay = ({ message, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="modal-overlay">
      <div className="modal-card glass">
        <div className="success-icon-wrapper">
          <CheckCircle size={60} className="gainly-green" />
        </div>
        <h2 className="modal-headline">Success!</h2>
        <p className="modal-subhead">{message}</p>
      </div>
    </div>
  );
};

export default SuccessOverlay;
