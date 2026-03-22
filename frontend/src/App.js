import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import OtpReset from "./pages/OtpReset";
import { useState } from "react";

function App() {
  const [page, setPage] = useState("register");

  return (
    <div>
      {page === "login" && <Login setPage={setPage} />}
      {page === "register" && <Register setPage={setPage} />}
      {page === "forgot" && <ForgotPassword setPage={setPage} />}
      {page === "otp" && <OtpReset setPage={setPage} />}
    </div>
  );
}

export default App;