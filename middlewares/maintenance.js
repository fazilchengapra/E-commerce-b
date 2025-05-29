// middleware/maintenance.js
const MaintenanceSetting = require("../model/Maintenance");

const exemptPaths = [
  "/maintenance", // allow toggle
];

const maintenanceMiddleware = async (req, res, next) => {
  try {
    const setting = await MaintenanceSetting.findOne();

    if (setting?.isActive) {
      const isAdmin = req.role === "superadmin"; // assuming `authMiddleware` already sets `req.role`

      if (setting.allowAdmin && isAdmin) {
        if (exemptPaths.includes(req.path)) {
          return next(); // allow admin to access exempt paths
        }
      }

      return res.status(503).json({
        message:
          setting.message || "Maintenance mode is active. Try again later.",
      });
    }

    next();
  } catch (err) {
    console.error("Maintenance middleware error:", err);
    next(); // fail open
  }
};

module.exports = maintenanceMiddleware;
