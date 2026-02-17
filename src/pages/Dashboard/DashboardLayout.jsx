import "./DashboardLayout.css";
import {
  faHome,
  faChartLine,
  faChartSimple,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <>
      <Outlet />

      <nav className="bottom-nav">
        <Link to="/dashboard" className="nav-item">
          <FontAwesomeIcon icon={faHome} size="lg" />
          <span>Home</span>
        </Link>
        <Link to="/sales-hub" className="nav-item">
          <FontAwesomeIcon icon={faChartLine} size="lg" />
          <span>Sales Hub</span>
        </Link>
        <Link to="/insights" className="nav-item">
          <FontAwesomeIcon icon={faChartSimple} size="lg" />
          <span>Insights</span>
        </Link>
        <Link to="/profile" className="nav-item">
          <FontAwesomeIcon icon={faUser} size="lg" />
          <span>Profile</span>
        </Link>
      </nav>
    </>
  );
}

export default DashboardLayout;
