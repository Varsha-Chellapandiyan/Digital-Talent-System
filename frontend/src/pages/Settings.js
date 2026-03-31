import { useContext, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import toast, { Toaster } from "react-hot-toast";

function Settings() {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useContext(ThemeContext);

  // ✅ PROFILE STATES
  const [name, setName] = useState(localStorage.getItem("name") || "");
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [phone, setPhone] = useState(localStorage.getItem("phone") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [bio, setBio] = useState(localStorage.getItem("bio") || "");
  const [profilePic, setProfilePic] = useState(
    localStorage.getItem("profilePic") || ""
  );

  // 🔐 PASSWORD
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const theme = darkMode ? dark : light;

  // ✅ IMAGE UPLOAD
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePic(reader.result);
      localStorage.setItem("profilePic", reader.result);
    };
    reader.readAsDataURL(file);
  };

  // ✅ PROFILE UPDATE
  const handleProfileUpdate = () => {
    if (!name || !email) {
      return toast.error("Name & Email required ❌");
    }

    if (!email.includes("@")) {
      return toast.error("Invalid email ❌");
    }

    if (phone && phone.length < 10) {
      return toast.error("Invalid phone ❌");
    }

    localStorage.setItem("name", name);
    localStorage.setItem("email", email);
    localStorage.setItem("phone", phone);
    localStorage.setItem("role", role);
    localStorage.setItem("bio", bio);

    toast.success("Profile updated ✅");
  };

  // 🔐 PASSWORD CHANGE
  const handlePasswordChange = () => {
    if (!password || !confirmPassword) {
      return toast.error("Fill all fields ❌");
    }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match ❌");
    }

    toast.success("Password updated ✅");
    setPassword("");
    setConfirmPassword("");
  };

  // 🔥 RESET
  const handleReset = () => {
    localStorage.clear();
    toast.success("Account reset ✅");
    navigate("/login");
  };

  return (
    <div style={{ ...styles.container, background: theme.bg, color: theme.text }}>
      <Toaster />

      {/* SIDEBAR */}
      <div style={{ ...styles.sidebar, background: theme.sidebar }}>
        <h2>🚀 TaskPro</h2>

        <div style={styles.menuBox}>
          <NavLink to="/dashboard" style={({ isActive }) => linkStyle(isActive)}>📊 Dashboard</NavLink>
          <NavLink to="/tasks" style={({ isActive }) => linkStyle(isActive)}>📝 Tasks</NavLink>
          <NavLink to="/settings" style={({ isActive }) => linkStyle(isActive)}>⚙️ Settings</NavLink>
        </div>

        <button style={styles.logout} onClick={() => {
          localStorage.clear();
          navigate("/login");
        }}>
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        {/* HEADER */}
        <div style={styles.header}>
          <h1>Settings</h1>

          <button style={styles.toggle} onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>

        {/* PROFILE */}
        <div style={styles.card(theme)}>
          <h2>👤 Profile</h2>

          {/* IMAGE */}
          <div style={{ textAlign: "center" }}>
            <img
              src={profilePic || "https://via.placeholder.com/100"}
              alt="profile"
              style={styles.avatar}
            />
            <input type="file" onChange={handleImageUpload} />
          </div>

          <div style={styles.field}>
            <label>Name</label>
            <input style={styles.input(theme)} value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div style={styles.field}>
            <label>Email</label>
            <input style={styles.input(theme)} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div style={styles.field}>
            <label>Phone</label>
            <input style={styles.input(theme)} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div style={styles.field}>
            <label>Role</label>
            <input style={styles.input(theme)} value={role} onChange={(e) => setRole(e.target.value)} />
          </div>

          <div style={styles.field}>
            <label>Bio</label>
            <textarea style={{ ...styles.input(theme), height: 80 }} value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>

          <button style={styles.primaryBtn} onClick={handleProfileUpdate}>
            Save Changes
          </button>
        </div>

        {/* ACCOUNT INFO */}
        <div style={styles.card(theme)}>
          <h2>📊 Account Info</h2>
          <p><b>Name:</b> {name}</p>
          <p><b>Email:</b> {email}</p>
          <p><b>Phone:</b> {phone || "Not set"}</p>
          <p><b>Role:</b> {role || "Not set"}</p>
        </div>

        {/* PASSWORD */}
        <div style={styles.card(theme)}>
          <h2>🔒 Change Password</h2>

          <div style={styles.field}>
            <label>New Password</label>
<div style={styles.passwordBox}>
  <input
    type={showNewPassword ? "text" : "password"}
    style={styles.input(theme)}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />

  <button
    style={styles.eyeBtn}
    onClick={() => setShowNewPassword(!showNewPassword)}
  >
    {showNewPassword ? "🙈" : "👁"}
  </button>
</div>          </div>

          <div style={styles.field}>
            <label>Confirm Password</label>
<div style={styles.passwordBox}>
  <input
    type={showConfirmPassword ? "text" : "password"}
    style={styles.input(theme)}
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
  />

  <button
    style={styles.eyeBtn}
    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
  >
    {showConfirmPassword ? "🙈" : "👁"}
  </button>
</div>          </div>

          <button style={styles.primaryBtn} onClick={handlePasswordChange}>
            Update Password
          </button>
        </div>

        {/* RESET */}
        <button style={styles.dangerBtn} onClick={handleReset}>
          Reset Account
        </button>

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
  card: "#fff",
  input: "#fff"
};

const dark = {
  bg: "#020617",
  text: "#fff",
  sidebar: "#020617",
  card: "#0f172a",
  input: "#020617"
};


// 🎨 STYLES
const styles = {
  container: { display: "flex", height: "100vh" },

  sidebar: {
    width: 240,
    color: "#fff",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },

  menuBox: { display: "flex", flexDirection: "column", gap: 12 },

  logout: {
    background: "red",
    color: "#fff",
    border: "none",
    padding: 10,
    borderRadius: 6,
    cursor: "pointer"
  },

  main: { flex: 1, padding: 30, overflowY: "auto" },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  toggle: {
    padding: "8px 16px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    background: "#000000",
    color: "#fff",
    fontWeight: "bold"
  },

  card: (theme) => ({
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    background: theme.card,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    maxWidth: 420
  }),

  field: {
    display: "flex",
    flexDirection: "column",
    gap: 5
  },

  input: (theme) => ({
    padding: 8,
    borderRadius: 6,
    border: "1px solid #ccc",
    background: theme.input,
    color: theme.text
  }),

  primaryBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: 10,
    borderRadius: 6,
    cursor: "pointer"
  },

  dangerBtn: {
    marginTop: 20,
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: 12,
    borderRadius: 6,
    cursor: "pointer",
    maxWidth: 200
  },

  passwordBox: {
  display: "flex",
  alignItems: "center",
  gap: 8
},

eyeBtn: {
  border: "none",
  background: "#2563eb",
  color: "#fff",
  padding: "6px 10px",
  borderRadius: 6,
  cursor: "pointer",
  fontSize: 12
},

  avatar: {
    width: 100,
    height: 100,
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: 10
  }
};


// 🔗 LINK STYLE
const linkStyle = (isActive) => ({
  color: isActive ? "#fff" : "#94a3b8",
  background: isActive ? "#2563eb" : "transparent",
  padding: 8,
  borderRadius: 6,
  textDecoration: "none"
});