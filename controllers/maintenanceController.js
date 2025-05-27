const MaintenanceSetting = require("../model/Maintenance");

// Update maintenance settings (Admin only)
exports.setMaintenance = async (req, res) => {
  try {
    const { isActive, message, allowAdmin } = req.body;

    let setting = await MaintenanceSetting.findOne();
    if (!setting) setting = new MaintenanceSetting();

    setting.isActive = isActive;
    if (message !== undefined) setting.message = message;
    if (allowAdmin !== undefined) setting.allowAdmin = allowAdmin;

    await setting.save();

    res.status(200).json({ message: "Maintenance settings updated", setting });
  } catch (error) {
    res.status(500).json({ message: "Failed to update maintenance mode", error: error.message });
  }
};

// Get current maintenance setting (optional for UI preview)
exports.getMaintenanceStatus = async (req, res) => {
  try {
    const setting = await MaintenanceSetting.findOne();
    res.status(200).json({ setting });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch maintenance status", error: error.message });
  }
};
