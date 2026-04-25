import { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);


  // 💾 SAVE TO LOCAL STORAGE & APPLY CLASS
  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // 📱 SIDEBAR STATE
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, sidebarOpen, setSidebarOpen }}>
      {children}
    </ThemeContext.Provider>
  );
};