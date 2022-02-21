const mongoose = require("mongoose");

const categorieSchema = new mongoose.Schema({
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
});

module.exports = mongoose.model("Categorie", categorieSchema);
