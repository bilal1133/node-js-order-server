const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    trim: true,
  },
  information: {
    type: String,
    required: true,
    trim: true,
  },
  categorie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "categorie",
    required: true,
  },
});

module.exports = mongoose.model("Product", productSchema);
