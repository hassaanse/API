// models/CampaignWatch.js
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const Campaign = require('./Campaign'); // Correct the import statement
const User = require('./User');

class CampaignWatch extends Model {}

CampaignWatch.init({
  watchId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  campaignId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  watchDuration: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  usersWatched: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  locality: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'CampaignWatch'
});

// Define associations


module.exports = CampaignWatch;
