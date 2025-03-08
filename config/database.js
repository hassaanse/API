// // config/database.js
// const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize('video', 'root', '', {
//   host: 'localhost',
//   dialect: 'mysql'
// });

// module.exports = sequelize;




const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('videos', 'admin', '<!--120Thekoi.ca-->', {
  host: 'database-1.czmq6gmyorai.eu-north-1.rds.amazonaws.com',
  dialect: 'mysql',
  port: 3306, // Default MySQL port
  logging: false, // Optional: Disable logging
  pool: {
    max: 10, // Adjust based on your needs
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;
