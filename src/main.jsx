import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider } from "./Context Api/useTheme";
import "./App.css";
import { AiProvider } from "./Context Api/AiContext";
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/serviceWorker.js")
      .then((reg) => console.log("Service Worker registered!", reg))
      .catch((err) => console.log("Service Worker failed:", err));
  });
}
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AiProvider>
          <App />
        </AiProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
