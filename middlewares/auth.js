require("dotenv").config();
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

exports.authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.adminId || !decoded.role) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.adminId = decoded.adminId;
    req.role = decoded.role;
    next();
  } catch (error) {
    console.error("JWT Error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
