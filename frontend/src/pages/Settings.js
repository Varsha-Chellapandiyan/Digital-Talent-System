import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";

function Settings() {
  const navigate = useNavigate();

  // 🌙 GLOBAL DARK MODE
  const { darkMode, setDarkMode } = useContext(ThemeContext);

  const theme = darkMode ? dark : light;

  return (
    <div style={{ ...styles.container, color: theme.text }}>
      
      {/* SIDEBAR */}
      <div style={{ ...styles.sidebar, background: theme.sidebar }}>
        <h2>🚀 TaskPro</h2>

        <div style={styles.menuBox}>
          <NavLink to="/dashboard" style={({ isActive }) => linkStyle(isActive)}>
            📊 Dashboard
          </NavLink>

          <NavLink to="/tasks" style={({ isActive }) => linkStyle(isActive)}>
            📝 Tasks
          </NavLink>

          <NavLink to="/settings" style={({ isActive }) => linkStyle(isActive)}>
            ⚙️ Settings
          </NavLink>
        </div>

        <button
          style={styles.logout}
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        
        {/* HEADER */}
        <div style={styles.header}>
          <h1>Settings</h1>

          {/* 🌙 TOGGLE */}
          <button
            style={styles.toggle}
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* SETTINGS CARD */}
        <div style={{ ...styles.card, background: theme.card }}>
          <h3>Preferences</h3>

          <label>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />{" "}
            Enable Dark Mode
          </label>
        </div>

      </div>
    </div>
  );
}

export default Settings;

// 🎨 THEMES
const light = {
  bg: "#f8fafc",
  text: "#000",
  sidebar: "#0f172a",
  card: "#fff"
};

const dark = {
  bg: "#020617",
  text: "#e2e8f0",
  sidebar: "#020617",
  card: "#0f172a"
};

// 🎨 STYLES
const styles = {
  container: {
    display: "flex",
    height: "100vh"
  },

  sidebar: {
    width: 240,
    color: "#fff",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },

  menuBox: {
    display: "flex",
    flexDirection: "column",
    gap: 12
  },

  logout: {
    background: "red",
    color: "#fff",
    border: "none",
    padding: 10,
    borderRadius: 6,
    cursor: "pointer"
  },

  main: {
    flex: 1,
    padding: 30
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  toggle: {
    padding: 8,
    borderRadius: 6,
    border: "none",
    cursor: "pointer"
  },

  card: {
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)"
  }
};

// 🔗 ACTIVE LINK STYLE
const linkStyle = (isActive) => ({
  textDecoration: "none",
  padding: "8px 10px",
  borderRadius: 6,
  color: isActive ? "#fff" : "#94a3b8",
  background: isActive ? "#2563eb" : "transparent",
  fontWeight: isActive ? "bold" : "normal"
});