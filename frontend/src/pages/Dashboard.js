import { useEffect, useState, useCallback, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getTasks } from "../services/taskService";
import toast, { Toaster } from "react-hot-toast";
import { ThemeContext } from "../context/ThemeContext";

function Dashboard() {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useContext(ThemeContext);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔐 AUTH CHECK
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/"); // ✅ FIXED
  }, [navigate]);

  // 📡 LOAD TASKS
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTasks();
      setTasks(res?.data || []);
    } catch {
      toast.error("Failed to load tasks ❌");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // 📊 STATS
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const pending = total - completed;

  if (loading) return <h2 style={{ padding: 20 }}>Loading...</h2>;

  const theme = darkMode ? dark : light;

  return (
    <div style={{ ...styles.container, background: theme.bg, color: theme.text }}>
      <Toaster />

      {/* SIDEBAR */}
      <div style={{ ...styles.sidebar, background: theme.sidebar }}>
        <h2 style={{ marginBottom: 20 }}>🚀 TaskPro</h2>

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
            navigate("/"); // ✅ FIXED
          }}
        >
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        {/* HEADER */}
        <div style={styles.header}>
          <h1>Dashboard</h1>

          <button
            style={styles.toggle}
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* WELCOME */}
        <div style={styles.welcome}>
          <h2>Welcome back 👋</h2>
          <p>Here’s your task overview</p>
        </div>

        {/* STATS */}
        <div style={styles.statsGrid}>
          <div style={{ ...styles.statCard, background: theme.card }}>
            📌 Total <br /><b>{total}</b>
          </div>

          <div style={{ ...styles.statCard, background: theme.card }}>
            ✅ Completed <br /><b>{completed}</b>
          </div>

          <div style={{ ...styles.statCard, background: theme.card }}>
            ⏳ Pending <br /><b>{pending}</b>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

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
    minHeight: "100vh",
    width: "100%"
  },

  sidebar: {
    width: 240,
    height: "100vh",          // ✅ FULL HEIGHT
    position: "fixed",        // ✅ FIXED SIDEBAR
    left: 0,
    top: 0,
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
    marginLeft: 240,          // ✅ SPACE FOR SIDEBAR
    padding: 30,
    minHeight: "100vh"
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

  welcome: {
    marginTop: 20,
    marginBottom: 20
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 20
  },

  statCard: {
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