exports.isSuperAdmin = (req, res, next) => {
  if (req.role !== "customer") {
    return res.status(403).json({ message: "Oops!, Something went wrong." });
  }
  next();
};