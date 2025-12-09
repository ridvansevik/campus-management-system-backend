'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const db = {};

// .env dosyasını yükle
require('dotenv').config();

let sequelize;

// Veritabanı bağlantısını .env değişkenleri ile oluştur
if (process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASS) {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      dialect: 'postgres', // PostgreSQL kullandığımızı belirtiyoruz
      port: process.env.DB_PORT || 5432,
      logging: false, // Konsol kirliliğini önlemek için SQL loglarını kapatabilirsin
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
} else {
  console.error("HATA: .env dosyasında veritabanı bilgileri eksik!");
}

// Klasördeki model dosyalarını (user.js, student.js vb.) otomatik yükle
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Modeller arası ilişkileri kur (associate)
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;