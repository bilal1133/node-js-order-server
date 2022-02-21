const mongoose = require("mongoose");

const informationSchema = new mongoose.Schema({
  information: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Information", informationSchema);
