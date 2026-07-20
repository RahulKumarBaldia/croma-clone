const Product = require("../models/Productmodel");

// ─── Get All Products ─────────────────────────────────────────────────────────
// GET /api/products
const getProducts = async (req, res) => {
  try {
    const { category, brand, search } = req.query;

    // Filter object
    let filter = {};

    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Get Single Product ───────────────────────────────────────────────────────
// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Create Product (Admin) ───────────────────────────────────────────────────
// POST /api/products
const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Update Product (Admin) ───────────────────────────────────────────────────
// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Delete Product (Admin) ───────────────────────────────────────────────────
// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Add Review ───────────────────────────────────────────────────────────────
// POST /api/products/:id/reviews
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check karo user ne pehle review diya hai ya nahi
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ message: "Product already reviewed" });
    }

    // Check karo user ne ye product kharida hai (delivered order mein)
    const Order = require("../models/Ordermodel");
    const verifiedOrder = await Order.findOne({
      user: req.user._id,
      status: "Delivered",
      "items.product": req.params.id,
    });

    if (!verifiedOrder) {
      return res.status(403).json({ message: "You can only review products you have purchased and received." });
    }

    // Naya review add karo
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
      verifiedPurchase: true,
    };
    product.reviews.push(review);

    // Average rating calculate karo
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Review added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
};