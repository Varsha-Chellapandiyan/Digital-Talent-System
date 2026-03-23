import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import OtpReset from "./pages/OtpReset";
import ResetPassword from "./pages/ResetPassword";

import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ✅ Default page */}
        <Route path="/" element={<Register />} />

        {/* ✅ Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/otp" element={<OtpReset />} />

        {/* ✅ IMPORTANT RESET PASSWORD ROUTE */}
        <Route path="/reset-password/:token" element={<ResetPassword />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;