// config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('video', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});

module.exports = sequelize;
