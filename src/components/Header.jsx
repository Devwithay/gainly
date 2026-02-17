import { useLocation, useNavigate } from "react-router-dom";
import "./Header.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoon,
  faSun,
  faArrowLeft,
  faCode,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { mockProfile } from "../mocks/mockData";

export default function Header({ theme, toggleTheme }) {
  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useAuth();
  const [businessName, setBusinessName] = useState("Gainly");

  useEffect(() => {
    const fetch = async () => {
      if (!user) return;
      setBusinessName(mockProfile.business_name || "Gainly");
    };
    fetch();
  }, [user]);

  const isHome = location.pathname === "/dashboard";

  return (
    <header className="app-header">
      <div className="header-glass glass-card">
        <div className="header-left">
          {!isHome && (
            <button
              className="icon-btn glass-card"
              onClick={() => navigate(-1)}
              aria-label="Back">
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
          )}
        </div>

        <div className="header-center">
          <span className="header-logo glass-card">
            <FontAwesomeIcon icon={faCode} style={{ marginRight: 8 }} />{" "}
            {businessName}
          </span>
        </div>

        <div className="header-right">
          <button
            className="icon-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme">
            <FontAwesomeIcon icon={theme === "light" ? faMoon : faSun} />
          </button>
        </div>
      </div>
    </header>
  );
}
