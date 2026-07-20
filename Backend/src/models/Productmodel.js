const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    verifiedPurchase: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Headphones",
        "TWS Earbuds",
        "Laptops",
        "Smartphones",
        "Home Appliances",
        "Speakers",
      ],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    originalPrice: {
      type: Number,
      required: [true, "Original price is required"],
    },
    images: [
      {
        type: String, // image URLs
      },
    ],
    specs: [
      {
        type: String, // ["ANC", "30hr Battery", "BT 5.3"]
      },
    ],
    highlights: [
      {
        type: String, // bullet points for product detail page
      },
    ],
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    badge: {
      type: String, // "Best Seller", "Trending" etc
      default: "",
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);