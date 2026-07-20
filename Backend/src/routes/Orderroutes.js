const express = require("express");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
} = require("../controllers/Ordercontroller");
const { protect, isAdmin } = require("../middlewares/Authmiddleware");

const router = express.Router();

// Protected routes — login hona zaroori
router.post("/", protect, createOrder);
router.get("/myorders", protect, getMyOrders);        // ✅ Pehle aana chahiye
router.get("/:id", protect, getOrderById);

// Admin only
router.get("/", protect, isAdmin, getAllOrders);      // ✅ Baad mein
router.put("/:id/status", protect, isAdmin, updateOrderStatus);

module.exports = router;