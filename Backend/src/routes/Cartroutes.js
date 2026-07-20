const express = require("express");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/Cartcontroller");
const { protect } = require("../middlewares/Authmiddleware");

const router = express.Router();

// Sab routes protected hain — login hona zaroori
router.get("/get", protect, getCart);
router.post("/add", protect, addToCart);
router.put("/update/:productId", protect, updateCartItem);
router.delete("/remove/:productId", protect, removeFromCart);
router.delete("/delete", protect, clearCart);

module.exports = router;