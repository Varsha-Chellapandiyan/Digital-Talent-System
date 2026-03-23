import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function OtpReset() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const [loading, setLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false); // 🔥 KEY

  const inputsRef = useRef([]);
  const navigate = useNavigate();

  const email = localStorage.getItem("resetEmail");

  // 🔢 OTP INPUT
  const handleChange = (value, index) => {
    console.log("EMAIL FROM STORAGE:", email);
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  // 🔐 VERIFY OTP ONLY
  const handleVerifyOtp = async () => {
  const finalOtp = otp.join("").trim(); // ✅ clean OTP

  // ✅ VALIDATION
  if (!email) {
    setMsg("Email missing ❗ Try again from forgot password");
    return;
  }

  if (finalOtp.length !== 6) {
    setMsg("Enter complete 6-digit OTP ❗");
    return;
  }

  setLoading(true);
  setMsg("");

  try {
    console.log("📤 Sending OTP:", finalOtp);
    console.log("📧 Email:", email);

    const res = await fetch("http://192.168.2.75:4000/api/auth/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email.trim(),
        otp: finalOtp // ✅ FIXED (string only)
      })
    });

    // 🔥 HANDLE NON-JSON RESPONSE (VERY IMPORTANT)
    const text = await res.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      console.error("❌ Invalid JSON:", text);
      setMsg("Server error ❌ (invalid response)");
      setLoading(false);
      return;
    }

    console.log("📥 RESPONSE:", data);

    if (!res.ok) {
      setMsg(data.msg || "Invalid OTP ❌");
      setLoading(false);
      return;
    }

    // ✅ SUCCESS
    setMsg("✅ OTP Verified");
    setOtpVerified(true); // 🔥 unlock password field

  } catch (err) {
    console.error("❌ VERIFY ERROR:", err);
    setMsg("Server not reachable ❌");
  }

  setLoading(false);
};
  // 🔐 RESET PASSWORD
  const handleReset = async () => {
  const finalOtp = otp.join("").trim();
  const email = localStorage.getItem("resetEmail");

  if (!email || !finalOtp || !password) {
    setMsg("All fields are required ❗");
    return;
  }

  try {
    const res = await fetch("http://192.168.2.75:4000/api/auth/reset-password-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        otp: finalOtp,
        password
      })
    });

    const data = await res.json();

    console.log("📤 SENT:", { email, otp: finalOtp, password });
    console.log("📥 RESPONSE:", data);

    if (!res.ok) {
      setMsg(data.msg || "Reset failed ❌");
      return;
    }

    setMsg("✅ Password reset successful");

  } catch (err) {
    console.error(err);
    setMsg("Server error ❌");
  }
};

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>OTP Verification</h2>

        {msg && <p style={styles.msg}>{msg}</p>}

        {/* OTP INPUT */}
        <div style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              value={digit}
              maxLength="1"
              onChange={(e) => handleChange(e.target.value, index)}
              style={styles.otpBox}
            />
          ))}
        </div>

        {/* VERIFY BUTTON */}
        {!otpVerified && (
          <button style={styles.button} onClick={handleVerifyOtp}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        )}

        {/* 🔥 SHOW PASSWORD ONLY AFTER VERIFY */}
        {otpVerified && (
          <>
            <input
              type="password"
              placeholder="Enter new password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button style={styles.button} onClick={handleReset}>
              Reset Password
            </button>
          </>
        )}

        <p style={styles.back} onClick={() => navigate("/login")}>
          Back to Login
        </p>
      </div>
    </div>
  );
}

export default OtpReset;

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
    padding: "25px",
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.2)"
  },
  otpContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "15px"
  },
  otpBox: {
    width: "45px",
    height: "45px",
    fontSize: "18px",
    textAlign: "center",
    borderRadius: "5px",
    border: "1px solid #ccc"
  },
  input: {
    width: "94%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc"
  },
  button: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    background: "#5c9412",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },
  msg: {
    textAlign: "center",
    color: "green",
    fontSize: "14px"
  },
  back: {
    textAlign: "center",
    color: "blue",
    cursor: "pointer",
    marginTop: "10px"
  },

  // 🔥 SHAKE ANIMATION
  shake: {
    animation: "shake 0.3s"
  }
};

// 🔥 ADD THIS IN index.css OR App.css
/*
@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
}
*/