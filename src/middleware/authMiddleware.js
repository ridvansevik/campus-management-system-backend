const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.User;

// Giriş yapmış kullanıcıyı doğrulama
exports.protect = async (req, res, next) => {
  let token;

  // 1. Header'da "Authorization: Bearer <token>" var mı kontrol et
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Bu işlem için giriş yapmalısınız.' });
  }

  try {
    // 2. Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Token içindeki id'ye sahip kullanıcı hala var mı kontrol et
    const currentUser = await User.findByPk(decoded.id);
    if (!currentUser) {
      return res.status(401).json({ success: false, message: 'Bu tokena ait kullanıcı artık yok.' });
    }

    // 4. Kullanıcı bilgisini request nesnesine ekle (Controller'da kullanmak için)
    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Geçersiz token, lütfen tekrar giriş yapın.' });
  }
};

// Rol tabanlı yetkilendirme (Örn: Sadece admin veya faculty)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Bu işlem için yetkiniz yok. Gereken: ${roles.join(', ')}` 
      });
    }
    next();
  };
};