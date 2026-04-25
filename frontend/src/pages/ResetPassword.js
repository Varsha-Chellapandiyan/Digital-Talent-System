import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./auth.css";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");

  const handleReset = async () => {
    if (password !== confirm) return setMsg("Mismatch ❌");

    const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";
    const res = await fetch(`${API_BASE}/api/auth/reset-password/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    const data = await res.json();

    if (!res.ok) return setMsg(data.msg);

    setMsg("Success ✅");

    setTimeout(() => navigate("/"), 1000);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ padding: '60px 40px' }}>
        <div className="auth-logo-circle">
          <span>RP</span>
        </div>
        <h2 style={{ marginBottom: '10px' }}>New Password</h2>
        <p style={{ marginBottom: '30px', color: 'rgba(255,255,255,0.7)' }}>
            Please enter your new professional credentials below.
        </p>

        {msg && (
          <div className={`auth-msg ${msg.includes("❌") || msg.includes("❗") ? "auth-msg-error" : "auth-msg-success"}`}>
            {msg.includes("❌") || msg.includes("❗") ? "⚠️" : "✨"} {msg}
          </div>
        )}

        <div className="auth-input-group" style={{ marginBottom: '15px' }}>
          <input
            type="password"
            placeholder="New Strong Password"
            className="auth-input"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="auth-input-group" style={{ marginBottom: '25px' }}>
          <input
            type="password"
            placeholder="Confirm New Password"
            className="auth-input"
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        <button className="auth-button" onClick={handleReset}>Update Password</button>

        <p onClick={() => navigate("/")} className="auth-link" style={{ marginTop: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span>←</span> Back to Login
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;
