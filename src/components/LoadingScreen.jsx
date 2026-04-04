import "./LoadingScreen.css";

const LoadingScreen = ({ message = "Analyzing your growth..." }) => (
  <div className="loading-screen">
    <div className="g-spinner">
      <span className="g-letter">G</span>
      <div className="spinner-ring"></div>
    </div>
    <p className="loading-text">{message}</p>
  </div>
);

export default LoadingScreen;
