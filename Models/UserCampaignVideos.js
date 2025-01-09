const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const UserCampaignsStarted = require('./UserCampaignsStarted');
const Video = require('./Video');

const UserCampaignVideos = sequelize.define('UserCampaignVideos', {
  userCampaignVideoId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
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

UserCampaignsStarted.hasMany(UserCampaignVideos, { foreignKey: 'userCampaignStartedId' });
UserCampaignVideos.belongsTo(UserCampaignsStarted, { foreignKey: 'userCampaignStartedId' });

Video.hasMany(UserCampaignVideos, { foreignKey: 'videoId' });
UserCampaignVideos.belongsTo(Video, { foreignKey: 'videoId' , onDelete: 'CASCADE' });

module.exports = UserCampaignVideos;
