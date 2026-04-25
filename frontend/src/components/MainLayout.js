import { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import { Toaster } from "react-hot-toast";
import { ShieldCheck, UserCircle } from "../pages/Icons";

const MainLayout = ({ children, title }) => {
  const navigate = useNavigate();
  const { darkMode, setDarkMode, sidebarOpen, setSidebarOpen } = useContext(ThemeContext);
  const role = (localStorage.getItem("role") || "user").toLowerCase();
  const userName = localStorage.getItem("userName") || "User";

  const linkStyle = (isActive) => ({
    textDecoration: "none",
    padding: "16px 20px",
    borderRadius: "16px",
    fontSize: "15px",
    fontWeight: isActive ? "700" : "500",
    color: "#fff",
    background: isActive ? "rgba(255, 255, 255, 0.2)" : "transparent",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    transition: "all 0.3s ease",
    marginBottom: "8px",
    border: isActive ? "1px solid rgba(255, 255, 255, 0.3)" : "1px solid transparent"
  });

  return (
    <div style={styles.container}>
      <Toaster />

      {/* 🚀 SIDEBAR */}
      <aside style={{
        ...styles.sidebar,
        width: sidebarOpen ? 280 : 0,
        opacity: sidebarOpen ? 1 : 0,
        padding: sidebarOpen ? "40px 25px" : "40px 0",
      }}>
        <div style={styles.sidebarBrand}>🚀 TaskPro</div>
        <div style={styles.menuBox}>
          <NavLink to="/dashboard" style={({ isActive }) => linkStyle(isActive)}>📊 Dashboard</NavLink>
          <NavLink to="/tasks" style={({ isActive }) => linkStyle(isActive)}>📝 Tasks</NavLink>
          <NavLink to="/settings" style={({ isActive }) => linkStyle(isActive)}>⚙️ Settings</NavLink>
        </div>
        
        <div style={styles.sidebarBottom}>
           <button style={styles.logout} onClick={() => { localStorage.clear(); navigate("/"); }}>
             <span>🚪</span> Logout
           </button>
        </div>
      </aside>

      {/* 🖥️ MAIN CONTENT */}
      <div style={styles.main}>
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <button style={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? "✕" : "☰"}
            </button>
            <div style={styles.titleContainer}>
              {role === "admin" ? (
                <h1 style={styles.brandTitle}>
                  <ShieldCheck size={36} color="var(--primary)" /> ADMIN DASHBOARD
                </h1>
              ) : (
                <h1 style={styles.brandTitle}>
                  <UserCircle size={36} color="var(--primary)" /> USER DASHBOARD
                </h1>
              )}
              {userName !== "User" && (
                <div style={styles.welcomeBox}>
                  <span style={styles.welcomeText}>Welcome, {userName}</span>
                </div>
              )}
            </div>
          </div>

          <button style={styles.themeToggle} onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀️" : "🌙"}
          </button>
        </header>

        <section style={styles.contentBody}>
          {children}
        </section>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    width: "100vw",
    background: "transparent",
    color: "white",
    overflow: "hidden"
  },
  sidebar: {
    height: "100vh",
    background: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRight: "1px solid rgba(255, 255, 255, 0.15)",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    boxSizing: "border-box",
    zIndex: 1000,
    overflow: "hidden"
  },
  sidebarBrand: { 
    fontSize: "28px", 
    fontWeight: "900", 
    color: "#fff", 
    letterSpacing: "-1px", 
    marginBottom: "50px",
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  menuBox: { display: "flex", flexDirection: "column", flex: 1 },
  sidebarBottom: { marginTop: "auto" },
  logout: { 
    background: "rgba(239, 68, 68, 0.15)", 
    color: "#ff8a8a", 
    border: "1px solid rgba(239, 68, 68, 0.3)", 
    padding: "14px", 
    borderRadius: "16px", 
    cursor: "pointer", 
    fontWeight: "700", 
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    transition: "0.2s"
  },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  header: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: "40px 50px", 
    background: "transparent" 
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "25px" },
  menuToggle: { 
    background: "rgba(255,255,255,0.1)", 
    border: "1px solid rgba(255,255,255,0.2)", 
    fontSize: "20px", 
    color: "#fff", 
    cursor: "pointer", 
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "0.2s"
  },
  titleContainer: {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    width: "100%",
    pointerEvents: "none"
  },
  brandTitle: { 
    fontSize: "30px", 
    fontWeight: "900", 
    letterSpacing: "-1.5px", 
    background: "linear-gradient(135deg, #00eeff 0%, #ffffff 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textShadow: "0 0 20px rgba(0, 238, 255, 0.5)",
    display: "flex",
    alignItems: "center",
    gap: "18px",
    textTransform: "uppercase",
    margin: 0,
    pointerEvents: "auto"
  },
  pageTitle: { fontSize: "32px", fontWeight: "800", letterSpacing: "-0.5px", color: "var(--text-main)" },
  welcomeBox: { display: "flex", alignItems: "center", gap: "10px", marginTop: "5px" },
  statusAdmin: { 
    background: "rgba(255, 255, 255, 0.2)", 
    color: "#fff", 
    padding: "4px 12px", 
    borderRadius: "20px", 
    fontSize: "11px", 
    fontWeight: "800", 
    textTransform: "uppercase",
    letterSpacing: "1px",
    border: "1px solid rgba(255, 255, 255, 0.3)"
  },
  welcomeText: { color: "var(--text-muted)", fontSize: "15px", fontWeight: "500" },
  themeToggle: { 
    background: "rgba(255,255,255,0.1)", 
    border: "1px solid rgba(255,255,255,0.2)", 
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    cursor: "pointer", 
    fontSize: "20px", 
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  contentBody: { flex: 1, overflowY: "auto", padding: "0 50px 50px 50px" }
};

export default MainLayout;
