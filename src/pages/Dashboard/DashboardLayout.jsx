import "./DashboardLayout.css";
import {
  faHome,
  faChartLine,
  faChartSimple,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink, Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <>
      <Outlet />

      <nav className="bottom-nav">
        <NavLink to="/dashboard" className="nav-item">
          <FontAwesomeIcon icon={faHome} size="lg" />
          <span>Home</span>
        </NavLink>
        <NavLink to="/sales-hub" className="nav-item">
          <FontAwesomeIcon icon={faChartLine} size="lg" />
          <span>Sales Hub</span>
        </NavLink>
        <NavLink to="/insights" className="nav-item">
          <FontAwesomeIcon icon={faChartSimple} size="lg" />
          <span>Insights</span>
        </NavLink>
        <NavLink to="/profile" className="nav-item">
          <FontAwesomeIcon icon={faUser} size="lg" />
          <span>Profile</span>
        </NavLink>
      </nav>
    </>
  );
}

export default DashboardLayout;
