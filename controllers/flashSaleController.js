const FlashSale = require("../model/FlashSale");
const Product = require("../model/Product");

// Helper: Parse date string safely
function parseDate(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return null; // invalid date
  }
  return date;
}

// Create new flash sale entry
exports.createFlashSale = async (req, res) => {
  try {
    const { product, discountPercent, salePrice, startDate, endDate } = req.body;

    // Validate required fields
    if (!product || (!discountPercent && !salePrice) || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Validate discountPercent if provided
    if (discountPercent !== undefined) {
      if (typeof discountPercent !== "number" || discountPercent < 0 || discountPercent > 100) {
        return res.status(400).json({ message: "discountPercent must be a number between 0 and 100." });
      }
    }

    // Validate salePrice if provided
    if (salePrice !== undefined) {
      if (typeof salePrice !== "number" || salePrice < 0) {
        return res.status(400).json({ message: "salePrice must be a positive number." });
      }
    }

    // Check if product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Parse dates
    const start = parseDate(startDate);
    const end = parseDate(endDate);

    if (!start || !end) {
      return res.status(400).json({ message: "Invalid date format for startDate or endDate." });
    }

    if (start >= end) {
      return res.status(400).json({ message: "startDate must be before endDate." });
    }

    // Create flash sale
    const flashSale = new FlashSale({
      product,
      discountPercent,
      salePrice,
      startDate: start,
      endDate: end,
    });

    await flashSale.save();

    res.status(201).json({ message: "Flash sale created successfully", flashSale });
  } catch (error) {
    console.error("Error creating flash sale:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get all flash sales, optional filter for active only
exports.getFlashSales = async (req, res) => {
  try {
    const { active } = req.query;
    const now = new Date();

    let filter = {};
    if (active === "true") {
      filter = {
        startDate: { $lte: now },
        endDate: { $gte: now },
      };
    }

    const flashSales = await FlashSale.find(filter).populate("product");

    res.json({ flashSales });
  } catch (error) {
    console.error("Error fetching flash sales:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Get single flash sale by ID
exports.getFlashSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const flashSale = await FlashSale.findById(id).populate("product");
    if (!flashSale) {
      return res.status(404).json({ message: "Flash sale not found." });
    }
    res.json(flashSale);
  } catch (error) {
    console.error("Error fetching flash sale:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Update flash sale by ID
exports.updateFlashSale = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate dates if provided
    if (updates.startDate) {
      const start = parseDate(updates.startDate);
      if (!start) {
        return res.status(400).json({ message: "Invalid startDate format." });
      }
      updates.startDate = start;
    }

    if (updates.endDate) {
      const end = parseDate(updates.endDate);
      if (!end) {
        return res.status(400).json({ message: "Invalid endDate format." });
      }
      updates.endDate = end;
    }

    if (updates.startDate && updates.endDate && updates.startDate >= updates.endDate) {
      return res.status(400).json({ message: "startDate must be before endDate." });
    }

    // Validate salePrice
    if (updates.salePrice !== undefined) {
      if (typeof updates.salePrice !== "number" || updates.salePrice < 0) {
        return res.status(400).json({ message: "salePrice must be a positive number." });
      }
    }

    // If product is updated, check if exists
    if (updates.product) {
      const productExists = await Product.findById(updates.product);
      if (!productExists) {
        return res.status(404).json({ message: "Product not found." });
      }
    }

    const flashSale = await FlashSale.findByIdAndUpdate(id, updates, { new: true });
    if (!flashSale) {
      return res.status(404).json({ message: "Flash sale not found." });
    }

    res.json({ message: "Flash sale updated", flashSale });
  } catch (error) {
    console.error("Error updating flash sale:", error);
    res.status(500).json({ message: "Server error." });
  }
};

// Delete flash sale by ID
exports.deleteFlashSale = async (req, res) => {
  try {
    const { id } = req.params;
    const flashSale = await FlashSale.findByIdAndDelete(id);
    if (!flashSale) {
      return res.status(404).json({ message: "Flash sale not found." });
    }
    res.json({ message: "Flash sale deleted" });
  } catch (error) {
    console.error("Error deleting flash sale:", error);
    res.status(500).json({ message: "Server error." });
  }
};
