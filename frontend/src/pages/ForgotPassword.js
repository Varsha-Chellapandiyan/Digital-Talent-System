import { useState } from "react";

function ForgotPassword({ setPage }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // 🔹 EMAIL RESET (FINAL)
  const handleEmail = async () => {
    console.log("Forgot password clicked");

    if (!email) {
      setMessage("Please enter email ❗");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await res.json();
      console.log("FORGOT RESPONSE:", data);

      if (!res.ok) {
        setMessage(data.msg || "Something went wrong ❌");
        return;
      }

      setMessage(data.msg || "Reset link sent to email ✅");

    } catch (err) {
      console.error("FETCH ERROR:", err);
      setMessage("Server not reachable ❌");
    }
  };

  // 🔹 OTP RESET
  const handleOtp = async () => {
    console.log("OTP Button clicked");

    if (!email) {
      setMessage("Please enter email ❗");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await res.json();
      console.log("OTP DATA:", data);

      if (!res.ok) {
        setMessage(data.msg || "OTP failed ❌");
        return;
      }

      setMessage("OTP sent successfully ✅");

      // go to OTP page
      setPage("otp");

    } catch (err) {
      console.error("OTP ERROR:", err);
      setMessage("Server not reachable ❌");
    }
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

        {/* 🔥 REAL BUTTON */}
        <button style={styles.button} onClick={handleEmail}>
          Reset via Email
        </button>

        <button style={styles.button} onClick={handleOtp}>
          Reset via OTP
        </button>

        <p style={styles.back} onClick={() => setPage("login")}>
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
    width: "100%",
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
  }
};