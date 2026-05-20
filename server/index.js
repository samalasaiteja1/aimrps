require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const connectDB = require("./db");
const { upload, deleteImage, isCloudinaryConfigured } = require("./cloudinaryConfig");

// Models
const Post = require("./models/Post");
const Comment = require("./models/Comment");
const Review = require("./models/Review");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder statically if not using Cloudinary
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || "aimrps_super_secret_jwt_key_123";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// Authentication Middleware
const authAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication token required" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// --- AUTH ROUTES ---
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: "24h" });
    return res.json({ token, message: "Logged in successfully" });
  } else {
    return res.status(401).json({ message: "Invalid password" });
  }
});

app.get("/api/admin/verify", authAdmin, (req, res) => {
  res.json({ valid: true, message: "Token is valid" });
});

// --- POST ROUTES ---

// GET all posts
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    
    // Add additional aggregate statistics (comment and review counts/averages) to each post
    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        const commentsCount = await Comment.countDocuments({ post: post._id });
        const reviews = await Review.find({ post: post._id });
        
        const reviewCount = reviews.length;
        const avgRating =
          reviewCount > 0
            ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
            : 0;

        return {
          ...post.toObject(),
          commentsCount,
          reviewCount,
          avgRating,
        };
      })
    );

    res.json(postsWithDetails);
  } catch (error) {
    console.error("Error fetching posts:", error.message);
    res.status(500).json({ message: "Server error fetching posts" });
  }
});

// GET single post with details (including comments and reviews)
app.get("/api/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comments = await Comment.find({ post: post._id }).sort({ createdAt: -1 });
    const reviews = await Review.find({ post: post._id }).sort({ createdAt: -1 });

    const reviewCount = reviews.length;
    const avgRating =
      reviewCount > 0
        ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
        : 0;

    res.json({
      ...post.toObject(),
      comments,
      reviews,
      reviewCount,
      avgRating,
    });
  } catch (error) {
    console.error("Error fetching single post:", error.message);
    res.status(500).json({ message: "Server error fetching post" });
  }
});

// CREATE post (Admin only)
app.post("/api/posts", authAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    let imageUrl = "";
    let imagePublicId = "";

    if (req.file) {
      if (isCloudinaryConfigured) {
        imageUrl = req.file.path; // Cloudinary URL
        imagePublicId = req.file.filename; // Cloudinary Public ID
      } else {
        // Fallback local URL
        imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        imagePublicId = req.file.filename;
      }
    }

    const post = new Post({
      title,
      content,
      imageUrl,
      imagePublicId,
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating post:", error.message);
    res.status(500).json({ message: "Server error creating post" });
  }
});

// UPDATE post (Admin only)
app.put("/api/posts/:id", authAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (title) post.title = title;
    if (content) post.content = content;

    if (req.file) {
      // Delete old image if it exists
      if (post.imageUrl) {
        await deleteImage(post.imageUrl, post.imagePublicId);
      }

      // Add new image path
      if (isCloudinaryConfigured) {
        post.imageUrl = req.file.path;
        post.imagePublicId = req.file.filename;
      } else {
        post.imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        post.imagePublicId = req.file.filename;
      }
    }

    await post.save();
    res.json(post);
  } catch (error) {
    console.error("Error updating post:", error.message);
    res.status(500).json({ message: "Server error updating post" });
  }
});

// LIKE post
app.put("/api/posts/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    
    post.likes = (post.likes || 0) + 1;
    await post.save();
    
    res.json({ likes: post.likes });
  } catch (error) {
    console.error("Error liking post:", error.message);
    res.status(500).json({ message: "Server error liking post" });
  }
});

// DELETE post (Admin only)
app.delete("/api/posts/:id", authAdmin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Delete post image
    if (post.imageUrl) {
      await deleteImage(post.imageUrl, post.imagePublicId);
    }

    // Cascade delete: Remove all comments and reviews belonging to this post
    await Comment.deleteMany({ post: post._id });
    await Review.deleteMany({ post: post._id });

    // Remove post
    await Post.findByIdAndDelete(post._id);

    res.json({ message: "Post and all related comments/reviews deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error.message);
    res.status(500).json({ message: "Server error deleting post" });
  }
});

// --- COMMENT ROUTES ---

// CREATE comment on a post
app.post("/api/posts/:postId/comments", async (req, res) => {
  try {
    const { author, text } = req.body;
    const { postId } = req.params;

    if (!author || !text) {
      return res.status(400).json({ message: "Author name and comment content are required" });
    }

    const postExists = await Post.exists({ _id: postId });
    if (!postExists) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = new Comment({
      post: postId,
      author,
      text,
    });

    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    console.error("Error adding comment:", error.message);
    res.status(500).json({ message: "Server error adding comment" });
  }
});

// UPDATE comment
app.put("/api/comments/:id", async (req, res) => {
  try {
    const { author, text } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (author) comment.author = author;
    if (text) comment.text = text;

    await comment.save();
    res.json(comment);
  } catch (error) {
    console.error("Error updating comment:", error.message);
    res.status(500).json({ message: "Server error updating comment" });
  }
});

// DELETE comment
app.delete("/api/comments/:id", async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    res.json({ message: "Comment deleted successfully", comment });
  } catch (error) {
    console.error("Error deleting comment:", error.message);
    res.status(500).json({ message: "Server error deleting comment" });
  }
});

// --- REVIEW ROUTES ---

// CREATE review on a post
app.post("/api/posts/:postId/reviews", async (req, res) => {
  try {
    const { author, rating, text } = req.body;
    const { postId } = req.params;

    if (!author || rating === undefined || !text) {
      return res.status(400).json({ message: "Author, rating, and review text are required" });
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: "Rating must be an integer between 1 and 5" });
    }

    const postExists = await Post.exists({ _id: postId });
    if (!postExists) {
      return res.status(404).json({ message: "Post not found" });
    }

    const review = new Review({
      post: postId,
      author,
      rating: ratingNum,
      text,
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    console.error("Error adding review:", error.message);
    res.status(500).json({ message: "Server error adding review" });
  }
});

// UPDATE review
app.put("/api/reviews/:id", async (req, res) => {
  try {
    const { author, rating, text } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (author) review.author = author;
    if (rating !== undefined) {
      const ratingNum = Number(rating);
      if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      review.rating = ratingNum;
    }
    if (text) review.text = text;

    await review.save();
    res.json(review);
  } catch (error) {
    console.error("Error updating review:", error.message);
    res.status(500).json({ message: "Server error updating review" });
  }
});

// DELETE review
app.delete("/api/reviews/:id", async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json({ message: "Review deleted successfully", review });
  } catch (error) {
    console.error("Error deleting review:", error.message);
    res.status(500).json({ message: "Server error deleting review" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Fallback local storage is at: ${path.join(__dirname, "uploads")}`);
});
