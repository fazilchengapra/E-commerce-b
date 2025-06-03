const axios = require("axios");
const Session = require("../model/Session");
const UAParser = require('ua-parser-js');

exports.logSession = async (req) => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"] || "unknown";
    const parser = new UAParser(userAgent);
    const deviceType = parser.getDevice().type || "Desktop"; // fallback if undefined

    const geo = await axios.get(`https://ipapi.co/${ip}/json/`);
    const country = geo.data.country_name || "Unknown";
    const region = geo.data.region || "";
    const city = geo.data.city || "";

    await Session.findOneAndUpdate(
      { user: req.userId },
      {
        ipAddress: ip,
        country,
        region,
        city,
        userAgent,
        deviceType: deviceType.charAt(0).toUpperCase() + deviceType.slice(1), // e.g., "mobile" -> "Mobile"
        updatedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    console.error("Error logging session:", error.message);
  }
};

// For admin dashboard: sessions grouped by country
exports.getSessionsByCountry = async (req, res) => {
  try {
    const stats = await Session.aggregate([
      {
        $group: {
          _id: "$country",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching session stats" });
  }
};

exports.getSessionsByDevice = async (req, res) => {
  try {
    const stats = await Session.aggregate([
      {
        $group: {
          _id: "$deviceType",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error fetching device session stats" });
  }
};
