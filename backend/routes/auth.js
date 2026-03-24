const express = require("express");
const router = express.Router();

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const transporter = require("../config/mailer");

// ================= CHECK ROUTE =================
router.get("/test-reset", (req, res) => {
  res.json({ msg: "TEST ROUTE WORKING ✅" });
});
console.log("AUTH ROUTES LOADED");
router.get("/check", (req, res) => {
  res.send("Auth route working ✅");
});

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    let { name, email, password } = req.body;

    // ✅ CLEAN INPUT
    name = name.trim();
    email = email.trim().toLowerCase();

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All fields required ❗" });
    }

    console.log("REGISTER EMAIL:", email); // 🔍 debug

    // ✅ CHECK EXISTING USER
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists ❌" });
    }

    // ✅ HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ SAVE USER
    await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.json({ msg: "User registered successfully ✅" });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ msg: "Server error ❌" });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found ❌" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials ❌" });
    }

    res.json({ msg: "Login successful ✅" });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ msg: "Server error ❌" });
  }
});

// ================= FORGOT PASSWORD =================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found ❌" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();

    const link = `http://localhost:3000/reset-password/${token}`;

    await transporter.sendMail({
      from: "varshachellapandiyan06@gmail.com",
      to: email,
      subject: "Reset Password",
      text: `Click here to reset your password:\n${link}`
    });

    res.json({ msg: "Reset link sent to email ✅" });

  } catch (err) {
    console.error("FORGOT ERROR:", err);
    res.status(500).json({ msg: "Server error ❌" });
  }
   
});
// ================= RESET PASSWORD WITH TOKEN =================
router.post("/reset-password/:token", async (req, res) => {
  try {
    console.log("🔥 RESET TOKEN API HIT");

    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ msg: "Invalid request ❌" });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: "Token invalid or expired ❌" });
    }

    // ✅ update password
    user.password = await bcrypt.hash(password, 10);

    // ✅ clear token
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({ msg: "Password reset successful ✅" });

  } catch (err) {
    console.error("RESET TOKEN ERROR:", err);
    res.status(500).json({ msg: "Server error ❌" });
  }
  
});


// ================= SEND OTP =================
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found ❌" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.otp = otp;
    user.otpExpiry = Date.now() + 300000;
    await user.save();

    await transporter.sendMail({
      from: "varshachellapandiyan06@gmail.com",
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}`
    });

    res.json({ msg: "OTP sent successfully ✅" });

  } catch (err) {
    console.error("OTP ERROR:", err);
    res.status(500).json({ msg: "Server error ❌" });
  }
});

// ================= VERIFY OTP =================
router.post("/verify-otp", async (req, res) => {
  try {
    let { email, otp } = req.body;

    email = email?.trim();
    otp = String(otp).trim();

    if (!email || !otp) {
      return res.status(400).json({ msg: "Email & OTP required ❗" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User not found ❌" });
    }

    if (String(user.otp) !== otp) {
      return res.status(400).json({ msg: "Invalid OTP ❌" });
    }

    if (!user.otpExpiry || user.otpExpiry < Date.now()) {
      return res.status(400).json({ msg: "OTP expired ❌" });
    }

    res.json({ msg: "OTP verified ✅" });

  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ msg: "Server error ❌" });
  }
});


// ================= RESET PASSWORD WITH OTP =================
router.post("/reset-password-otp", async (req, res) => {
  try {
    console.log("🔥 RESET OTP API HIT");

    let { email, otp, password } = req.body;

    email = email?.trim();
    otp = String(otp).trim();
    password = password?.trim();

    if (!email || !otp || !password) {
      return res.status(400).json({ msg: "Missing data ❌" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User not found ❌" });
    }

    if (String(user.otp) !== otp) {
      return res.status(400).json({ msg: "Invalid OTP ❌" });
    }

    if (!user.otpExpiry || user.otpExpiry < Date.now()) {
      return res.status(400).json({ msg: "OTP expired ❌" });
    }

    user.password = await bcrypt.hash(password, 10);

    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    res.json({ msg: "Password reset successful ✅" });

  } catch (err) {
    console.error("RESET OTP ERROR:", err);
    res.status(500).json({ msg: "Server error ❌" });
  }
});

module.exports = router;