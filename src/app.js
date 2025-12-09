const express = require('express');
const dotenv = require('dotenv');
const { sequelize } = require('./models'); 
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const cors = require('cors');
const { swaggerUi, swaggerSpec } = require('./config/swagger');
const path = require('path');
const errorHandler = require('./middleware/error');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const logger = require('./utils/logger'); // Import et

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  'http://localhost:5173',                                   // local geliştirme
  process.env.FRONTEND_URL,                                  // env’den (Railway frontend URL)
];

app.use(cors({
  origin: (origin, callback) => {
    // Postman / server-side isteklerde origin null olur, onlara izin verelim
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // İzin verilmeyen origin
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,               // cookie / auth header kullanıyorsan
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(xss());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Çok fazla istek gönderdiniz, lütfen 15 dakika sonra deneyin.'
});
app.use('/api', limiter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Veritabanı bağlantısı başarılı.'); // console.log yerine

    await sequelize.sync({ alter: true });
    console.log('Tablolar senkronize edildi.');

   app.listen(PORT, () => {
      logger.info(`Sunucu ${process.env.NODE_ENV} modunda ${PORT} portunda çalışıyor.`);
    });
  } catch (error) {
    logger.error(`Sunucu başlatılamadı: ${error.message}`);
  }
};
startServer();
module.exports = app;