require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./config/db"); // ✅ Import DB connection logic

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(cors());

// Logging removed for production

// ✅ ROUTES
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const taskRoutes = require("./routes/taskRoutes");
app.use("/api/tasks", taskRoutes);


// ✅ ROOT TEST
app.get("/", (req, res) => {
  res.send("Server running ✅");
});

// ✅ DATABASE
connectDB(); // ✅ Call centralized DB connection

// ✅ GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err);
  res.status(500).json({
    msg: "Something went wrong on the server ❌",
    error: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});