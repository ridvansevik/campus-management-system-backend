const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Klasör yoksa oluştur (uploads/profile_images)
const uploadDir = 'uploads/profile_images';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});


// Dosya filtresi (Sadece resimler)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları (jpeg, jpg, png, gif) yüklenebilir!'));
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB [cite: 437]
  fileFilter: fileFilter
});

module.exports = upload;