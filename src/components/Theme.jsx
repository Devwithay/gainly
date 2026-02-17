import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTheme } from "../Context/ThemeProvider";

function ThemeBtn() {
  const { theme, toggle } = useTheme();
  return (
    <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
      <FontAwesomeIcon icon={theme === "light" ? faMoon : faSun} />
    </button>
  );
}

export default ThemeBtn;
