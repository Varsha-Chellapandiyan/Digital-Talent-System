require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

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
app.post("/api/auth/forgot-password", (req, res) => {
  console.log("🔥 DIRECT ROUTE HIT");
  res.json({ msg: "Direct route working ✅" });
});

// 🔥 ADD THIS EXACTLY HERE
const fs = require("fs");
console.log("FILES INSIDE ROUTES:", fs.readdirSync("./routes"));
// ✅ ROOT TEST
app.get("/", (req, res) => {
  res.send("Server running ✅");
});

// ✅ DATABASE
mongoose.connect("mongodb://127.0.0.1:27017/myapp")
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.log("DB ERROR:", err));

// ✅ START SERVER
app.listen(4000, () => {
  console.log("🚀 Server running on http://localhost:4000");
});