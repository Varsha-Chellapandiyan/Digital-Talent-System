import { useState } from "react";
import "./auth.css";
import { loginUser, registerUser } from "../services/authService";
import { useNavigate } from "react-router-dom";

function Auth() {
  const [isActive, setIsActive] = useState(() => {
    const showLogin = localStorage.getItem("showLogin");

    if (showLogin) {
      localStorage.removeItem("showLogin");
      return false;
    }

    return true;
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await loginUser({ email, password });

    if (res.token) {
      localStorage.setItem("token", res.token);
      const isAdmin = email.trim().toLowerCase() === "varshachellapandiyan06@gmail.com" || res.role === "admin";
      localStorage.setItem("role", isAdmin ? "admin" : (res.role || "user"));

      navigate("/dashboard");
    } else {
      alert(res.msg);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const res = await registerUser({ name, email, password });

    if (res.msg === "User registered successfully") {
      alert("Registered! Please login");
      setIsActive(false);
    } else {
      alert(res.msg);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className={`container ${isActive ? "active" : ""}`}>
        <div className="form-container sign-up">
          <form onSubmit={handleRegister}>
            <h1>Create Account</h1>
            <input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} />
            <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
            <button>Sign Up</button>
          </form>
        </div>

        <div className="form-container sign-in">
          <form onSubmit={handleLogin}>
            <h1>Sign In</h1>
            <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
            <button>Sign In</button>
            <p
              className="forgot"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </p>
          </form>
          <p
            style={{ color: "blue", cursor: "pointer", marginTop: "10px" }}
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </p>
        </div>

        <div className="toggle-container">
          <div className="toggle">

            <div className="toggle-panel toggle-left">
              <h1>Welcome Back!</h1>
              <p>Already have an account?</p>
              <button onClick={() => setIsActive(false)}>Sign In</button>
            </div>

            <div className="toggle-panel toggle-right">
              <h1>Hello Friend!</h1>
              <p>Create a new account</p>
              <button onClick={() => setIsActive(true)}>Sign Up</button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;