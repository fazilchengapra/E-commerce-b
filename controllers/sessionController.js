const axios = require("axios");
const Session = require("../model/Session");
const UAParser = require("ua-parser-js");

exports.logSession = async (req, userId) => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"] || "unknown";
    const parser = new UAParser(userAgent);

    const deviceType = parser.getDevice().type || "Desktop";
    const deviceModel = parser.getDevice().model || "";
    const os = parser.getOS().name || "";
    const platform = parser.getOS().name || "";
    const browser = parser.getBrowser().name || "";

    const geo = await axios.get(`https://ipapi.co/${ip}/json/`);
    const country = geo.data.country_name || "Unknown";
    const region = geo.data.region || "";
    const city = geo.data.city || "";

    await Session.findOneAndUpdate(
      { user: userId, userAgent }, // one entry per device/browser
      {
        ipAddress: ip,
        country,
        region,
        city,
        userAgent,
        deviceType: deviceType.charAt(0).toUpperCase() + deviceType.slice(1),
        deviceModel,
        browser,
        os,
        platform,
        lastAccessed: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (err) {
    console.error("Session logging error:", err.message);
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

exports.getRecentDevices = async (req, res) => {
  try {
    const userId = req.userId;

    const sessions = await Session.find({ user: userId })
      .sort({ lastAccessed: -1 })
      .limit(10)
      .select('browser os deviceModel platform country city lastAccessed');

    // Format response for UI display
    const formatted = sessions.map(session => ({
      browser: session.browser + ' on ' + session.os,
      device: session.deviceModel || 'Unknown Device',
      location: [session.city, session.country].filter(Boolean).join(', '),
      lastAccessed: session.lastAccessed.toISOString().split('T')[0], // format: yyyy-mm-dd
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load recent devices' });
  }
};

