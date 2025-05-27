const Product = require('../model/Product');
const slugify = require('slugify');

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    let { name, description, category, brand, price, discount, images, variants, isFeatured, rating, reviewsCount} = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: 'Name, price, and category are required' });
    }

    const slug = slugify(name, { lower: true });

    const existing = await Product.findOne({ slug });
    if (existing) {
      return res.status(409).json({ message: 'Product with this name already exists' });
    }

    const product = new Product({
      name,
      slug,
      description,
      category,
      brand,
      price,
      discount,
      images,
      variants,
      isFeatured,
      rating,
      reviewsCount
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category', 'name')
      .populate('brand', 'name logo')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error });
  }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('brand', 'name logo');

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const updates = req.body;
    if (updates.name) {
      updates.slug = slugify(updates.name, { lower: true });
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error });
  }
};
