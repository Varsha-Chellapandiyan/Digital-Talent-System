import { useState } from "react";

function OtpReset({ setPage }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleReset = async () => {
    const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, otp, password })
    });

    const data = await res.json();
    setMsg(data.msg);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>OTP Password Reset</h2>

        {msg && <p style={styles.msg}>{msg}</p>}

        <input
          style={styles.input}
          placeholder="Enter Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Enter OTP"
          onChange={(e) => setOtp(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="New Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button style={styles.button} onClick={handleReset}>
          Reset Password
        </button>

        <p style={styles.back} onClick={() => setPage("login")}>
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
    background: "#f2f2f2"
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
    background: "#5c9412",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },
  msg: {
    textAlign: "center",
    color: "green"
  },
  back: {
    textAlign: "center",
    color: "blue",
    cursor: "pointer",
    marginTop: "10px"
  }
};