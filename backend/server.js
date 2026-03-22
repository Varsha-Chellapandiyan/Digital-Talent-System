require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ✅ Middleware
app.use(express.json());
app.use(cors());

// ✅ LOAD AUTH ROUTES (VERY IMPORTANT)
console.log("Loading auth routes...");
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// ✅ TEST ROUTE
app.get("/api/test", (req, res) => {
  console.log("✅ API TEST HIT");
  res.send("API TEST WORKING ✅");
});

// ✅ DATABASE CONNECTION
mongoose.connect("mongodb://127.0.0.1:27017/myapp")
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.log("DB ERROR:", err.message));

// ✅ SERVER START
app.listen(4000, () => {
  console.log("🚀 Server running on http://localhost:4000");
});