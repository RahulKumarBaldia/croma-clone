const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/Authroutes"));
app.use("/api/products", require("./routes/Productroutes"));
app.use("/api/cart", require("./routes/Cartroutes"));
app.use("/api/orders", require("./routes/Orderroutes"));
app.use("/api/payment", require("./routes/Paymentroutes"));

app.get("/", (req, res) => {
  res.json({ message: "Croma Clone API is running!" });
});

module.exports = app;