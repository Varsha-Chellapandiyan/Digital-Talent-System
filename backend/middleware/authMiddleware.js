const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({ msg: "No token ❌" });
    }

    let token = authHeader;

    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    const decoded = jwt.verify(token, "secretkey");

    // ✅ HANDLE BOTH CASES (VERY IMPORTANT)
    req.user = decoded.userId || decoded.id;

    if (!req.user) {
      return res.status(401).json({ msg: "Invalid token payload ❌" });
    }

    next();

  } catch (err) {
    console.error("AUTH ERROR:", err.message);
    res.status(401).json({ msg: "Token invalid ❌" });
  }
};

module.exports = authMiddleware;