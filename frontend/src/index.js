import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider } from "./context/ThemeContext";

// 🔥 APPLY THEME BEFORE REACT LOADS
const savedTheme = localStorage.getItem("darkMode");

if (savedTheme === "true") {
  document.body.style.background = "#020617";
} else {
  document.body.style.background = "#f8fafc";
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals();