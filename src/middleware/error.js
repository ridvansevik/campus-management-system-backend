const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  
  // Error nesnesinin 'message' özelliği kopyalanmaz, elle alıyoruz.
  error.message = err.message; 

  // Debug için konsola basalım (Geliştirme aşamasında)
  console.log("Hata Yakalandı:", err.name, err.message); 
  
  // Winston ile logla
  logger.error(`${err.message} \n ${err.stack}`);

  // 1. Multer File Upload Errors (Cloudinary/Local)
  if (err.name === 'MulterError') {
    let message = 'Dosya yükleme hatası';
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Dosya boyutu çok büyük. Maksimum 5MB yüklenebilir.';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      message = 'Çok fazla dosya gönderildi.';
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'Beklenmeyen dosya alanı. Lütfen "profile_image" alanını kullanın.';
    }
    
    error = new ErrorResponse(message, 400);
  }

  // 2. File Filter Errors (Invalid file type)
  if (err.message && err.message.includes('Geçersiz dosya formatı')) {
    error = new ErrorResponse(err.message, 400);
  }

  // 3. Geçersiz ID (Örn: UUID yerine rastgele string)
  if (err.name === 'SequelizeDatabaseError' && err.parent && err.parent.code === '22P02') {
    const message = 'Geçersiz ID formatı';
    error = new ErrorResponse(message, 400);
  }

  // 4. Duplicate Key (Örn: Aynı email ile kayıt)
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Bu veri zaten sistemde kayıtlı.';
    error = new ErrorResponse(message, 400);
  }

  // 5. Validation Error (Eksik alan vb.)
  if (err.name === 'SequelizeValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ErrorResponse(message, 400);
  }

  // 6. JWT Errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Geçersiz token. Lütfen tekrar giriş yapın.';
    error = new ErrorResponse(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token süresi dolmuş. Lütfen tekrar giriş yapın.';
    error = new ErrorResponse(message, 401);
  }

  // Yanıtı Döndür
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Sunucu Hatası'
  });
};

module.exports = errorHandler;