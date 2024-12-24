const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const UserCampaignVideos = require('./UserCampaignVideos');
const Video = require('./Video');

const Location = sequelize.define('Location', {
  LocationId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
},
    Lat:{
        type:DataTypes.STRING,
        allowNull:false 
    },
    Long:{
        type:DataTypes.STRING,
        allowNull:false 
    },
    City:{
      type:DataTypes.STRING,
      allowNull:false
    },


  watchDuration: {
    type: DataTypes.FLOAT,
    defaultValue: 0, // Total watch duration for this video
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0, // Number of times the user has viewed this video
  },
  
});

UserCampaignVideos.hasMany(Location, { foreignKey: 'userCampaignVideoId' });
Location.belongsTo(UserCampaignVideos, { foreignKey: 'userCampaignVideoId' });



module.exports = Location;
