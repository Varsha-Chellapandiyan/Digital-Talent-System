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
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// ✅ ROOT TEST
app.get("/", (req, res) => {
  res.send("Server running ✅");
});

// ✅ DATABASE
mongoose.connect("mongodb://127.0.0.1:27017/myapp")
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.log("DB ERROR:", err));

// ✅ START SERVER
app.listen(4000, "0.0.0.0", () => {
  console.log("🚀 Server running on http://localhost:4000");
});