const Order = require("../model/Order");

const getLatestCustomers = async (req, res) => {
  try {
    const latestCustomers = await Order.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$user",
          totalSpent: { $sum: "$totalPrice" },
          lastOrderDate: { $max: "$createdAt" },
        },
      },
      { $sort: { lastOrderDate: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 0,
          name: "$user.name",
          email: "$user.email",
          avatar: "$user.avatar",
          totalSpent: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, data: latestCustomers });
  } catch (error) {
    console.error("Error fetching latest customers:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getLatestCustomers };
