const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserR = sequelize.define('UserR', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  }
  ,
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  vehicleYear: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  watchTime:{
    type:DataTypes.FLOAT,
    allowNull:true,
    defaultValue: 0},

  views:{
    type:DataTypes.INTEGER,
    allowNull:true,
    defaultValue: 0
  },
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
  },
  vehicleMake: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  vehicleModel: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  driverLicensePath: {
    type: DataTypes.STRING,
  },
  proofOfVehiclePath: {
    type: DataTypes.STRING,
  },
  proofOfInsurancePath: {
    type: DataTypes.STRING,
  },
  DeviceAccessToken:{
    type:DataTypes.STRING,
    allowNull:false
  }
});

module.exports = UserR;
