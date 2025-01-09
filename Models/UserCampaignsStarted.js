const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const UserR = require('./UserR'); // Import the UserR model
const Campaign = require('./Campaign');

const UserCampaignsStarted = sequelize.define('UserCampaignsStarted', {
  userCampaignStartedId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
},
  watchDuration: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  campaignId: {
    type: DataTypes.INTEGER,
    references: {
      model: Campaign, // Reference the Campaign model
      key: 'campaignId', // Assuming 'campaignId' is the primary key of Campaign
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: UserR, // Reference the UserR model
      key: 'id', // Assuming 'id' is the primary key of UserR
    },
  },
});

// Define associations
UserR.hasMany(UserCampaignsStarted, { foreignKey: 'userId' });
UserCampaignsStarted.belongsTo(UserR, { foreignKey: 'userId' });

Campaign.hasMany(UserCampaignsStarted, { foreignKey: 'campaignId' });
UserCampaignsStarted.belongsTo(Campaign, { foreignKey: 'campaignId' });

module.exports = UserCampaignsStarted;
