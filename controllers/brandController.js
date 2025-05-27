const Brand = require('../model/Brand');

// Create a new brand
exports.createBrand = async (req, res) => {
  try {
    const { name, logo } = req.body;

    if (!name) return res.status(400).json({ message: 'Brand name is required.' });

    const existing = await Brand.findOne({ name });
    if (existing) return res.status(409).json({ message: 'Brand already exists.' });

    const brand = new Brand({ name, logo });
    await brand.save();

    res.status(201).json(brand);
  } catch (error) {
    res.status(500).json({ message: 'Error creating brand', error });
  }
};

// Get all brands
exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching brands', error });
  }
};

// Get a single brand by ID
exports.getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });

    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching brand', error });
  }
};

// Update a brand by ID
exports.updateBrand = async (req, res) => {
  try {
    const { name, logo } = req.body;

    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      { name, logo },
      { new: true, runValidators: true }
    );

    if (!brand) return res.status(404).json({ message: 'Brand not found' });

    res.json(brand);
  } catch (error) {
    res.status(500).json({ message: 'Error updating brand', error });
  }
};

// Delete a brand by ID
exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });

    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting brand', error });
  }
};
