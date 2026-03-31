import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(""); // 🔥 NEW (email or otp)

  const navigate = useNavigate();

  // ✅ OTP RESET (already yours)
  const handleOtp = async () => {
    if (!email) return setMsg("Enter email ❗");

    setLoading(true);
    setMode("otp");
    setMsg("");

    try {
      localStorage.setItem("resetEmail", email);

      const res = await fetch("http://localhost:4000/api/auth/send-otp", {
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

  // ✅ EMAIL RESET (🔥 NEW)
  const handleEmail = async () => {
    if (!email) return setMsg("Enter email ❗");

    setLoading(true);
    setMode("email");
    setMsg("");

    try {
      const res = await fetch("http://127.0.0.1:4000/api/auth/forgot-password", {
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
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Forgot Password</h2>

        {msg && (
          <p style={{
            color: msg.includes("❌") ? "red" : "green"
          }}>
            {msg}
          </p>
        )}

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          style={styles.input}
        />

        {/* 🔥 EMAIL RESET */}
        <button
          onClick={handleEmail}
          disabled={loading}
          style={styles.button}
        >
          {loading && mode==="email" ? "Sending..." : "Reset via Email"}
        </button>

        {/* 🔥 OTP RESET */}
        <button
          onClick={handleOtp}
          disabled={loading}
          style={styles.button}
        >
          {loading && mode==="otp" ? "Sending..." : "Reset via OTP"}
        </button>

        <p onClick={()=>navigate("/")} style={styles.back}>
          ← Back to Login
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;

// 🎨 styles (same as yours)
const styles = {
  container:{
    height:"100vh",
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    background:"linear-gradient(to right, #232526, #414345)"
  },
  card:{
    width:"350px",
    padding:"25px",
    background:"#fff",
    borderRadius:"10px",
    textAlign:"center"
  },
  input:{
    width:"90%",
    padding:"10px",
    marginBottom:"10px"
  },
  button:{
    width:"95%",
    padding:"10px",
    marginBottom:"10px",
    background:"#ff416c",
    color:"#fff",
    border:"none",
    cursor:"pointer"
  },
  back:{
    color:"blue",
    cursor:"pointer"
  }
};