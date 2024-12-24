const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Assuming sequelize connection is established in this file

const AnalyticsData = sequelize.define('AnalyticsData', {
  totalViews: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalCampaigns: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalWatchTime: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalLocations: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalCampaignsRunningUsers: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalUsersRunningCampaign: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  CampaignViews: {
    type: DataTypes.JSON,
    defaultValue: 0,
  },
  CampaignUsers: {
    type: DataTypes.JSON,
    defaultValue: 0,
  },
  UserViews: {
    type: DataTypes.JSON,
    defaultValue: 0,
  },
  viewsByLocation: {
    type: DataTypes.JSON,
    defaultValue: 0,
  },
  usersVsLocation: {
    type: DataTypes.JSON,
    defaultValue: 0,
  },
  currentDate: {
    type: DataTypes.STRING,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = AnalyticsData;
