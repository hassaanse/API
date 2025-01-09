// models/User.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class User extends Model {}

User.init({
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userName:{
   type: DataTypes.STRING,
   allowNull:false 
  },
  userEmail:{
    type:DataTypes.STRING,
    allowNull:false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  watchTime:{
    type:DataTypes.FLOAT,
    allowNull:true,
    defaultValue: 0
  },
  views:{
    type:DataTypes.INTEGER,
    allowNull:true,
    defaultValue: 0
  },
  Type:{
    type:DataTypes.STRING,
    allowNull:true
  },
  password:{
    type:DataTypes.STRING,
    allowNull:false
  }
}, {
  sequelize,
  modelName: 'User'
});

module.exports = User;