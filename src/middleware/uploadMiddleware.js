const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const logger = require('../utils/logger');

/**
 * Cloudinary Upload Middleware
 * 
 * Handles profile image uploads to Cloudinary cloud storage.
 * 
 * Required environment variables:
 * - CLOUDINARY_CLOUD_NAME: Your Cloudinary cloud name
 * - CLOUDINARY_API_KEY: Your Cloudinary API key
 * - CLOUDINARY_API_SECRET: Your Cloudinary API secret
 * 
 * File constraints:
 * - Max size: 5MB
 * - Allowed formats: jpg, jpeg, png
 * - Stored in folder: kampus-profil-fotolari
 */

// 1. Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Verify Cloudinary configuration on startup
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  logger.warn('Cloudinary credentials not fully configured. Profile image uploads may fail.');
} else {
  logger.info('Cloudinary storage configured successfully');
}

// 2. Storage Engine Configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kampus-profil-fotolari', // Cloudinary folder name
    allowed_formats: ['jpg', 'png', 'jpeg'], // Allowed file formats
    transformation: [{ width: 800, height: 800, crop: 'limit' }], // Optional: resize images
    public_id: (req, file) => {
      // Generate unique filename: userId_timestamp
      return `profile_${req.user.id}_${Date.now()}`;
    }
  },
});

// 3. File Filter - Additional validation
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Geçersiz dosya formatı. Sadece JPG, JPEG ve PNG dosyaları kabul edilir.'), false);
  }
};

// 4. Create Multer Upload Instance
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: fileFilter
});

module.exports = upload;