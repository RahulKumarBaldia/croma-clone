const express = require("express")
const router = express.Router()
const { createOrder, verifyPayment } = require("../controllers/Paymentcontroller.js")
const { protect } = require("../middlewares/Authmiddleware.js")

// Order create karo
router.post("/create-order", protect, createOrder)

// Payment verify karo
router.post("/verify-payment", protect, verifyPayment)

module.exports = router