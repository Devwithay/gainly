import { NavLink } from "react-router-dom";
import "./FloatingNav.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faPlus, faChartBar, faUser } from "@fortawesome/free-solid-svg-icons";

export default function FloatingNav() {
  return (
    <nav className="floating-nav" aria-label="Main navigation">
      <div className="floating-nav-inner glass-card">
        <NavLink to="/dashboard" className="nav-icon" aria-label="Home">
          <FontAwesomeIcon icon={faHouse} />
        </NavLink>

        <NavLink to="/dashboard/add" className="nav-add" aria-label="Add sale">
          <FontAwesomeIcon icon={faPlus} />
        </NavLink>

        <NavLink to="/dashboard/insights" className="nav-icon" aria-label="Insights">
          <FontAwesomeIcon icon={faChartBar} />
        </NavLink>

        <NavLink to="/dashboard/profile" className="nav-icon" aria-label="Profile">
          <FontAwesomeIcon icon={faUser} />
        </NavLink>
      </div>
    </nav>
  );
}
