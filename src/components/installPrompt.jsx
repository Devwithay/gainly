import React, { useState, useEffect } from "react";
import "./InstallPrompt.css";
import logo from "../assets/logo.jpg";

const InstallPrompt = () => {
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState("");

  useEffect(() => {
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    if (isStandalone) return;

    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isAndroid = /Android/.test(navigator.userAgent);

    if (isIOS) {
      setPlatform("ios");
      setShow(true);

      setTimeout(() => setShow(false), 8000);
    }

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      setPlatform("android");
      setShow(true);
    });
  }, []);

  const handleAndroidInstall = async () => {
    const promptEvent = window.deferredPrompt;
    if (!promptEvent) return;
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted") setShow(false);
    window.deferredPrompt = null;
  };

  if (!show) return null;

  return (
    <div className="install-overlay">
      <div className="install-card">
        <img src={logo} alt="Gainly Logo" className="app-logo-mini" />
        <div className="install-text">
          <h4>Install Gainly</h4>
          <p>
            {platform === "ios"
              ? 'Tap "Share" then "Add to Home Screen" for the full CEO experience.'
              : "Get the app on your home screen for faster access."}
          </p>
        </div>
        {platform === "android" ? (
          <button onClick={handleAndroidInstall} className="install-btn">
            Install
          </button>
        ) : (
          <div className="ios-pointer-container">
            <div className="ios-arrow">↓</div>
            <p className="ios-instruction">
              Tap the <strong>Share</strong> button <br />
              then <strong>'Add to Home Screen'</strong>
            </p>
          </div>
        )}
        <button className="close-btn" onClick={() => setShow(false)}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
