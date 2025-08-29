// middleware/Upload.js
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary with your credentials from the .env file
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

// Create different storage configurations for different upload types
const createCloudinaryStorage = (folderName) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folderName, // Cloudinary folder name
      allowed_formats: ['jpeg', 'jpg', 'png', 'webp'], // Define allowed image formats
    },
  });
};

// File filter with enhanced validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  
  // Check file type
  const isValidType = allowedTypes.test(file.mimetype);
  
  if (!isValidType) {
    return cb(new Error("Only images (jpg, jpeg, png, webp) are allowed"), false);
  }
  
  cb(null, true);
};

// NEW: Profile image upload (single file)
const profileImageUpload = multer({
  storage: createCloudinaryStorage("profileImages"),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  }
});

// NEW: Room photos upload (multiple files)
const roomPhotosUpload = multer({
  storage: createCloudinaryStorage("roomPhotos"),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10 // Maximum 10 room photos
  }
});

// NEW: General image upload (flexible)
const imageUpload = multer({
  storage: createCloudinaryStorage("general"),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5
  }
});

// NEW: Helper function to delete file from Cloudinary
const deleteFileFromCloudinary = async (public_id) => {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    return result;
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    return false;
  }
};

module.exports = {
  // Legacy single upload (for backward compatibility)
  upload: imageUpload.single('image'),
  
  // NEW: Specific upload types
  profileImage: profileImageUpload.single('profileImage'),
  roomPhotos: roomPhotosUpload.array('images', 10),
  images: imageUpload.array('images', 5),
  
  // NEW: Helper function
  deleteFileFromCloudinary,
  
  // NEW: Middleware to handle upload errors
  handleUploadError: (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
      }
      if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ message: 'Too many files. Maximum is 10 files.' });
      }
      if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ message: 'Unexpected file field.' });
      }
    }
    
    if (error.message.includes('Only images')) {
      return res.status(400).json({ message: error.message });
    }
    
    return res.status(500).json({ message: 'Upload error occurred.' });
  }
};