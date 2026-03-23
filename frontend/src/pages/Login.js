import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  // ✅ HANDLE INPUT
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  // ✅ LOGIN FUNCTION
  const handleLogin = async () => {
    console.log("🔥 Login button clicked");

    if (loading) return;

    const { email, password } = form;

    setError("");
    setSuccess("");

    // ✅ VALIDATION
    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return;
    }

    setLoading(true);

    try {
      console.log("📡 Sending request...");

      const res = await fetch("http://192.168.2.75:4000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim()
        })
      });

      const data = await res.json();
      console.log("✅ LOGIN RESPONSE:", data);

      if (!res.ok) {
        setError(data.msg || "Login failed ❌");
        setLoading(false);
        return;
      }

      // ✅ SAVE TOKEN
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      setSuccess("Login successful ✅");

      // ✅ CLEAR FORM
      setForm({
        email: "",
        password: ""
      });

      // ✅ REDIRECT (optional)
      setTimeout(() => {
        alert("Login Success 🎉");
      }, 1000);

    } catch (err) {
      console.error("❌ LOGIN ERROR:", err);
      setError("Server not reachable ❌");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back</h2>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <input
          name="email"
          style={styles.input}
          type="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={handleChange}
        />

        <div style={styles.inputWrapper}>
          <input
            name="password"
            style={styles.input}
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
          />
          <span
            style={styles.eye}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "👁️" : "🙈"}
          </span>
        </div>

        <button
          style={{
            ...styles.button,
            opacity: loading || !form.email || !form.password ? 0.7 : 1
          }}
          onClick={handleLogin}
          disabled={loading || !form.email || !form.password}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={styles.forgot} onClick={() => navigate("/forgot")}>
          Forgot Password?
        </p>

        <p style={styles.text}>
          Don’t have an account?{" "}
          <span style={styles.link} onClick={() => navigate("/")}>
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;

// 🎨 STYLES
const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(to right, #232526, #414345)"
  },
  card: {
    width: "350px",
    padding: "30px",
    borderRadius: "12px",
    background: "#fff",
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)"
  },
  title: {
    textAlign: "center",
    marginBottom: "15px"
  },
  input: {
    width: "94%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc"
  },
  inputWrapper: {
    position: "relative"
  },
  eye: {
    position: "absolute",
    right: "10px",
    top: "15%",
    cursor: "pointer"
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#5c9412",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  forgot: {
    marginTop: "10px",
    textAlign: "right",
    color: "#007bff",
    cursor: "pointer",
    fontSize: "13px"
  },
  text: {
    marginTop: "15px",
    textAlign: "center"
  },
  link: {
    color: "#5c9412",
    cursor: "pointer",
    fontWeight: "bold"
  },
  error: {
    background: "#ffe6e6",
    color: "#d8000c",
    padding: "8px",
    borderRadius: "5px",
    marginBottom: "10px",
    textAlign: "center"
  },
  success: {
    background: "#e6ffe6",
    color: "#2e7d32",
    padding: "8px",
    borderRadius: "5px",
    marginBottom: "10px",
    textAlign: "center"
  }
};