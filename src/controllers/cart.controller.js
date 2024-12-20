const Cart = require('../models/cart.model');

// Obtener el carrito
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne().populate('products.productId');
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Agregar producto al carrito
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne();

    if (!cart) {
      cart = new Cart({ products: [] });
    }

    const productIndex = cart.products.findIndex(p => p.productId.toString() === productId);
    if (productIndex > -1) {
      cart.products[productIndex].quantity += quantity;
    } else {
      cart.products.push({ productId, quantity });
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
