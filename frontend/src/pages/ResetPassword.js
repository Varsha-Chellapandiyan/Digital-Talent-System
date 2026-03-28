import { useState } from "react";
import { useParams } from "react-router-dom";

function ResetPassword() {
  const { token } = useParams();

  const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (loading) return;

    if (!token) {
      setMessage("Invalid reset link ❌");
      return;
    }

    if (!password || !confirmPassword){
      setMessage("Enter new password ❗");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters ❗");
      return;
    }
       // ✅ CONFIRM PASSWORD CHECK
    if (password !== confirmPassword) {
      setMessage("Passwords do not match ❌");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      console.log("TOKEN:", token);

      const res = await fetch(
        `http://localhost:4000/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      );

      // 🔥 handle non-JSON safely
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid server response");
      }

      console.log("📥 RESPONSE:", data);

      if (!res.ok) {
        setMessage(data.msg || "Reset failed ❌");
        setLoading(false);
        return;
      }

      // ✅ SUCCESS
      setMessage("Password reset successful ✅");
      setSuccess(true);
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        window.location.href = "http://localhost:3000/login";
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
         {/* ✅ CONFIRM PASSWORD INPUT */}
        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={styles.input}
        />
        <button
          style={styles.button}
          onClick={handleReset}
          disabled={loading || success}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;

// 🎨 STYLES
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
    width: "91%",
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