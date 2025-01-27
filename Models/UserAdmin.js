const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserAdmin = sequelize.define('UserAdmin', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'salesperson'), allowNull: false },
  verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  verificationToken: { type: DataTypes.STRING },
  resetToken: { type: DataTypes.STRING },
  resetTokenExpire: { type: DataTypes.DATE },
});

module.exports = UserAdmin;
