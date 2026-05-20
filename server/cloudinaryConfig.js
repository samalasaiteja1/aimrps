const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_CLOUD_NAME !== "your_cloud_name" &&
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_KEY !== "your_api_key" &&
  process.env.CLOUDINARY_API_SECRET && 
  process.env.CLOUDINARY_API_SECRET !== "your_api_secret";

let storage;
let upload;

if (isCloudinaryConfigured) {
  console.log("Cloudinary: Configured successfully. Storing files on Cloudinary.");
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: "aimrps-posts",
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
    },
  });
  upload = multer({ storage: storage });
} else {
  console.warn("Cloudinary: Credentials not set or default placeholders found. Falling back to local disk storage.");
  
  // Ensure local uploads directory exists
  const uploadDir = path.join(__dirname, "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  });

  upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      const filetypes = /jpeg|jpg|png|webp/;
      const mimetype = filetypes.test(file.mimetype);
      const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
      if (mimetype && extname) {
        return cb(null, true);
      }
      cb(new Error("Only images (jpeg, jpg, png, webp) are allowed"));
    }
  });
}

const deleteImage = async (imageUrl, imagePublicId) => {
  if (!imageUrl) return;

  if (isCloudinaryConfigured && imagePublicId) {
    try {
      await cloudinary.uploader.destroy(imagePublicId);
      console.log(`Cloudinary: Image deleted successfully (${imagePublicId})`);
    } catch (error) {
      console.error(`Cloudinary: Error deleting image (${imagePublicId}):`, error.message);
    }
  } else {
    // Local deletion
    try {
      const filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
      const filePath = path.join(__dirname, "uploads", filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Local: Image deleted successfully (${filename})`);
      }
    } catch (error) {
      console.error("Local: Error deleting image:", error.message);
    }
  }
};

module.exports = {
  upload,
  deleteImage,
  isCloudinaryConfigured,
};
