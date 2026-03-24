import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [emailLoading, setEmailLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const navigate = useNavigate();

  // ✅ EMAIL RESET
  const handleEmail = async () => {
    if (emailLoading) return;

    if (!email) {
      setMessage("Please enter email ❗");
      return;
    }

    setEmailLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:4000/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.msg || "Something went wrong ❌");
        setEmailLoading(false);
        return;
      }

      setMessage("📩 Reset link sent! Check your email");

    } catch (err) {
      console.error(err);
      setMessage("Server not reachable ❌");
    }

    setEmailLoading(false);
  };

  // ✅ OTP RESET
  const handleOtp = async () => {
    if (otpLoading) return;

    if (!email) {
      setMessage("Please enter email ❗");
      return;
    }

    setOtpLoading(true);
    setMessage("");

    try {
      localStorage.setItem("resetEmail", email);
      const res = await fetch("http://localhost:4000/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.msg || "OTP failed ❌");
        setOtpLoading(false);
        return;
      }
      
      setMessage("✅ OTP sent successfully");

      setTimeout(() => {
        navigate("/otp");
      }, 1000);

    } catch (err) {
      console.error(err);
      setMessage("Server not reachable ❌");
    }

    setOtpLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Forgot Password</h2>

        {message && <p style={styles.msg}>{message}</p>}

        <input
          style={styles.input}
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* EMAIL */}
        <button
          style={styles.button}
          onClick={handleEmail}
          disabled={emailLoading}
        >
          {emailLoading ? "Sending..." : "Reset via Email"}
        </button>

        {/* OTP */}
        <button
          style={styles.button}
          onClick={handleOtp}
          disabled={otpLoading}
        >
          {otpLoading ? "Sending..." : "Reset via OTP"}
        </button>

        <p style={styles.back} onClick={() => navigate("/login")}>
          Back to Login
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;

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
  input: {
    width: "88%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc"
  },
  button: {
    width: "94%",
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
  }
};