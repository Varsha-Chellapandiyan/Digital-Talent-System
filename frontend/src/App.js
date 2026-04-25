import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useContext } from "react";

import { ThemeContext } from "./context/ThemeContext";

import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import OtpReset from "./pages/OtpReset";
import ResetPassword from "./pages/ResetPassword";

import PrivateRoute from "./components/PrivateRoute";
import MainLayout from "./components/MainLayout";

import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Settings from "./pages/Settings";

function App() {
  const { darkMode } = useContext(ThemeContext);

  return (
    <div className={darkMode ? "dark" : ""}>
      <BrowserRouter>
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/otp" element={<OtpReset />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <MainLayout title="Dashboard">
                  <Dashboard />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/tasks"
            element={
              <PrivateRoute>
                <MainLayout title="Task Management">
                  <Tasks />
                </MainLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <MainLayout title="Settings">
                  <Settings />
                </MainLayout>
              </PrivateRoute>
            }
          />

          {/* Fallback Route */}
          <Route
            path="*"
            element={
              <h2 style={{ padding: 40, textAlign: "center" }}>
                Page Not Found ❌
              </h2>
            }
          />

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;