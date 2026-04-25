import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";

function OtpReset() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifiedOtp, setVerifiedOtp] = useState("");
  const [shake, setShake] = useState(false);

  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const inputsRef = useRef([]);
  const navigate = useNavigate();

  const email = localStorage.getItem("resetEmail");

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (otpVerified) return;

    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer, otpVerified]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    setMsg(""); 

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = async () => {
    const finalOtp = otp.join("").trim();

    if (!email) {
      setMsg("Email missing ❗");
      return;
    }

    if (finalOtp.length !== 6) {
      setMsg("Enter full OTP ❗");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, otp: finalOtp })
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.msg || "Invalid OTP ❌");

        setShake(true);
        setTimeout(() => setShake(false), 400);

        setLoading(false);
        return;
      }

      setMsg("✅ OTP Verified");
      setVerifiedOtp(finalOtp);
      setOtpVerified(true);
      setOtp(["", "", "", "", "", ""]);

    } catch {
      setMsg("Server error ❌");
    }

    setLoading(false);
  };

  const handleReset = async () => {
    if (!email || !verifiedOtp || !password) {
      setMsg("All fields required ❗");
      return;
    }

    if (password.length < 6) {
      setMsg("Password must be at least 6 characters ❗");
      return;
    }

    if (password !== confirmPassword) {
      setMsg("Passwords do not match ❌");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";
      const res = await fetch(`${API_BASE}/api/auth/reset-password-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          otp: verifiedOtp,
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.msg || "Reset failed ❌");
        setLoading(false);
        return;
      }

      setMsg("Password reset successful ✅");
      setPassword("");
      setConfirmPassword("");
      setOtp(["", "", "", "", "", ""]);
      localStorage.removeItem("resetEmail");

      setTimeout(() => {
          localStorage.setItem("showLogin", "true"); 
        navigate("/");
      }, 1200);

    } catch {
      setMsg("Server error ❌");
    }

    setLoading(false);
  };

  const handleResend = async () => {
    if (!canResend) return;

    if (!email) {  
      setMsg("Email missing ❗");
      return;
    }

    setMsg("");

    try {
      const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";
      const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.msg || "Resend failed ❌");
        return;
      }

      setMsg("🔁 OTP resent");

      setTimer(30);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();

    } catch {
      setMsg("Server error ❌");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className={`auth-card ${shake ? "shake" : ""}`} style={{ padding: '60px 40px' }}>
        <div className="auth-logo-circle">
          <span>OTP</span>
        </div>
        <h2 style={{ marginBottom: '10px' }}>Verify Identity</h2>
        <p style={{ marginBottom: '30px', color: 'rgba(255,255,255,0.7)' }}>
            We've sent a 6-digit code to your email.
        </p>

        {msg && (
          <div className={`auth-msg ${msg.includes("❌") || msg.includes("❗") ? "auth-msg-error" : "auth-msg-success"}`}>
             {msg.includes("❌") || msg.includes("❗") ? "⚠️" : "✨"} {msg}
          </div>
        )}

        {!otpVerified && (
          <>
            <div className="otp-box-container" style={{ marginBottom: '30px' }}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  ref={(el) => (inputsRef.current[index] = el)}
                  value={digit}
                  maxLength="1"
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="otp-box"
                />
              ))}
            </div>

            <button
              className="auth-button"
              onClick={handleVerifyOtp}
              disabled={loading}
              style={{ marginBottom: '20px' }}
            >
              {loading ? "Verifying..." : "Verify OTP Code"}
            </button>

            <div style={{ textAlign: 'center' }}>
                <p style={{ marginBottom: '15px', color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>
                  {timer > 0 ? `Resend available in ${timer}s` : "Didn't receive code?"}
                </p>

                <button
                  onClick={handleResend}
                  disabled={!canResend}
                  className="auth-button"
                  style={{ 
                      background: 'transparent', 
                      border: '1px solid rgba(255,255,255,0.3)', 
                      color: 'white',
                      opacity: canResend ? 1 : 0.5,
                      textTransform: 'none',
                      fontSize: '14px',
                      padding: '10px 20px'
                  }}
                >
                  Resend OTP
                </button>
            </div>
          </>
        )}

        {otpVerified && (
          <>
            <div className="auth-input-group" style={{ marginBottom: '15px' }}>
              <input
                type="password"
                placeholder="New Secure Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                autoComplete="new-password"
              />
            </div>

            <div className="auth-input-group" style={{ marginBottom: '25px' }}>
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="auth-input"
                autoComplete="new-password"
              />
            </div>

            <button className="auth-button" onClick={handleReset}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </>
        )}

        <p className="auth-link" style={{ marginTop: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => navigate("/")}>
          <span>←</span> Back to Login
        </p>
      </div>
    </div>
  );
}

export default OtpReset;