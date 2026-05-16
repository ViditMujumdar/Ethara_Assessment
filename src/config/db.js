import dns from 'dns';
import mongoose from 'mongoose';
import { config } from './index.js';
import logger from '../utils/logger.js';

// Windows/residential DNS often fails SRV lookups for mongodb+srv; public resolvers fix it.
if (process.platform === 'win32') {
  dns.setServers(['8.8.8.8', '1.1.1.1', ...dns.getServers()]);
}

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

let isConnected = false;

export const connectDB = async (retries = MAX_RETRIES) => {
  if (isConnected) return mongoose.connection;

  try {
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(config.mongodbUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    logger.info(`MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      logger.warn('MongoDB disconnected');
    });

    return conn;
  } catch (error) {
    logger.error(`MongoDB connection failed (${MAX_RETRIES - retries + 1}/${MAX_RETRIES}):`, error.message);

    if (retries > 0) {
      logger.info(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDB(retries - 1);
    }

    throw error;
  }
};

export const disconnectDB = async () => {
  if (!isConnected) return;
  await mongoose.connection.close();
  isConnected = false;
  logger.info('MongoDB connection closed gracefully');
};

export const getConnectionStatus = () => ({
  isConnected: mongoose.connection.readyState === 1,
  readyState: mongoose.connection.readyState,
  host: mongoose.connection.host,
  name: mongoose.connection.name,
});

export default connectDB;
