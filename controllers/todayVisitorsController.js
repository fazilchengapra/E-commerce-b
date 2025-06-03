const VisitorLog = require("../model/VisitorLog");
const moment = require("moment");

exports.getVisitors = async (req, res) => {
  try {
    const type = req.query.type || "hour";

    if (type === "hour") {
      // === Hourly visitors for today ===
      const startOfToday = moment().startOf("day").toDate();
      const endOfToday = moment().endOf("day").toDate();

      const todayLogs = await VisitorLog.find({
        visitedAt: { $gte: startOfToday, $lte: endOfToday },
      });

      const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
        hour: `${hour.toString().padStart(2, "0")}:00`,
        count: 0,
      }));

      todayLogs.forEach((log) => {
        const hour = moment(log.visitedAt).hour();
        hourlyData[hour].count += 1;
      });

      const totalVisitors = todayLogs.length;

      // Compare with yesterday
      const startOfYesterday = moment()
        .subtract(1, "day")
        .startOf("day")
        .toDate();
      const endOfYesterday = moment().subtract(1, "day").endOf("day").toDate();

      const yesterdayLogsCount = await VisitorLog.countDocuments({
        visitedAt: { $gte: startOfYesterday, $lte: endOfYesterday },
      });

      const percentageChange =
        yesterdayLogsCount === 0
          ? 100
          : parseFloat(
              (
                ((totalVisitors - yesterdayLogsCount) / yesterdayLogsCount) *
                100
              ).toFixed(1)
            );

      return res.status(200).json({
        totalVisitors,
        hourlyData,
        percentageChange,
      });
    } else if (type === "day") {
      // === Daily unique visitors for this week ===
      const startOfWeek = moment().startOf("week").toDate(); // Sunday
      const endOfWeek = moment().endOf("week").toDate(); // Saturday

      // Use aggregation to group by userId and day
      const weekLogs = await VisitorLog.aggregate([
        {
          $match: {
            visitedAt: { $gte: startOfWeek, $lte: endOfWeek },
          },
        },
        {
          $group: {
            _id: {
              userId: "$userId",
              day: { $dayOfWeek: "$visitedAt" }, // 1 (Sun) to 7 (Sat)
            },
          },
        },
        {
          $group: {
            _id: "$_id.day",
            count: { $sum: 1 },
          },
        },
      ]);

      // Initialize 7 days with count 0
      const dailyData = Array.from({ length: 7 }, (_, i) => ({
        day: moment().startOf("week").add(i, "days").format("ddd"),
        count: 0,
      }));

      // Map result to dailyData
      weekLogs.forEach(({ _id, count }) => {
        const dayIndex = _id - 1; // Mongo $dayOfWeek: 1 = Sunday
        if (dailyData[dayIndex]) {
          dailyData[dayIndex].count = count;
        }
      });

      const totalVisitors = weekLogs.reduce((sum, d) => sum + d.count, 0);

      return res.status(200).json({
        totalVisitors,
        dailyData,
      });
    } else {
      return res
        .status(400)
        .json({ message: "Invalid query type (use 'hour' or 'day')" });
    }
  } catch (err) {
    console.error("Visitor analytics error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
