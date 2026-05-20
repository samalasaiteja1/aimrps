const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
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
  text: {
    type: String,
    required: [true, "Comment content is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Comment", commentSchema);
