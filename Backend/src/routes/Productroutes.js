const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
} = require("../controllers/Productcontroller");
const { protect, isAdmin } = require("../middlewares/Authmiddleware");

const router = express.Router();

// Public routes — koi bhi dekh sakta hai
router.get("/", getProducts);
router.get("/:id", getProductById);

// Protected routes — login hona zaroori
router.post("/:id/reviews", protect, addReview);

// Admin only routes
router.post("/create", protect, isAdmin, createProduct);
router.put("/update/:id", protect, isAdmin, updateProduct);
router.delete("/delete/:id", protect, isAdmin, deleteProduct);

module.exports = router;