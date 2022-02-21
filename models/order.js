const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  date: {
    created_at: Date,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  order: [{ type: mongoose.Schema.Types.ObjectId, ref: "product" }],
  amount: Number, // where to put the amount from the products,
});

module.exports = mongoose.model("Order", orderSchema);
