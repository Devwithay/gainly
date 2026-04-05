import "./LoadingScreen.css";
import { useState, useEffect } from "react";
function LoadingScreen({ message = "Analyzing your growth..." }) {
  const [showHint, setShowHint] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowHint(true), 3000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="loading-screen">
      <div className="g-spinner">
        <span className="g-letter">G</span>
        <div className="spinner-ring"></div>
      </div>
      <p className="loading-text">{message}</p>
      {showHint && (
        <p className="fade-in" style={{ fontSize: "12px", opacity: 0.6 }}>
          Taking a while? Your connection might be slow. Hanging tight...
        </p>
      )}
    </div>
  );
}

export default LoadingScreen;
