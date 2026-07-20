const Razorpay = require("razorpay")
const crypto = require("crypto")

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})

// Step 1 — Order create karo
const createOrder = async (req, res) => {
  try {
    const { amount } = req.body

    const order = await razorpay.orders.create({
      amount: amount * 100, // paise mein
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    })

    res.status(200).json({
      success: true,
      order
    })

  } catch (err) {
    res.status(500).json({ message: "Order create nahi hua" })
  }
}

// Step 2 — Payment verify karo
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    const sign = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex")

    if(razorpay_signature === expectedSign) {
      res.status(200).json({ success: true, message: "Payment verified ✅" })
    } else {
      res.status(400).json({ success: false, message: "Payment invalid ❌" })
    }

  } catch (err) {
    res.status(500).json({ message: "Verification failed" })
  }
}

module.exports = { createOrder, verifyPayment }