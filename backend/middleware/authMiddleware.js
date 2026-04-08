const jwt = require("jsonwebtoken");

// Auth middleware: verifies token and attaches user
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) return res.status(401).json({ msg: "No token ❌" });

    let token = authHeader;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");

    // store full user info (id, email, role)
    req.user = { id: decoded.id || decoded.userId, role: decoded.role, email: decoded.email };
    next();
  } catch (err) {
    console.error("AUTH ERROR:", err.message);
    res.status(401).json({ msg: "Token invalid ❌" });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ msg: "No user info ❌" });

  // Allow if role is admin or email is the specific admin email
  const userEmail = req.user.email ? req.user.email.toLowerCase() : "";
  if (req.user.role !== "admin" && userEmail !== "varshachellapandiyan06@gmail.com") {
    return res.status(403).json({ msg: "Admin access only ❌" });
  }

  next();
};

module.exports = { authMiddleware, isAdmin };