const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const UserCampaignVideos = require('./UserCampaignVideos');
const Video = require('./Video');
const UserR = require('./UserR');

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

Video.hasMany(Location, { foreignKey: 'videoId' });
Location.belongsTo(Video, { foreignKey: 'videoId' });

UserR.hasMany(Location, { foreignKey: 'userId' });
Location.belongsTo(UserR, { foreignKey: 'userId' });

UserCampaignVideos.hasMany(Location, { foreignKey: 'ucvId' });
Location.belongsTo(UserCampaignVideos, { foreignKey: 'ucvId' });



module.exports = Location;
