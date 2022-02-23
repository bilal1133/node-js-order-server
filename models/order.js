const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        qty: {
          type: Number,
          required: true,
        },
        price_atm: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

function arrayLimit(val) {
  return val.length < 0;
}

module.exports = mongoose.model("Order", orderSchema);
