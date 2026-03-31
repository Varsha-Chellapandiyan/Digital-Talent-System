import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");

  const handleReset = async () => {
    if (password !== confirm) return setMsg("Mismatch ❌");

    const res = await fetch(`http://localhost:4000/api/auth/reset-password/${token}`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ password })
    });

    const data = await res.json();

    if (!res.ok) return setMsg(data.msg);

    setMsg("Success ✅");

    setTimeout(()=>navigate("/"),1000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Reset Password</h2>

        {msg && <p style={{color: msg.includes("❌") ? "red":"green"}}>{msg}</p>}

        <input type="password" placeholder="New Password"
          onChange={(e)=>setPassword(e.target.value)} />

        <input type="password" placeholder="Confirm"
          onChange={(e)=>setConfirm(e.target.value)} />

        <button onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
}

export default ResetPassword;

const styles = {
  container:{height:"100vh",display:"flex",justifyContent:"center",alignItems:"center"},
  card:{padding:20,background:"#fff"}
};