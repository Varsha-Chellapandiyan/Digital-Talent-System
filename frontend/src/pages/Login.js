import { useState } from "react";

function Login({ setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (loading) return;

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
      const res = await fetch("http://localhost:4000/api/auth/login", { // ✅ FIXED PORT
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim()
        })
      });

      // 🔥 SAFE RESPONSE HANDLING
      const text = await res.text();
      console.log("LOGIN RAW:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setError("Invalid server response ❌");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data.msg || "Login failed");
        setLoading(false);
        return;
      }

      // ✅ STORE TOKEN IF EXISTS
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      setSuccess(data.msg || "Login successful ✅");

      setEmail("");
      setPassword("");

      // 👉 OPTIONAL REDIRECT
      setTimeout(() => {
        alert("Login Success 🎉");
      }, 1000);

    } catch (error) {
      console.error("Login Error:", error);
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
          style={styles.input}
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
        />

        <div style={styles.inputWrapper}>
          <input
            style={styles.input}
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
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
            opacity: loading || !email || !password ? 0.7 : 1
          }}
          onClick={handleLogin}
          disabled={loading || !email || !password}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={styles.forgot} onClick={() => setPage("forgot")}>
          Forgot Password?
        </p>

        <p style={styles.text}>
          Don’t have an account?{" "}
          <span style={styles.link} onClick={() => setPage("register")}>
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
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column"
  },
  title: {
    textAlign: "center",
    marginBottom: "15px",
    color: "#333",
    fontWeight: "600"
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
    boxSizing: "border-box"
  },
  inputWrapper: {
    position: "relative",
    width: "100%"
  },
  eye: {
    position: "absolute",
    right: "10px",
    top: "15%",
    cursor: "pointer"
  },
  button: {
    padding: "10px",
    background: "#5c9412",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold"
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
    textAlign: "center",
    fontSize: "14px"
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
    textAlign: "center",
    fontSize: "13px"
  },
  success: {
    background: "#e6ffe6",
    color: "#2e7d32",
    padding: "8px",
    borderRadius: "5px",
    marginBottom: "10px",
    textAlign: "center",
    fontSize: "13px"
  }
};