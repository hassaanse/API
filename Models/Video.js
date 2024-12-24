const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Video = sequelize.define('Video', {
  videoId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
},
  path: {
    type: DataTypes.STRING, // To store the file path of the video
    allowNull: false,
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  watchDuration: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  totalDuration: {
    type: DataTypes.FLOAT,
    allowNull: false, // Assume this is a required field
  },
  order:{
    type:DataTypes.INTEGER,
    allowNull:false
  },
 
  campaignId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Campaigns', // Name of the referenced table
      key: 'campaignId',  // Field in the referenced table
    },
  },
});

module.exports = Video;
