import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "./context/ThemeContext";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import OtpReset from "./pages/OtpReset";
import ResetPassword from "./pages/ResetPassword";

import PrivateRoute from "./components/PrivateRoute";

import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Settings from "./pages/Settings";

function App() {
  const { darkMode } = useContext(ThemeContext);

  const theme = darkMode ? dark : light;

  return (
    <div style={{ background: theme.bg, minHeight: "100vh" }}>
      <BrowserRouter>
        <Routes>

          <Route path="/" element={<Register />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/otp" element={<OtpReset />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route
            path="/dashboard"
            element={<PrivateRoute><Dashboard /></PrivateRoute>}
          />

          <Route
            path="/tasks"
            element={<PrivateRoute><Tasks /></PrivateRoute>}
          />

          <Route
            path="/settings"
            element={<PrivateRoute><Settings /></PrivateRoute>}
          />

          <Route path="*" element={<h2 style={{ padding: 20 }}>Page Not Found ❌</h2>} />

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

// THEMES
const light = {
  bg: "#f8fafc"
};

const dark = {
  bg: "#020617"
};