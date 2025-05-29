const Product = require("../model/Product");

exports.getNewArrivals = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 }) // Sort by most recent
      .limit(10);              // Limit to 10 products

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Error getting new arrivals:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching new arrivals',
    });
  }
};