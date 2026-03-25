import "./LoadingScreen.css";
const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="g-spinner">
      <span className="g-letter">G</span>
      <div className="spinner-ring"></div>
    </div>
    <p>Securing the bag...</p>
  </div>
);
export default LoadingScreen;
