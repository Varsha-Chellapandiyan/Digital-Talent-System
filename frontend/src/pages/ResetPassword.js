import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (loading) return;

    if (!password) {
      setMessage("Enter new password ❗");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters ❗");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      console.log("🔐 Token:", token);
         
      const res = await fetch("http://localhost:4000/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token: token,
          password: password
        })
      });

      const data = await res.json();
      console.log("📥 RESPONSE:", data);

      if (!res.ok) {
        setMessage(data.msg || "Reset failed ❌");
        setLoading(false);
        return;
      }

      setMessage("Password reset successful ✅");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      console.error("RESET ERROR:", err);
      setMessage("Server error ❌");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Reset Password</h2>

        {message && <p style={styles.msg}>{message}</p>}

        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button style={styles.button} onClick={handleReset} disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f2f2f2"
  },
  card: {
    width: "300px",
    padding: "20px",
    background: "#fff",
    borderRadius: "10px",
    textAlign: "center"
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px"
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "green",
    color: "#fff",
    border: "none",
    cursor: "pointer"
  },
  msg: {
    marginBottom: "10px",
    color: "blue"
  }
};