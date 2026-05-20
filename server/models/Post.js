const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  content: {
    type: String,
    required: [true, "Content is required"],
  },
  imageUrl: {
    type: String,
    default: "",
  },
  imagePublicId: {
    type: String,
    default: "",
  },
  likes: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", postSchema);
