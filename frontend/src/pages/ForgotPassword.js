import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("");

  const navigate = useNavigate();

  const handleOtp = async () => {
    if (!email) return setMsg("Enter email ❗");

    setLoading(true);
    setMode("otp");
    setMsg("");

    try {
      localStorage.setItem("resetEmail", email);

      const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";
      const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) return setMsg(data.msg || "OTP failed ❌");

      setMsg("OTP sent to your email ✅");

      setTimeout(() => navigate("/otp"), 1000);

    } catch {
      setMsg("Server error ❌");
    }

    setLoading(false);
  };

  const handleEmail = async () => {
    if (!email) return setMsg("Enter email ❗");

    setLoading(true);
    setMode("email");
    setMsg("");

    try {
      const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) return setMsg(data.msg || "Email failed ❌");

      setMsg("Reset link sent to your email 📩");

    } catch {
      setMsg("Server error ❌");
    }

    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ padding: '60px 40px' }}>
        <div className="auth-logo-circle">
          <span>OTP</span>
        </div>
        <h2 style={{ marginBottom: '10px' }}>Forgot Password</h2>
        <p style={{ marginBottom: '30px', color: 'rgba(255,255,255,0.7)' }}>
            Enter your registered email to receive a reset link or OTP.
        </p>

        {msg && (
          <div className={`auth-msg ${msg.includes("❌") || msg.includes("❗") ? "auth-msg-error" : "auth-msg-success"}`}>
            {msg.includes("❌") || msg.includes("❗") ? "⚠️" : "✨"} {msg}
          </div>
        )}

        <div className="auth-input-group" style={{ marginBottom: '25px' }}>
          <input
            type="email"
            placeholder="example@company.com"
            className="auth-input"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />
        </div>

        <button
          className="auth-button"
          onClick={handleEmail}
          disabled={loading}
          style={{ marginBottom: '15px' }}
        >
          {loading && mode==="email" ? "Processing..." : "Reset via Email"}
        </button>

        <button
          className="auth-button"
          onClick={handleOtp}
          disabled={loading}
          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: 'white' }}
        >
          {loading && mode==="otp" ? "Processing..." : "Reset via OTP"}
        </button>

        <p onClick={()=>navigate("/")} className="auth-link" style={{ marginTop: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span>←</span> Back to Login
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;