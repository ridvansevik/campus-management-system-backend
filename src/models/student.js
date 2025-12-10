const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Student extends Model {
    static associate(models) {
      // User ile ilişki
      Student.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      // Bölüm ile ilişki
      Student.belongsTo(models.Department, { foreignKey: 'departmentId', as: 'department' });
    }
  }

  Student.init({
    student_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    gpa: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
      validate: {
        min: 0.0,
        max: 4.0
      }
    },
    cgpa: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
      validate: {
        min: 0.0,
        max: 4.0
      }
    },
    current_semester: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 12
      }
    },
    enrollment_date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW
    },
    graduation_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'graduated', 'suspended', 'withdrawn'),
      defaultValue: 'active'
    }
  }, {
    sequelize,
    modelName: 'Student',
    tableName: 'students',
    underscored: true
  });

  return Student;
};