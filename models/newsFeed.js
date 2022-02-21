const mongoose = require("mongoose");

const newsFeedSchema = new mongoose.Schema({
  newsFeed: {
    type: String,
    required: true,
    trim: true,
  },
});

module.exports = mongoose.model("NewsFeed", newsFeedSchema);
