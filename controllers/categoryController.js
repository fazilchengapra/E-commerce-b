const Category = require('../model/Category');
const slugify = require('slugify');

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, parent, image } = req.body;
    const slug = slugify(name, { lower: true });

    // Check if category with same slug already exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = new Category({
      name,
      slug,
      parent: parent || null,
      image
    });

    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create category', error: err.message });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('parent', 'name');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories', error: err.message });
  }
};

// Get single category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('parent', 'name');
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch category', error: err.message });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { name, parent, image } = req.body;
    const updates = { name, image };

    if (name) {
      updates.slug = slugify(name, { lower: true });
    }

    if (parent !== undefined) {
      updates.parent = parent || null;
    }

    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(updatedCategory);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update category', error: err.message });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);

    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete category', error: err.message });
  }
};
