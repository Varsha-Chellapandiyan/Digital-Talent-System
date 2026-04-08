import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function OtpReset() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [verifiedOtp, setVerifiedOtp] = useState("");
  const [shake, setShake] = useState(false);

  const [timer, setTimer] = useState(60);
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

    setMsg(""); // 🔥 clear error while typing

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
      const res = await fetch("http://localhost:4000/api/auth/verify-otp", {
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
      const res = await fetch("http://localhost:4000/api/auth/reset-password-otp", {
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

    if (!email) {  // 🔥 FIX
      setMsg("Email missing ❗");
      return;
    }

    setMsg("");

    try {
      const res = await fetch("http://localhost:4000/api/auth/send-otp", {
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

      setTimer(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();

    } catch {
      setMsg("Server error ❌");
    }
  };

  return (
    <div style={styles.container}>
      <div style={{ ...styles.card, ...(shake ? styles.shake : {}) }}>
        <h2>OTP Verification</h2>

        {msg && <p style={styles.msg}>{msg}</p>}

        {!otpVerified && (
          <div style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"               // 🔥 FIX
                inputMode="numeric"      // 🔥 FIX
                ref={(el) => (inputsRef.current[index] = el)}
                value={digit}
                maxLength="1"
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                style={styles.otpBox}
              />
            ))}
          </div>
        )}

        {!otpVerified && (
          <>
            <button
              style={styles.button}
              onClick={handleVerifyOtp}
              disabled={loading}   // 🔥 FIX
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <p style={{ textAlign: "center" }}>
              {timer > 0 ? `Resend OTP in ${timer}s` : "You can resend OTP"}
            </p>

            <button
              onClick={handleResend}
              disabled={!canResend}
              style={{
                ...styles.button,
                background: canResend ? "#007bff" : "gray"
              }}
            >
              Resend OTP
            </button>
          </>
        )}

        {otpVerified && (
          <>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              autoComplete="new-password" // 🔥 FIX
            />

            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
              autoComplete="new-password"
            />

            <button style={styles.button} onClick={handleReset}>
              {loading ? "Processing..." : "Reset Password"}
            </button>
          </>
        )}

        <p style={styles.back} onClick={() => navigate("/")}>
          Back to Login
        </p>
      </div>
    </div>
  );
}

export default OtpReset;

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#232526"
  },
  card: {
    width: "350px",
    padding: "25px",
    background: "#fff",
    borderRadius: "10px"
  },
  otpContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px"
  },
  otpBox: {
    width: "40px",
    height: "40px",
    textAlign: "center"
  },
  input: {
    width: "93%",
    padding: "10px",
    marginBottom: "10px"
  },
  button: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    background: "green",
    color: "#fff",
    border: "none"
  },
  msg: {
    textAlign: "center",
    color: "green"
  },
  back: {
    textAlign: "center",
    color: "blue",
    cursor: "pointer"
  },
  shake: {
    animation: "shake 0.3s"
  }
};