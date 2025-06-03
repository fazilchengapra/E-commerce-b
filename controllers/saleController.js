const mongoose = require("mongoose");
const Order = require("../model/Order");
const Category = require("../model/Category");

const getSalesAnalytics = async (req, res) => {
  try {
    const { range = "day" } = req.query;

    // 1. Prepare date format for grouping
    let dateFormat;
    if (range === "year")
      dateFormat = { $dateToString: { format: "%Y", date: "$createdAt" } };
    else if (range === "month")
      dateFormat = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
    else
      dateFormat = {
        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
      };

    // 2. Fetch _id of top categories (Fashion and Electronics)
    const topCategories = await Category.find({
      name: { $in: ["Fashion", "Electronics"] },
    });
    const topCategoryIds = topCategories.map((cat) => cat._id);

    // 3. Aggregate with graphLookup and match
    const pipeline = [
      {
        $match: {
          paymentStatus: "paid",
          orderStatus: "delivered",
        },
      },
      { $unwind: "$orderItems" },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.product",
          foreignField: "_id",
          as: "productData",
        },
      },
      { $unwind: "$productData" },
      {
        $lookup: {
          from: "categories",
          localField: "productData.category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      { $unwind: "$categoryData" },

      // 4. Get root category using $graphLookup (tree traversal)
      {
        $graphLookup: {
          from: "categories",
          startWith: "$categoryData.parent",
          connectFromField: "parent",
          connectToField: "_id",
          as: "categoryAncestors",
        },
      },
      {
        $addFields: {
          rootCategory: {
            $let: {
              vars: {
                allCats: {
                  $concatArrays: [["$categoryData"], "$categoryAncestors"],
                },
              },
              in: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$$allCats",
                      cond: { $eq: ["$$this.parent", null] },
                    },
                  },
                  0,
                ],
              },
            },
          },
        },
      },

      // 5. Filter only if rootCategory._id in topCategoryIds
      {
        $match: {
          "rootCategory._id": { $in: topCategoryIds },
        },
      },

      // 6. Add sale amount and formatted date
      {
        $addFields: {
          saleAmount: "$orderItems.price",
          dateGroup: dateFormat,
        },
      },

      // 7. Group by date and rootCategory name
      {
        $group: {
          _id: {
            date: "$dateGroup",
            category: "$rootCategory.name",
          },
          totalSales: { $sum: "$saleAmount" },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          sales: {
            $push: {
              category: "$_id.category",
              amount: "$totalSales",
            },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ];

    const results = await Order.aggregate(pipeline);

    // Format chart output
    const labels = [];
    const fashionSales = [];
    const electronicsSales = [];

    results.forEach((item) => {
      labels.push(item._id);
      const fashion = item.sales.find((s) => s.category === "Fashion");
      const electronics = item.sales.find((s) => s.category === "Electronics");
      fashionSales.push(fashion ? fashion.amount : 0);
      electronicsSales.push(electronics ? electronics.amount : 0);
    });

    res.json({ labels, fashionSales, electronicsSales });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating sales analytics" });
  }
};
module.exports = {
  getSalesAnalytics,
};
