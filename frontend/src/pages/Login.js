import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async () => {
    console.log("🔥 Login button clicked");

    if (loading) return;

    const { email, password } = form;

    setError("");
    setSuccess("");

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

      const res = await fetch("http://localhost:4000/api/auth/login", {
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

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.name || "User");
        const isAdmin = email.trim().toLowerCase() === "varshachellapandiyan06@gmail.com" || data.role === "admin";
        localStorage.setItem("role", isAdmin ? "admin" : (data.role || "user"));
      }

      setSuccess("Login successful ✅");

      setForm({
        email: "",
        password: ""
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (err) {
      console.error("❌ LOGIN ERROR:", err);
      setError("Server not reachable ❌");
    }

    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo-circle">
          <span>👋</span>
        </div>
        <h2>Welcome Back</h2>

        {error && <div className="auth-msg auth-msg-error">{error}</div>}
        {success && <div className="auth-msg auth-msg-success">{success}</div>}

        <div className="auth-input-group">
          <input
            name="email"
            className="auth-input"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="auth-input-group">
          <input
            name="password"
            className="auth-input"
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            value={form.password}
            onChange={handleChange}
          />
          <span
            className="auth-input-eye"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🔓" : "🔒"}
          </span>
        </div>

        <button
          className="auth-button"
          onClick={handleLogin}
          disabled={loading || !form.email || !form.password}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="auth-link" onClick={() => navigate("/forgot-password")} style={{ marginTop: '15px' }}>
          Forgot Password?
        </p>

        <p style={{ marginTop: '20px', color: 'white' }}>
          Don’t have an account?{" "}
          <span className="auth-link-bold" onClick={() => navigate("/")}>
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;