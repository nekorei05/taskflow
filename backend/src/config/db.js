require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Serverless-safe connection caching for Vercel
let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) {
    logger.info('✓ Using cached MongoDB connection');
    return cachedConnection;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    const connection = await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 (prevents IPv6 issues)
    });

    cachedConnection = connection;
    
    const dbName = connection.connection.db.databaseName;
    logger.info(`✓ MongoDB database connected: ${dbName}`);
    
    return connection;
  } catch (error) {
    logger.error(`✗ Database connection error: ${error.message}`);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    if (cachedConnection) {
      await mongoose.disconnect();
      cachedConnection = null;
      logger.info('✓ MongoDB disconnected');
    }
  } catch (error) {
    logger.error(`Error disconnecting from MongoDB: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB, mongoose };
