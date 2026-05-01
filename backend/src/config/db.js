const { Sequelize } = require('sequelize');
const path = require('path');
const logger = require('../utils/logger');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../../database.sqlite'),
  logging: (msg) => logger.debug(msg),
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('SQLite database connected');
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
