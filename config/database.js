// config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('video', 'root', '12345', {
  host: 'localhost',
  dialect: 'mysql'
});

module.exports = sequelize;
