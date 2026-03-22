const express = require("express");
const router = express.Router();

console.log("🔥 AUTH FILE EXECUTED");

// Models & packages
const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const otpGenerator = require("otp-generator");


// ================= TEST ROUTE =================
router.get("/check", (req, res) => {
  console.log("✅ CHECK ROUTE HIT");
  res.send("Auth route working ✅");
});


// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    console.log("Register API hit");
    console.log("BODY:", req.body);

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.json({ msg: "User registered successfully ✅" });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({
      msg: "Server error ❌",
      error: err.message
    });
  }
});


// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    console.log("Login API hit");

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
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
    console.log("🔥 Forgot password API hit");

    const { email } = req.body;

    // ✅ Validate email
    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    // ✅ Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // ✅ Generate token
    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour

    await user.save();

    // ✅ Create reset link
    const link = `http://localhost:3000/reset-password/${token}`;

    console.log("📧 Sending email to:", email);
    console.log("🔗 Reset Link:", link); // 🔥 VERY IMPORTANT (backup)

    // ✅ Send mail
    await transporter.sendMail({
      from: "varshachellapandian06@gmail.com", // 🔴 MUST ADD
      to: email,
      subject: "Reset Password",
      text: `Click here to reset your password:\n\n${link}`
    });

    console.log("✅ Email sent successfully");

    res.json({ msg: "Email sent successfully ✅" });

  } catch (err) {
    console.error("❌ FORGOT ERROR:", err);

    res.status(500).json({
      msg: "Server error ❌",
      error: err.message // 🔥 helps debugging
    });
  }
});


// ================= RESET PASSWORD =================
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(password, 10);

    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json({ msg: "Password updated successfully ✅" });

  } catch (err) {
    console.error("RESET ERROR:", err);
    res.status(500).json({ msg: "Server error ❌" });
  }
});


// ================= SEND OTP =================
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const otp = otpGenerator.generate(6, {
      upperCase: false,
      specialChars: false
    });

    user.otp = otp;
    user.otpExpiry = Date.now() + 300000;

    await user.save();

    res.json({ msg: `OTP generated: ${otp} ✅` });

  } catch (err) {
    console.error("OTP ERROR:", err);
    res.status(500).json({ msg: "Server error ❌" });
  }
});


// ================= VERIFY OTP =================
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    const user = await User.findOne({
      email,
      otp,
      otpExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(password, 10);

    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    res.json({ msg: "Password reset successful ✅" });

  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ msg: "Server error ❌" });
  }
});


// ✅ EXPORT (MUST BE LAST)
module.exports = router;