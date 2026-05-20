const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  author: {
    type: String,
    required: [true, "Author name is required"],
    trim: true,
  },
  rating: {
    type: Number,
    required: [true, "Rating is required"],
    min: [1, "Rating must be at least 1"],
    max: [5, "Rating cannot be more than 5"],
  },
  text: {
    type: String,
    required: [true, "Review message is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Review", reviewSchema);
