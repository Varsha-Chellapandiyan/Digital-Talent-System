const express = require("express");
const router = express.Router();

const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const transporter = require("../config/mailer");
const jwt = require("jsonwebtoken");
const os = require("os");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

const getLocalIp = () => {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    if (name.toLowerCase().includes('wi-fi') || name.toLowerCase().includes('wlan') || name.toLowerCase().includes('wireless')) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) return iface.address;
      }
    }
  }

  for (const name of Object.keys(interfaces)) {
    const isVM = name.toLowerCase().includes('vmware') || name.toLowerCase().includes('virtual') || name.toLowerCase().includes('wsl') || name.toLowerCase().includes('veth');
    if (isVM) continue;
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

router.get("/test-reset", (req, res) => {
  res.json({ msg: "TEST ROUTE WORKING ✅" });
});


console.log("AUTH ROUTES LOADED");

router.get("/check", (req, res) => {
  res.send("Auth route working ✅");
});

// ================= GET USERS (ADMIN) =================
router.get("/test-users", (req, res) => res.json({ msg: "Test users route works" }));

router.get("/users", authMiddleware, isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "name email _id");
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    let { name, email, password } = req.body;

    name = name.trim();
    email = email.trim().toLowerCase();

    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All fields required ❗" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists ❌" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      "secretkey",
      { expiresIn: "1d" }
    );

    res.json({
      msg: "Login successful ✅",
      token: token,
      role: user.role,
      name: user.name
    });

  } catch (err) {
    console.error("❌ LOGIN ERROR (Full Stack):", err);
    res.status(500).json({ msg: "Server error ❌", detail: err.message });
  }
});

// ================= FORGOT PASSWORD (EMAIL LINK) =================
router.post("/forgot-password", async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email required ❗" });
    }

    email = email.trim().toLowerCase();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User not found ❌" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    // 🌍 Secure local network IP logic for perfect mobile testing
    const baseIp = getLocalIp();
    const fallbackUrl = `http://${baseIp}:3000`;
    const resetLink = `${process.env.FRONTEND_URL || fallbackUrl}/reset-password/${token}`;

    console.log("📧 Sending reset email to:", email);

    const mailOptions = {
      from: `"DTMS ADMIN" <${process.env.EMAIL_USER || "varshachellapandiyan06@gmail.com"}>`,
      to: email,
      subject: "Password Reset",

      html: `
        <h3>Password Reset</h3>
        <p>Hello,</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link expires in 15 minutes.</p>
      `
    };

    // 📧 Send reset link (Non-blocking to prevent server error on mail failure)
    transporter.sendMail(mailOptions)
      .then(info => console.log("✅ Reset Link Email sent:", info.response))
      .catch(err => console.error("❌ Reset Link Email ERROR:", err));

    return res.json({ msg: "Reset link sent to email 📩" });

  } catch (err) {
    console.error("❌ FORGOT PASSWORD ERROR:", err);
    return res.status(500).json({ msg: "Server error ❌" });
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

    user.password = await bcrypt.hash(password, 10);

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
    let { email } = req.body;

    email = email?.trim().toLowerCase();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found ❌" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.otp = otp;
    user.otpExpiry = Date.now() + 300000;
    await user.save();

    // 📧 Send OTP (Non-blocking)
    transporter.sendMail({
      from: `"DTMS ADMIN" <${process.env.EMAIL_USER || "varshachellapandiyan06@gmail.com"}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}`
    })
      .then(info => console.log("✅ OTP Email sent:", info.response))
      .catch(err => console.error("❌ OTP Email ERROR:", err));

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

    email = email?.trim().toLowerCase();
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

    email = email?.trim().toLowerCase();
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