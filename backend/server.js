require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./config/db"); // ✅ Import DB connection logic

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(cors());

// ✅ DEBUG LOGGER (VERY IMPORTANT)
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// ✅ ROUTES
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);
console.log("AUTH ROUTE FILE:", require.resolve("./routes/authRoutes"));

const taskRoutes = require("./routes/taskRoutes");
app.use("/api/tasks", taskRoutes);


// 🔥 ADD THIS EXACTLY HERE
const fs = require("fs");
console.log("FILES INSIDE ROUTES:", fs.readdirSync("./routes"));
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

app.listen(4000, () => {
  console.log("🚀 Server running on http://localhost:4000");
});