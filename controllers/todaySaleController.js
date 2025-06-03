const Order = require("../model/Order");

const getTodaySales = async (req, res) => {
  try {
    const now = new Date();

    // Get start and end of today
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // Get start and end of yesterday
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Common match conditions
    const matchConditions = {
      paymentStatus: "paid",
      orderStatus: "delivered"
    };

    // Pipeline for today
    const todayPipeline = [
      {
        $match: {
          ...matchConditions,
          createdAt: { $gte: startOfDay, $lt: endOfDay }
        }
      },
      { $unwind: "$orderItems" },
      {
        $addFields: {
          saleAmount: "$totalPrice",
          profitAmount: {
            $multiply: ["$orderItems.price", 0.75]
          },
          localHour: {
            $hour: {
              date: "$createdAt",
              timezone: "+05:30"
            }
          }
        }
      },
      {
        $group: {
          _id: "$localHour",
          totalSales: { $sum: "$saleAmount" },
          totalProfit: { $sum: "$profitAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ];

    const todayResults = await Order.aggregate(todayPipeline);

    // Create hourly arrays
    const labels = [];
    const sales = [];
    const profit = [];

    for (let i = 0; i < 24; i++) {
      labels.push(`${i}:00`);
      const hourData = todayResults.find((r) => r._id === i);
      sales.push(hourData ? hourData.totalSales : 0);
      profit.push(hourData ? hourData.totalProfit : 0);
    }

    const totalTodaySales = sales.reduce((sum, val) => sum + val, 0);
    const totalTodayProfit = profit.reduce((sum, val) => sum + val, 0);

    // Pipeline for yesterday
    const yesterdayPipeline = [
      {
        $match: {
          ...matchConditions,
          createdAt: { $gte: startOfYesterday, $lt: endOfYesterday }
        }
      },
      { $unwind: "$orderItems" },
      {
        $addFields: {
          saleAmount: "$totalPrice",
          profitAmount: {
            $multiply: ["$orderItems.price", 0.75]
          }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$saleAmount" },
          totalProfit: { $sum: "$profitAmount" }
        }
      }
    ];

    const yesterdayResults = await Order.aggregate(yesterdayPipeline);

    const totalYesterdaySales = yesterdayResults[0]?.totalSales || 0;
    const totalYesterdayProfit = yesterdayResults[0]?.totalProfit || 0;

    // Calculate percentage difference (avoid divide-by-zero)
    const salesChange = totalYesterdaySales === 0
      ? 100
      : ((totalTodaySales - totalYesterdaySales) / totalYesterdaySales) * 100;

    const profitChange = totalYesterdayProfit === 0
      ? 100
      : ((totalTodayProfit - totalYesterdayProfit) / totalYesterdayProfit) * 100;

    res.json({
      totalTodaySales,
      totalTodayProfit,
      labels,
      sales,
      profit,
      yesterday: {
        totalYesterdaySales,
        totalYesterdayProfit,
        salesChangePercent: +salesChange.toFixed(2),
        profitChangePercent: +profitChange.toFixed(2)
      }
    });

  } catch (error) {
    console.error("Error in getTodaySales:", error);
    res.status(500).json({ message: "Failed to fetch today's sales data" });
  }
};

module.exports = {
  getTodaySales,
};
