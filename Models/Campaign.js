const { DataTypes, Model, DATEONLY } = require('sequelize');
const sequelize = require('../config/database');

class Campaign extends Model {}

Campaign.init({
  campaignId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  campaignName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tags: {
    type: DataTypes.STRING,
    allowNull: true
  },
  watchTime:{
    type: DataTypes.INTEGER,
    allowNull:true,
    defaultValue: 0
    
  },
  Active:{
    type:DataTypes.BOOLEAN,
    defaultValue:false
  },
  views:{
    type:DataTypes.INTEGER,
    allowNull:true,
    defaultValue: 0
  },
  endDate: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Campaign'
});

module.exports = Campaign;
