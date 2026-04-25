import { useState } from "react";
import "./auth.css";
import { loginUser, registerUser } from "../services/authService";
import { useNavigate } from "react-router-dom";

function Auth() {
  const [isActive, setIsActive] = useState(() => {
    const showLogin = localStorage.getItem("showLogin");
    if (showLogin) {
      localStorage.removeItem("showLogin");
      return false;
    }
    return true;
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return setMsg("Enter all credentials ❗");

    setLoading(true);
    setMsg("");

    try {
      const res = await loginUser({ email, password });
      if (res.token) {
        localStorage.setItem("token", res.token);
        const isAdmin = email.trim().toLowerCase() === "varshachellapandiyan06@gmail.com" || res.role === "admin";
        localStorage.setItem("role", isAdmin ? "admin" : (res.role || "user"));
        navigate("/dashboard");
      } else {
        setMsg(res.msg || "Login failed ❌");
      }
    } catch {
      setMsg("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return setMsg("Fill all fields ❗");

    setLoading(true);
    setMsg("");

    try {
      const res = await registerUser({ name, email, password });
      if (res.msg === "User registered successfully") {
        setMsg("✨Account created! Access your dashboard below");
        setTimeout(() => setIsActive(false), 1500);
      } else {
        setMsg(res.msg || "Registration failed ❌");
      }
    } catch {
      setMsg("Server error ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className={`auth-sliding-container ${isActive ? "active" : ""}`}>
        <div className="form-container sign-up">
          <form onSubmit={handleRegister}>
            <h1 style={{ marginBottom: '10px' }}>Create Account</h1>
            <p style={{ marginBottom: '20px', fontSize: '14px', opacity: 0.8 }}>Join the Digital Talent System</p>

            {msg && isActive && (
              <div className={`auth-msg ${msg.includes("❌") || msg.includes("❗") ? "auth-msg-error" : "auth-msg-success"}`}>
                {msg}
              </div>
            )}

            <div className="auth-input-group">
              <input className="auth-input" type="text" placeholder="Full Name" onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="auth-input-group">
              <input className="auth-input" type="email" placeholder="Email Address" onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="auth-input-group">
              <input className="auth-input" type="password" placeholder="Secure Password" onChange={(e) => setPassword(e.target.value)} />
            </div>

            <button className="auth-button" disabled={loading}>
              {loading ? "Processing..." : "Sign Up"}
            </button>
          </form>
        </div>

        <div className="form-container sign-in">
          <form onSubmit={handleLogin}>
            <h1 style={{ marginBottom: '10px' }}>Sign In</h1>
            <p style={{ marginBottom: '20px', fontSize: '14px', opacity: 0.8 }}>Access your professional dashboard</p>

            {msg && !isActive && (
              <div className={`auth-msg ${msg.includes("❌") || msg.includes("❗") ? "auth-msg-error" : "auth-msg-success"}`}>
                {msg}
              </div>
            )}

            <div className="auth-input-group">
              <input className="auth-input" type="email" placeholder="Email Address" onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="auth-input-group">
              <input className="auth-input" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
            </div>

            <button className="auth-button" disabled={loading}>
              {loading ? "Authorizing..." : "Sign In"}
            </button>
            <p
              className="auth-link"
              onClick={() => navigate("/forgot-password")}
              style={{ marginTop: '20px' }}
            >
              Forgot Password?
            </p>
          </form>
        </div>

        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Welcome Back!</h1>
              <p>Already have an account?</p>
              <button
                className="auth-button"
                style={{ width: 'auto', padding: '12px 45px', background: 'transparent', border: '1px solid white', color: 'white' }}
                onClick={() => { setIsActive(false); setMsg(""); }}
              >
                Sign In
              </button>
            </div>

            <div className="toggle-panel toggle-right">
              <h1>Hello Friend!</h1>
              <p>🎯Start your journey with us✨</p>
              <button
                className="auth-button"
                style={{ width: 'auto', padding: '12px 45px', background: 'transparent', border: '1px solid white', color: 'white' }}
                onClick={() => { setIsActive(true); setMsg(""); }}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
