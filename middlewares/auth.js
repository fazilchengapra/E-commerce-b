require("dotenv").config();
const jwt = require("jsonwebtoken");
const { getVisitors } = require("../utils/logVisitor");
const logVisitor = require("../utils/logVisitor");

const JWT_SECRET = process.env.JWT_SECRET;

exports.authMiddleware = async(req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.userId || !decoded.role) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.userId = decoded.userId;
    req.role = decoded.role;
    await logVisitor(req)
    next();
  } catch (error) {
    console.error("JWT Error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
