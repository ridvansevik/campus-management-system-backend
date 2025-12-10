const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Faculty extends Model {
    static associate(models) {
      // User ile ilişki
      Faculty.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      // Bölüm ile ilişki
      Faculty.belongsTo(models.Department, { foreignKey: 'departmentId', as: 'department' });
    }
  }

  Faculty.init({
    employee_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    title: {
      type: DataTypes.ENUM('Prof. Dr.', 'Doç. Dr.', 'Dr. Öğr. Üyesi', 'Arş. Gör.', 'Öğr. Gör.', 'Okutman'),
      allowNull: false
    },
    office_location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    office_phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    specialization: {
      type: DataTypes.STRING,
      allowNull: true
    },
    hire_date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('active', 'on_leave', 'retired'),
      defaultValue: 'active'
    }
  }, {
    sequelize,
    modelName: 'Faculty',
    tableName: 'faculties', // Dikkat: Sequelize çoğul yapar, tablo adı 'faculties' olur
    underscored: true
  });

  return Faculty;
};