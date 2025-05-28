// controllers/cartController.js
const Cart = require("../model/Cart");
const Product = require("../model/Product");

// 1. Add or update product in cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity, selectedVariant } = req.body;
    const userId = req.userId; // assume user is already authenticated

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cart = await Cart.findOne({ user: userId });

    const newItem = {
      product: productId,
      quantity: quantity || 1,
      selectedVariant,
      priceAtAddition: product.price,
    };

    if (!cart) {
      // Create new cart
      cart = new Cart({
        user: userId,
        items: [newItem],
      });
    } else {
      const index = cart.items.findIndex(
        (item) =>
          item.product.toString() === productId &&
          item.selectedVariant?.color === selectedVariant?.color &&
          item.selectedVariant?.size === selectedVariant?.size
      );

      if (index > -1) {
        // If item exists (with same variant), update quantity
        cart.items[index].quantity += quantity;
      } else {
        cart.items.push(newItem);
      }
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// 2. Get user's cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.userId;

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart) return res.status(200).json({ items: [] });

    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: "Failed to get cart" });
  }
};

// 3. Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, selectedVariant } = req.body;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) =>
        item.product.toString() !== productId ||
        item.selectedVariant?.color !== selectedVariant?.color ||
        item.selectedVariant?.size !== selectedVariant?.size
    );

    await cart.save();
    res.status(200).json({ message: "Item removed", cart });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove item" });
  }
};

// 4. Update quantity
exports.updateCartQuantity = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, selectedVariant, quantity } = req.body;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.selectedVariant?.color === selectedVariant?.color &&
        item.selectedVariant?.size === selectedVariant?.size
    );

    if (!item)
      return res.status(404).json({ message: "Item not found in cart" });

    item.quantity = quantity;
    await cart.save();

    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: "Failed to update quantity" });
  }
};

// 5. Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.userId;
    await Cart.findOneAndUpdate({ user: userId }, { items: [] });
    res.status(200).json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear cart" });
  }
};
