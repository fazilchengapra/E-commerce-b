const Admin = require("../model/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// You should keep this secret in .env file
const JWT_SECRET = process.env.JWT_SECRET;

// Register a new admin
exports.registerAdmin = async (req, res) => {
  try {
    const { firstName, email, password } = req.body;

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin)
      return res.status(400).json({ message: "Admin already exists" });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      ...req.body,
      password: hashedPassword,
    });

    await newAdmin.save();
    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering admin", error });
  }
};

// Login admin
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: admin._id, role: admin.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.JWT_SECRET === "production", // only true in production
      sameSite: "Lax", // Or 'None' if cross-site
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    req.role = admin.role;

    res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.firstName,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

// Get admin profile
exports.getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.userId).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error });
  }
};

// Update admin profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    if(updates.password) {
        throw new Error("Password cannot be updated here. Use changePassword endpoint.");
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json({ message: "Profile updated", admin: updatedAdmin });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error });
  }
};

// Change admin password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.userId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect current password" });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedNewPassword;
    await admin.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error changing password", error });
  }
};
